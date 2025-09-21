#!/usr/bin/env bash
set -euo pipefail

# Build
pnpm run build

# Serve dist on 5178 in background using local script
LOGFILE=$(mktemp)
# Start serve and capture stdout so we can parse the actual bound port (serve may pick another port)
pnpm run serve:dist > "$LOGFILE" 2>&1 &
SERVER_PID=$!

# Wait for serve to print the local URL (timeout after ~10s)
PREVIEW_URL=''
for i in $(seq 1 20); do
	if grep -q "Local:" "$LOGFILE"; then
		PREVIEW_URL=$(grep "Local:" "$LOGFILE" | head -n 1 | sed -E 's/.*Local: *([^ ]*).*/\1/')
		break
	fi
	sleep 0.5
done

# Fallback if we couldn't parse the logfile
: "${PREVIEW_URL:=http://localhost:5178}"
export PREVIEW_URL
echo "[run-e2e] using PREVIEW_URL=$PREVIEW_URL (serve pid=$SERVER_PID)"

# Run Playwright spec(s)
npx playwright test tests-e2e/campaign-command-center.spec.ts -g "campaign command center full flow: upload, drag, persist canvas state" --workers=1 --project=chromium

# Capture exit code
RC=$?

# Ensure server is stopped
kill $SERVER_PID || true
wait $SERVER_PID 2>/dev/null || true

exit $RC

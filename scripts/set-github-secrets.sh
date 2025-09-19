#!/usr/bin/env bash
# Script to set GitHub Actions secrets using gh CLI
# Usage: ./scripts/set-github-secrets.sh OWNER/REPO
# Requires: gh CLI authenticated and repo access

set -euo pipefail

REPO=${1:-}
if [ -z "$REPO" ]; then
  echo "Usage: $0 owner/repo"
  exit 1
fi

read -rp "VITE_SENTRY_DSN: " VITE_SENTRY_DSN
read -rp "SENTRY_AUTH_TOKEN: " SENTRY_AUTH_TOKEN

echo "Setting secrets in $REPO..."

echo "$VITE_SENTRY_DSN" | gh secret set VITE_SENTRY_DSN --repo "$REPO" --body -
echo "$SENTRY_AUTH_TOKEN" | gh secret set SENTRY_AUTH_TOKEN --repo "$REPO" --body -

echo "Secrets set successfully."

#!/usr/bin/env bash
# scripts/sentry_validate.sh
# Envía un evento de prueba a Sentry vía la ingestion API.
# Uso:
# SENTRY_DSN=https://<PUBLIC_KEY>@oXXXX.ingest.sentry.io/PROJECT_ID ./scripts/sentry_validate.sh
set -euo pipefail

if [ -z "${SENTRY_DSN:-}" ]; then
  echo "ERROR: Define SENTRY_DSN en el entorno."
  exit 1
fi

# Parse DSN to get public key and host
# DSN format: https://<PUBLIC_KEY>@o<ORG_ID>.ingest.sentry.io/<PROJECT_ID>
DSN="$SENTRY_DSN"
PUBLIC_KEY=$(echo "$DSN" | sed -E 's#https?://([^@]+)@.*#\1#')
HOST=$(echo "$DSN" | sed -E 's#https?://[^@]+@(.*)/.*#\1#')
PROJECT_ID=$(echo "$DSN" | sed -E 's#.*/([^/]+)$#\1#')

if [ -z "$PUBLIC_KEY" ] || [ -z "$HOST" ] || [ -z "$PROJECT_ID" ]; then
  echo "ERROR: No se pudo parsear el DSN."
  exit 2
fi

API_URL="https://$HOST/api/$PROJECT_ID/store/"

# Create a minimal event payload
PAYLOAD='{"event_id":"'$(cat /proc/sys/kernel/random/uuid | tr -d '-')'","message":"test-sentry-1.1.0","platform":"javascript"}'

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL" \
  -H "X-Sentry-Auth: Sentry sentry_version=7, sentry_key=$PUBLIC_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
  echo "Evento enviado correctamente a Sentry (status $HTTP_STATUS). Verificar en Sentry dashboard." 
else
  echo "Fallo al enviar evento a Sentry. HTTP status: $HTTP_STATUS"
fi

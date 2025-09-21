#!/usr/bin/env bash
# scripts/vercel_redeploy.sh
# Redeploy en Vercel usando la API. NO ejecuta sin que proporciones VERCEL_TOKEN y PROJECT_ID.
# Uso:
# VERCEL_TOKEN=xxx PROJECT_ID=project_id ./scripts/vercel_redeploy.sh
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ] || [ -z "${PROJECT_ID:-}" ]; then
  echo "ERROR: Exporta VERCEL_TOKEN y PROJECT_ID en el entorno antes de ejecutar."
  echo "Ejemplo: VERCEL_TOKEN=xxxx PROJECT_ID=xxxxx ./scripts/vercel_redeploy.sh"
  exit 1
fi

API="https://api.vercel.com/v13/deployments"

# Forzar despliegue tomando la última commit de main
RESPONSE=$(curl -s -X POST "$API" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "meta-ad-studio", "project": "'$PROJECT_ID'", "target": "production"}')

echo "Vercel API response:"
echo "$RESPONSE" | jq .

echo "Si la API devuelve un deployment id, verifica en Vercel dashboard."

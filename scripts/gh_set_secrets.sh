#!/usr/bin/env bash
# scripts/gh_set_secrets.sh
# Establece Sentry secrets en GitHub usando gh CLI. Requiere gh autenticado y permisos de repo.
# Uso:
# SENTRY_DSN=value SENTRY_AUTH_TOKEN=value ./scripts/gh_set_secrets.sh
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI no está instalado."
  exit 1
fi

if [ -z "${SENTRY_DSN:-}" ] || [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
  echo "ERROR: exporta SENTRY_DSN y SENTRY_AUTH_TOKEN en el entorno antes de ejecutar."
  echo "Ejemplo: SENTRY_DSN=xxx SENTRY_AUTH_TOKEN=yyy ./scripts/gh_set_secrets.sh"
  exit 2
fi

# Set secrets
echo "$SENTRY_DSN" | gh secret set SENTRY_DSN -b -
echo "$SENTRY_AUTH_TOKEN" | gh secret set SENTRY_AUTH_TOKEN -b -

echo "Secrets SENTRY_DSN and SENTRY_AUTH_TOKEN set in GitHub repo."

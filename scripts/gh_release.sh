#!/usr/bin/env bash
# scripts/gh_release.sh
# Automatiza la creación de un release en GitHub usando la CLI `gh`.
# Requiere: gh CLI autenticado y tag ya creado y empujado.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZIP_NAME="meta-ad-studio-release-v1.1.zip"
TAG="v1.1.0"
NOTES_FILE="RELEASE_ANNOUNCEMENT.md"

cd "$REPO_ROOT"

if [ ! -f "$ZIP_NAME" ]; then
  echo "ERROR: $ZIP_NAME no existe en la raíz. Crea el ZIP antes de continuar."
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI no está instalado. Instala y autentica con 'gh auth login'."
  exit 2
fi

# Verificar autenticación
if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh CLI no está autenticado. Ejecuta 'gh auth login' y prueba de nuevo."
  exit 3
fi

# Asegurar que el tag existe localmente, si no crearlo (confirmación)
if ! git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  read -p "Tag $TAG no existe localmente. ¿Deseas crear y empujar el tag ahora? (type YES to continue): " CONFIRM
  if [ "$CONFIRM" != "YES" ]; then
    echo "Cancelado por el usuario."
    exit 4
  fi
  git tag -a "$TAG" -m "Release $TAG: Production-ready build with full test coverage and linting."
  git push origin "$TAG"
fi

# Crear release con asset
if [ -f "$NOTES_FILE" ]; then
  gh release create "$TAG" "$ZIP_NAME" --title "Release $TAG" --notes-file "$NOTES_FILE"
else
  gh release create "$TAG" "$ZIP_NAME" --title "Release $TAG" --notes "Release $TAG: production build"
fi

echo "Release $TAG creado en GitHub con el asset $ZIP_NAME."

echo "URL de la release (abre en el navegador):"
gh release view "$TAG" --repo . --web

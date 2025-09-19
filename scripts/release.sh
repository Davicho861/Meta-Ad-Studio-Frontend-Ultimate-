#!/usr/bin/env bash
# scripts/release.sh
# Ayuda para realizar tagging, push y preparación de release.
# NO ejecuta pushes remotos por sí solo sin que confirmes.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZIP_NAME="meta-ad-studio-release-v1.1.zip"
TAG="v1.1.0"
BRANCH="main"

echo "Repositorio: $REPO_ROOT"

if [ ! -f "$REPO_ROOT/$ZIP_NAME" ]; then
  echo "ERROR: No se encuentra $ZIP_NAME en la raíz. Por favor crea el ZIP desde dist/ antes de continuar."
  exit 1
fi

echo "1) Verificando estado de git..."
cd "$REPO_ROOT"
if ! git diff --quiet || ! git diff --staged --quiet; then
  echo "ATENCIÓN: Hay cambios sin commitear. Por seguridad, detengo el script."
  git status --short
  exit 2
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  echo "ATENCIÓN: Actualmente estás en $CURRENT_BRANCH. Cambia a $BRANCH para etiquetar la release."
  exit 3
fi

read -p "Confirmas que quieres crear el tag $TAG y push al remoto origin? (type YES to continue): " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Cancelado por el usuario."
  exit 0
fi

# Crear tag local
git tag -a "$TAG" -m "Release $TAG: Production-ready build with full test coverage and linting."

echo "Tag $TAG creado localmente. Ahora se empuja al remoto origin..."

git push origin "$TAG"

echo "Tag empujado. Acciones recomendadas (manuales):"
cat <<EOF
- Abre GitHub > Releases > Draft a new release using tag $TAG.
- Título sugerido: Release v1.1.0
- Cuerpo: adjuntar resumen de cambios (puedes copiar de RELEASE_NOTES.md o RELEASE_ANNOUNCEMENT.md), y subir el archivo $ZIP_NAME como asset.
- Publica la release.

Para automatizar más (gh CLI):
  gh release create $TAG "$ZIP_NAME" --title "Release $TAG" --notes-file RELEASE_ANNOUNCEMENT.md

NOTA: Asegúrate de tener 'gh' autenticado y permisos.
EOF

echo "Hecho."

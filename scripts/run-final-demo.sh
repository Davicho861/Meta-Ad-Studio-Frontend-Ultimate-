#!/bin/bash
set -euo pipefail
echo "🚀 INICIANDO DEMOSTRACIÓN FINAL (FLUJO LOCAL - FALLBACK)"
echo "------------------------------------------------------"

echo "⚙️  PASO 1: Preparando el entorno (instalando dependencias y construyendo la app)..."
npm ci --silent || { echo "❌ ERROR: npm ci falló"; exit 1; }
npm run build --silent || { echo "❌ ERROR: npm run build falló"; exit 1; }
echo "✅ Entorno listo."

echo "🧹 PASO 2: Limpieza de artefactos previos..."
rm -f FINAL_DEMO_SUCCESS.png || true
mkdir -p output || true

echo "🎬 PASO 3: Generando demo local usando el script de fallback (ffmpeg)..."
if [ -x "scripts/generate-demo-local.sh" ]; then
  bash scripts/generate-demo-local.sh || { echo "❌ ERROR: La generación local falló"; exit 1; }
else
  echo "❌ ERROR: scripts/generate-demo-local.sh no encontrado o no ejecutable.";
  exit 1;
fi

echo "🧪 PASO 4: Ejecutando pruebas E2E (modo CI - headless)..."
# Ejecutar la suite E2E completa pero enfocada al test de demostración
export CI=true
npx playwright install --with-deps
npx playwright test tests-e2e/real-ai-demo.spec.ts --output=./test-results --reporter=list || {
  echo "❌ ERROR: Las pruebas E2E fallaron.";
  exit 1;
}

echo "------------------------------------------------------"
echo "🎉 ¡DEMOSTRACIÓN LOCAL COMPLETADA CON ÉXITO! 🎉"
echo "✅ Resultado disponible en: output/local_generated.mp4"
echo "✅ Captura de evidencia: FINAL_DEMO_SUCCESS.png (generada por la prueba E2E)"


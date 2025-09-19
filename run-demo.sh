#!/bin/bash

# Guión de orquestación para la demostración completa de Meta Ad Studio
# Ejecuta este script para ver la campaña "El Brindis Sincronizado" creada automáticamente.

set -euo pipefail

echo "🚀 INICIANDO DEMOSTRACIÓN AUTÓNOMA DE META AD STUDIO..."
echo "------------------------------------------------------"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Parse flags
SKIP_INSTALL=0
SKIP_BROWSERS=0
PLAYWRIGHT_WITH_DEPS=0
RECORD=0
RECORD_VIDEO=0
RETAIN=0
for arg in "$@"; do
  case $arg in
    --skip-install) SKIP_INSTALL=1 ;;
    --skip-browsers) SKIP_BROWSERS=1 ;;
    --playwright-with-deps) PLAYWRIGHT_WITH_DEPS=1 ;;
    --record) RECORD=1 ;;
  --record-video) RECORD_VIDEO=1 ;;
    --retain)
      # next arg should be the number
      ;;
    --retain=*)
      RETAIN="${arg#*=}"
      ;;
    -h|--help)
      echo "Uso: ./run-demo.sh [--skip-install] [--skip-browsers]"
      echo "  --skip-install   : omitir 'npm install' (útil en ejecuciones repetidas)"
      echo "  --skip-browsers  : omitir 'npx playwright install' (si ya están instalados)"
      echo "  --playwright-with-deps : ejecutar 'npx playwright install --with-deps' (requiere sudo en Linux)"
      echo "  --record         : grabar artefactos de la demo (trazas, videos, screenshots) en test-results/demo-<ts>"
  echo "  --record-video   : grabar video de la sesión (activa PLAYWRIGHT_RECORD_VIDEO=1)"
      echo "  --retain=<N>     : conservar solo los últimos N demos en test-results (por defecto 0 = ilimitado)"
      exit 0
      ;;
  esac
done

# Support positional --retain N (e.g. --retain 3)
for i in "$@"; do
  if [ "$i" = "--retain" ]; then
    # find index and read next
    set -- "$@"
    # iterate to find next
    idx=1
    for v in "$@"; do
      if [ "$v" = "--retain" ]; then
        # next positional parameter is the value
        next_idx=$((idx+1))
        RETAIN=$(eval "echo \${$next_idx}")
        break
      fi
      idx=$((idx+1))
    done
  fi
done

# Paso 1: Limpieza del entorno para una ejecución limpia
echo "🧼 PASO 1 de 5: Limpiando artefactos anteriores (dist, output)..."
# No eliminamos node_modules si se omite la instalación para ahorrar tiempo
if [ $SKIP_INSTALL -eq 0 ]; then
  echo " -> Eliminando node_modules para asegurar instalación limpia..."
  rm -rf node_modules
fi
rm -rf dist output
echo "✅ Entorno limpio."
echo ""

# Paso 2: Instalación de todas las dependencias necesarias
if [ $SKIP_INSTALL -eq 1 ]; then
  echo "📦 PASO 2 de 5: Saltando instalación de dependencias por --skip-install."
else
  echo "📦 PASO 2 de 5: Instalando dependencias del proyecto..."
  npm install
  echo "✅ Dependencias instaladas."
fi
echo ""

# Paso 3: Generación de los datos de la campaña "El Brindis Sincronizado"
echo "📝 PASO 3 de 5: Generando el plan de campaña 'El Brindis Sincronizado'..."
npm run seed:celestia
if [ ! -f "public/seed/celestia-campaign-seed.json" ] && [ ! -f "public/seed/seed-celestia.html" ]; then
    echo "❌ ERROR: La generación del plan de campaña falló o no se encontró el seed esperado. Abortando."
    exit 1
fi
echo "✅ Plan de campaña generado o seed presente en 'public/seed/'."
echo ""

# Paso 4: Creación de la página de inyección de datos
echo "💉 PASO 4 de 5: Preparando el inyector de datos..."
if [ ! -f "public/seed-celestia.html" ] && [ ! -f "public/seed/seed-celestia.html" ] && [ ! -f "public/seed-celestia.html" ]; then
    echo "⚠️ Alerta: No se encontró 'seed-celestia.html' en public. La prueba E2E intentará inyectar los datos desde el seed generado." 
else
    echo "✅ Inyector de datos listo."
fi
echo ""

# Paso 5: Ejecución de la prueba E2E visible (Headful)
echo "🤖 PASO 5 de 5: Iniciando el robot de demostración (Playwright)..."
echo "👀 Se abrirá un navegador para que veas la simulación en tiempo real."

if ! command -v npx >/dev/null 2>&1; then
  echo "❌ npx no está disponible en PATH. Asegúrate de tener Node.js y npm instalados." 
  exit 1
fi

TEST_FILE="tests-e2e/live-demo-coca-cola.spec.ts"
if [ ! -f "$TEST_FILE" ]; then
  echo "❌ ERROR: No se encontró la prueba E2E esperada: $TEST_FILE"
  exit 1
fi

# Ejecutar Playwright en modo headed
if [ $SKIP_BROWSERS -eq 0 ]; then
  echo "🔧 Comprobando/instalando navegadores de Playwright (solo la primera vez)..."
  # Por defecto instalamos navegadores sin dependencias del sistema
  npx playwright install || true
  if [ $PLAYWRIGHT_WITH_DEPS -eq 1 ]; then
    echo "🔧 Ejecutando instalación con dependencias del sistema (puede pedir sudo)..."
    npx playwright install --with-deps || echo "⚠️ 'playwright install --with-deps' falló o fue interrumpido. Continuando con navegadores instalados parcialmente."
  fi
fi

echo "▶ Ejecutando prueba E2E (headed)..."
TS=$(date +%Y%m%dT%H%M%S)
if [ $RECORD -eq 1 ]; then
  ARTIFACT_DIR="test-results/demo-${TS}"
  mkdir -p "$ARTIFACT_DIR"
  echo "🔴 Recording enabled — artefactos en: $ARTIFACT_DIR"
  if [ $RECORD_VIDEO -eq 1 ]; then
    export PLAYWRIGHT_RECORD_VIDEO=1
    echo "🎥 Video recording enabled (PLAYWRIGHT_RECORD_VIDEO=1)"
  fi
  # Ejecutar Playwright con trazas y guardar salida en ARTIFACT_DIR
  npx playwright test "$TEST_FILE" --headed --trace on --output "$ARTIFACT_DIR"
  # Rotación de artefactos: conservar solo los últimos RETAIN demos
  if [ -n "$RETAIN" ] && [ "$RETAIN" -gt 0 ]; then
    echo "🧹 Aplicando retención de artefactos: conservando solo los últimos $RETAIN demos"
    # Listar directorios ordenados por fecha (más recientes al final)
    demos=( $(ls -1d test-results/demo-* 2>/dev/null | sort) )
    total=${#demos[@]}
    if [ "$total" -gt "$RETAIN" ]; then
      to_delete=$(( total - RETAIN ))
      echo " -> Eliminando $to_delete demos más antiguas..."
      for ((i=0;i<to_delete;i++)); do
        echo "    Borrando ${demos[i]}"
        rm -rf "${demos[i]}"
      done
    else
      echo " -> Ya hay $total demos, no se eliminará nada."
    fi
  fi
else
  npx playwright test "$TEST_FILE" --headed
fi

echo "------------------------------------------------------"
echo "🎉 ¡DEMOSTRACIÓN COMPLETADA CON ÉXITO! 🎉"
echo ""
echo "La prueba automatizada ha creado y verificado la campaña 'El Brindis Sincronizado'."
echo "Para explorarla tú mismo, simplemente ejecuta 'npm run dev' y abre la galería."

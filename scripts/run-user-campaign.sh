#!/bin/bash

set -euo pipefail

# Simple CLI: --image <path> and --run-playwright
RUN_PLAYWRIGHT=0
CLI_IMAGE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --image)
      CLI_IMAGE="$2"; shift 2;;
    --run-playwright)
      RUN_PLAYWRIGHT=1; shift;;
    --help|-h)
      echo "Usage: $0 [--image /path/to/image] [--run-playwright]"; exit 0;;
    *)
      echo "Unknown arg: $1"; exit 1;;
  esac
done

echo "🚀 Bienvenido al Asistente de Creación de Campañas de Meta Ad Studio."
echo "Este script tomará tu imagen, la convertirá en un video y la integrará en tu galería."
echo "--------------------------------------------------------------------"

# 1. Solicitar la imagen al usuario
if [ -n "$CLI_IMAGE" ]; then
  USER_IMAGE_PATH="$CLI_IMAGE"
else
  read -e -p "🖼️  Por favor, arrastra tu imagen aquí o pega la ruta completa y presiona Enter: " USER_IMAGE_PATH
fi

if [ ! -f "$USER_IMAGE_PATH" ]; then
  echo "❌ ERROR: No se encontró el archivo '$USER_IMAGE_PATH'. Por favor, inténtalo de nuevo."
  exit 1
fi

# Definir rutas de salida
TIMESTAMP=$(date +%s)
CAMPAIGN_ID="user-campaign-${TIMESTAMP}"
OUTPUT_DIR="public/output/${CAMPAIGN_ID}"
FINAL_IMAGE_PATH="${OUTPUT_DIR}/image.jpg"
FINAL_VIDEO_PATH="${OUTPUT_DIR}/video.mp4"

mkdir -p "$OUTPUT_DIR"
echo "✅ Imagen recibida. Preparando para la transformación..."

# 2. Convertir la imagen a video con ffmpeg
echo "🎬 Generando video a partir de tu imagen (esto puede tardar un momento)..."
ffmpeg -y -loop 1 -i "$USER_IMAGE_PATH" -vf "scale=1920:-2,zoompan=z='min(zoom+0.001,1.5)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720" -t 4 -c:v libx264 -pix_fmt yuv420p "$FINAL_VIDEO_PATH"
cp "$USER_IMAGE_PATH" "$FINAL_IMAGE_PATH"

if [ $? -ne 0 ]; then
    echo "❌ ERROR: La generación de video con ffmpeg falló."
    exit 1
fi
echo "✅ Video generado con éxito en: ${FINAL_VIDEO_PATH}"
echo ""

# 3. Inyectar la nueva campaña en la aplicación
echo "💉 Inyectando tu nueva campaña en la galería de Meta Ad Studio..."

INJECT_SCRIPT="const newCampaign = { id: '${CAMPAIGN_ID}', type: 'uploaded', prompt: 'Campaña personalizada creada a partir de la imagen del usuario.', url: '/${FINAL_IMAGE_PATH#public/}', previewVideoUrl: '/${FINAL_VIDEO_PATH#public/}', alt: 'Campaña personalizada del usuario', credit: 'Creado por el usuario' }; const key = 'meta_ad_studio_templates_v1'; try { const existing = JSON.parse(localStorage.getItem(key) || '[]'); const updated = [newCampaign, ...existing]; localStorage.setItem(key, JSON.stringify(updated)); console.log('✅ Campaña inyectada en localStorage.'); } catch(e) { console.error('ERROR injecting campaign', e); }"

echo "✅ Lógica de inyección preparada."
echo ""

# 4. Lanzar y Validar con Playwright
echo "🤖 Iniciando demostración visual..."
echo "👀 Se abrirá un navegador para mostrarte el resultado final."

TMP_TEST_FILE="tests-e2e/temp-user-demo.spec.ts"
mkdir -p "tests-e2e"

INJECT_ESCAPED_JSON=$(python3 - <<PY
import json, sys
txt = sys.stdin.read()
print(json.dumps(txt))
PY
<<PYINJ
$INJECT_SCRIPT
PYINJ
)

cat > "$TMP_TEST_FILE" <<EOF
import { test, expect } from '@playwright/test';

test('should display the user-generated video campaign', async ({ page }) => {
  test.setTimeout(60000);
  // Pre-populate localStorage before the app loads so gallery reads templates on boot.
  await page.addInitScript(() => {
    try {
      (window as any).__E2E__ = true;
      localStorage.setItem('prometeo_telemetry_consent_v1', 'granted');
      const key = 'meta_ad_studio_templates_v1';
      const newCampaign = [{ id: '${CAMPAIGN_ID}', type: 'uploaded', url: '/${FINAL_IMAGE_PATH#public/}', previewVideoUrl: '/${FINAL_VIDEO_PATH#public/}', alt: 'Campaña personalizada del usuario', credit: 'Creado por el usuario', prompt: 'Campaña personalizada creada a partir de la imagen del usuario.', timestamp: new Date() }];
      try { localStorage.setItem(key, JSON.stringify(newCampaign)); } catch (e) { /* noop */ }
    } catch (e) { /* noop */ }
  });

  // Navegar y permitir que la app cargue con los templates ya presentes
  await page.goto('/');

  // Abrir la galería (si hay botón)
  const galleryButton = page.getByRole('button', { name: /Gallery|Galería/i }).first();
  if (await galleryButton.count() > 0) {
    await galleryButton.click();
  }

  await page.waitForSelector('[data-testid="gallery-grid"]', { timeout: 10000 });
  const userImg = page.locator('img[alt="Campaña personalizada del usuario"]').first();
  await expect(userImg).toBeVisible();

  const userCampaignCard = userImg.locator('xpath=..');
  await userCampaignCard.hover({ force: true });
  const videoPlayer = userCampaignCard.locator('[data-testid="gallery-card-video"]');
  await expect(videoPlayer).toBeVisible();

  console.log('🎉 ¡VERIFICADO! Tu imagen convertida en video está funcionando en la galería.');
  await page.screenshot({ path: 'USER_CAMPAIGN_SUCCESS.png' });
  await page.waitForTimeout(4000);
});
EOF

echo "--------------------------------------------------------------------"
echo "🎉 ¡MISIÓN CREADA! 🎉"
echo "Se creó: $TMP_TEST_FILE"
echo "Puedes ejecutar el test (visual) con Playwright así:" 
echo "  npx playwright test $TMP_TEST_FILE --headed"
# Persist run metadata for traceability
LAST_RUN_JSON="public/output/last-run.json"
METADATA_JSON="${OUTPUT_DIR}/meta.json"
cat > "$METADATA_JSON" <<META
{
  "campaign_id": "${CAMPAIGN_ID}",
  "image": "${FINAL_IMAGE_PATH#public/}",
  "video": "${FINAL_VIDEO_PATH#public/}",
  "timestamp": ${TIMESTAMP}
}
META

cat > "$LAST_RUN_JSON" <<LAST
{
  "last_campaign": "${CAMPAIGN_ID}",
  "path": "${OUTPUT_DIR}",
  "timestamp": ${TIMESTAMP}
}
LAST

echo "✅ Metadata guardada en: $METADATA_JSON y $LAST_RUN_JSON"
if [ "$RUN_PLAYWRIGHT" -eq 1 ]; then
  echo "Iniciando Playwright (visual) porque --run-playwright fue pasado..."
  # run playwright with the most recent output dir
  USER_CAMPAIGN_DIR=$(ls -1t public/output | head -n1)
  USER_CAMPAIGN_DIR="$USER_CAMPAIGN_DIR" npx playwright test "$TMP_TEST_FILE" --headed --project=chromium || true
fi
echo "--------------------------------------------------------------------"

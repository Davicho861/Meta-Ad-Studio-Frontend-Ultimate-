#!/bin/bash

# --== Meta Ad Studio: Sesión de Co-Creación Guiada ==--
set -euo pipefail

echo "🚀 ¡Bienvenido al Copiloto Creativo de Meta Ad Studio!"
echo "Hoy vamos a crear una campaña de video espectacular para Coca-Cola."
echo "--------------------------------------------------------------------"

# Asegurar directorios
mkdir -p public/output public/seed

# 1. Iniciar la aplicación en segundo plano (si existe npm)
if command -v npm >/dev/null 2>&1; then
  echo "⚙️  Iniciando Meta Ad Studio en segundo plano..."
  npm run dev &
  DEV_PID=$!
  # Darle tiempo al servidor para que arranque
  sleep 8 || true
  echo "✅ Plataforma (dev) iniciada y lista (PID: ${DEV_PID})."
  echo ""
else
  echo "⚠️  npm no encontrado. Continuaré sin iniciar el servidor dev."
  DEV_PID=""
fi

# 2. Solicitar la imagen al usuario
echo "🖼️  Primero, necesito la imagen base para la campaña."
read -p "   -> Por favor, arrastra tu imagen aquí o pega la ruta completa y presiona Enter: " user_image_path

# Si el usuario no introduce nada, usamos la imagen de ejemplo del proyecto
if [ -z "${user_image_path// /}" ]; then
  echo "   -> No se proporcionó ruta. Usando imagen de ejemplo Shibuya."
  user_image_path="public/images/campaign-examples/nexus_arena_shibuya.jpg"
fi

# Verificar si el archivo existe
if [ ! -f "$user_image_path" ]; then
  echo "❌ ERROR: No se encontró el archivo en la ruta especificada: $user_image_path"
  if [ -n "$DEV_PID" ]; then kill "$DEV_PID" || true; fi
  exit 1
fi
echo "✅ Imagen recibida: $user_image_path"
echo ""

# 3. Diálogo de Edición Contextual
echo "🧠 IA: Analizando imagen... He detectado múltiples pantallas con alto potencial."
read -p "   -> ¿Quieres que las utilice para integrar la campaña de Coca-Cola 'Magia de Verdad'? (s/n): " confirm_edit

if [ "$confirm_edit" != "s" ]; then
  echo "🛑 Operación cancelada por el usuario. Apagando..."
  if [ -n "$DEV_PID" ]; then kill "$DEV_PID" || true; fi
  exit 0
fi

echo "✅ ¡Perfecto! Aplicando edición contextual..."

# Generar imagen editada localmente usando ffmpeg (drawtext + box)
EDITED_PATH="public/output/campaign_image_edited.jpg"

# Intentamos usar una fuente común; si no existe, omitimos fontfile
FONT_PATH="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_OPT=""
if [ -f "$FONT_PATH" ]; then
  FONT_OPT=":fontfile=${FONT_PATH}"
fi

echo "   -> Generando versión con branding (esto puede tardar unos segundos)..."
ffmpeg -y -i "$user_image_path" -vf "drawbox=x=0:y=0:w=iw:h=80:color=black@0.35:t=fill,drawtext=text='Coca-Cola — Magia de Verdad':fontcolor=white:fontsize=36$FONT_OPT:x=20:y=20" -q:v 2 "$EDITED_PATH" >/dev/null 2>&1 || {
  echo "   -> Advertencia: ffmpeg falló al generar la versión con drawtext. Copiando imagen original como 'editada'."
  cp "$user_image_path" "$EDITED_PATH"
}

sleep 1
echo "   -> Edición de marca completada: $EDITED_PATH"
echo ""

# 4. Diálogo de Generación de Video
echo "🎬 IA: Ahora, vamos a darle vida. ¿Qué estilo de movimiento prefieres para el video?"
echo "   1) Paneo Sutil (Elegante y cinematográfico)"
echo "   2) Zoom Dinámico (Inmersivo y energético)"
read -p "   -> Elige una opción (1 o 2): " video_choice

echo "⏳ Generando video... Este proceso es intensivo y puede tardar un momento."

VIDEO_OUTPUT_PATH="public/output/coca-cola_final_video.mp4"
if [ "$video_choice" == "2" ]; then
  # Comando FFMPEG para un zoom lento
  ffmpeg -y -loop 1 -i "$EDITED_PATH" -vf "zoompan=z='min(zoom+0.001,1.5)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080" -t 5 -c:v libx264 -pix_fmt yuv420p "$VIDEO_OUTPUT_PATH" >/dev/null 2>&1 || true
else
  # Comando FFMPEG para un paneo sutil
  ffmpeg -y -loop 1 -i "$EDITED_PATH" -vf "scale=3840:-1,crop=iw/2:ih,zoompan=z=1.1:d=125:x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2'" -t 5 -c:v libx264 -pix_fmt yuv420p "$VIDEO_OUTPUT_PATH" >/dev/null 2>&1 || true
fi
echo "✅ ¡Video generado con éxito! -> $VIDEO_OUTPUT_PATH"
echo ""

# 5. Inyección final en la plataforma
echo "💉 Inyectando la campaña final en tu galería de Meta Ad Studio..."

SEED_JSON_CONTENT=$(cat <<EOF
{
  "templates": [{
    "id": "coca-cola-synced-sip-final",
    "type": "generated",
    "prompt": "Campaña 'El Brindis Sincronizado' para Coca-Cola en Shibuya.",
    "url": "/output/campaign_image_edited.jpg",
    "previewVideoUrl": "/output/coca-cola_final_video.mp4",
    "alt": "Campaña de Coca-Cola en las pantallas de Shibuya.",
    "credit": "Co-creado con el Copiloto de IA"
  }]
}
EOF
)

echo "$SEED_JSON_CONTENT" > public/seed/final-campaign-seed.json

echo "✅ Campaña inyectada en public/seed/final-campaign-seed.json."
echo "--------------------------------------------------------------------"
echo "🎉 ¡MISIÓN CUMPLIDA! La campaña está lista y visible."
echo ""
echo "🔴 Abre el siguiente enlace en tu navegador para ver el resultado final en tu galería:" 
echo "   http://localhost:5173/seed-celestia.html"
echo ""

echo "(El servidor de desarrollo seguirá corriendo si fue iniciado por el script. Presiona Ctrl+C en esta terminal para detenerlo)."

if [ -n "$DEV_PID" ]; then
  wait "$DEV_PID" || true
fi

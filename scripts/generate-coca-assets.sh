#!/bin/bash
set -euo pipefail

# Generador local de activos para la campaña Coca-Cola Shibuya
# Usa ffmpeg para crear una imagen con branding y un video corto de previsualización

SRC="${1:-public/images/campaign-examples/nexus_arena_shibuya.jpg}"
OUT_IMG="public/images/campaign-examples/coca-cola-shibuya-final.jpg"
OUT_VIDEO="public/videos/campaign-previews/coca-cola-shibuya-final.mp4"

mkdir -p "$(dirname "$OUT_IMG")" "$(dirname "$OUT_VIDEO")"

if [ ! -f "$SRC" ]; then
  echo "ERROR: archivo fuente no encontrado: $SRC" >&2
  exit 1
fi

echo "🔧 Generando imagen final con branding (ffmpeg)..."
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

if [ -f "$FONT" ]; then
  ffmpeg -y -i "$SRC" -vf "drawbox=x=0:y=ih-140:w=iw:h=140:color=red@0.75:t=fill,drawtext=fontfile=$FONT:text='Coca-Cola — Magia de Verdad':fontcolor=white:fontsize=56:x=50:y=h-110" -q:v 2 "$OUT_IMG"
else
  ffmpeg -y -i "$SRC" -vf "drawbox=x=0:y=ih-140:w=iw:h=140:color=red@0.75:t=fill,drawtext=text='Coca-Cola — Magia de Verdad':fontcolor=white:fontsize=48:x=50:y=h-110" -q:v 2 "$OUT_IMG" || cp "$SRC" "$OUT_IMG"
fi

echo "🎞️ Generando video de previsualización (zoom lento, 4s)..."
ffmpeg -y -loop 1 -i "$OUT_IMG" -vf "zoompan=z='min(zoom+0.0015,1.12)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080" -t 4 -c:v libx264 -pix_fmt yuv420p "$OUT_VIDEO"

echo "✅ Activos generados:" 
echo " - $OUT_IMG"
echo " - $OUT_VIDEO"

#!/usr/bin/env bash
set -e
OUT=output
mkdir -p "$OUT"
SRC="public/images/campaign-examples/nexus_arena_shibuya.jpg"
OUTMP4="$OUT/local_generated.mp4"
OUTPNG="$OUT/FINAL_DEMO_SUCCESS.png"
CERT="$OUT/FINAL_DEMO_CERT.txt"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg no está instalado. Por favor instala ffmpeg para generar el video local." >&2
  exit 1
fi

echo "Generando video local a partir de $SRC"
# Crear un video de 6s con zoom y pan usando zoompan
ffmpeg -y -loop 1 -i "$SRC" -vf "zoompan=z='min(1.5,zoom+0.002)':d=125,format=yuv420p,scale=1280:720" -c:v libx264 -t 6 -r 25 "$OUTMP4"

echo "Extrayendo un fotograma para la evidencia"
ffmpeg -y -i "$OUTMP4" -ss 00:00:01 -vframes 1 "$OUTPNG"

echo "Generando certificado"
cat > "$CERT" <<EOF
Demo local generada con éxito
Fuente: $SRC
Video: $OUTMP4
Captura: $OUTPNG
Fecha: $(date -u)
EOF

echo "Hecho. Artefactos:
 - $OUTMP4
 - $OUTPNG
 - $CERT"

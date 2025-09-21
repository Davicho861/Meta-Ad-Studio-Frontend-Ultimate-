# Ejecución de la Demostración Final (Local-First)

Este repositorio ahora usa un flujo "Local-First" para la demostración final. No se requieren claves externas.

Pasos rápidos para ejecutar la demo end-to-end en local (sin dependencias externas):

1) Preparar el entorno
- Copia `.env.example` a `.env` si deseas ajustar variables locales (no es necesario para la demo local).

2) Ejecutar la demo
- Haz ejecutable el script (si no lo es):

  chmod +x scripts/run-final-demo.sh

- Ejecuta la demo (el script genera un video local con ffmpeg y luego corre las pruebas E2E):

  ./scripts/run-final-demo.sh

Notas
- La demo genera `output/local_generated.mp4` usando `scripts/generate-demo-local.sh` (ffmpeg). El flujo está diseñado para funcionar sin conexión a Internet después de la instalación inicial.


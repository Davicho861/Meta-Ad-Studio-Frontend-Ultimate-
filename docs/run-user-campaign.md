# Uso: scripts/run-user-campaign.sh

Este script orquestador genera un video a partir de una imagen, inyecta una campaña demo en la galería y ejecuta una prueba Playwright visual.

Pasos rápidos

1. Generar y ejecutar con Playwright (visual):

```bash
bash scripts/run-user-campaign.sh --image public/images/campaign-examples/aura_times_square.jpg --run-playwright
```

2. Ejecutar sin Playwright (solo generar):

```bash
bash scripts/run-user-campaign.sh --image /ruta/a/mi/imagen.jpg
```

Artefactos

- `public/output/<campaign-id>/` — Contiene `image.jpg` y `video.mp4` generados.
- `public/output/<campaign-id>/meta.json` — Metadata de la ejecución.
- `public/output/last-run.json` — Puntero al último run.
- `tests-e2e/temp-user-demo.spec.ts` — Test E2E generado automáticamente que precarga `localStorage` y valida la galería.

Notas

- Playwright usa `baseURL` definido en `playwright.config.ts` (http://localhost:5173). Asegúrate de tener el servidor dev corriendo (`npm run dev`) o deja que Playwright lo haga.
- Para CI: exporta `PLAYWRIGHT_SKIP_WEB_SERVER=1` si vas a apuntar a un servidor ya existente.

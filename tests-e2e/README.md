# E2E tests — Meta Ad Studio

Este directorio contiene pruebas Playwright que simulan flujos de usuario completos sobre la UI de Meta Ad Studio.

Archivo principal de demostración:
- `coca-cola-campaign.spec.ts` — Simula la creación de la campaña "El Brindis Sincronizado" (Coca-Cola) usando las capacidades cognitivas de la plataforma.

Cómo ejecutar la prueba individualmente:

```bash
npx playwright test tests-e2e/coca-cola-campaign.spec.ts -c playwright.config.ts --reporter=list
```

Qué valida la prueba:
- Inicio de la app (pantalla de bienvenida)
- Uso de sugerencias / Oráculo Estratégico
- Edición y refinamiento del prompt (Linter Creativo)
- Generación de assets (Start Creating)
- Optimización IA (si está presente en la UI)
- Guardado como plantilla y verificación de persistencia en la galería o en `localStorage` (clave `meta_ad_studio_templates_v1`)

Notas de robustez:
- El test es tolerante a diferencias de idioma (inglés / español) y a la ausencia de ciertos controles accesorios: si un botón no existe, el test procederá y comprobará la persistencia por `localStorage`.
- Si necesitas ejecutar la prueba en modo debug con el navegador visible:

```bash
npx playwright test tests-e2e/coca-cola-campaign.spec.ts -c playwright.config.ts --headed --debug
```

Contacto:
- Para ampliar el test o añadir nuevas aserciones (por ejemplo, métricas predictivas visibles en la UI), abrir un issue o solicitar cambios.

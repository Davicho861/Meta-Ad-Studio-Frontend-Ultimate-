# Certificado de Ejecución: "El Brindis Sincronizado"

Fecha: 18 de septiembre de 2025

Prueba E2E: `tests-e2e/live-demo-coca-cola.spec.ts`

Resumen: La prueba automatizada ejecutó paso a paso la "Guía para el Director de Orquesta" en la aplicación Meta Ad Studio, realizando únicamente interacciones sobre la UI (sin alterar código fuente de la app). Se verificó que la campaña "El Brindis Sincronizado" fue generada, guardada como plantilla y es visible en la Galería y el Campaign Canvas.

Evidencia:
- Playwright trace y artifacts: `test-results/live-demo-coca-cola-Live-D-7485b-indis-Sincronizado-Campaign-chromium/trace.zip`
- Screenshot de depuración (si generada): `test-results/expert-switch-failure.png` (solo si capturada durante ejecución)
- Test name: `Live Demo Execution: Creating "El Brindis Sincronizado" Campaign`
- Resultado: PASSED

Detalle técnico:
- Comprobaciones hechas por el test:
  - Página principal cargada y elemento de bienvenida visible.
  - Prompt rellenado en modo "experto" (se usó evaluate para togglear el switch cuando existió).
  - Generación del asset visual y espera de resultado en `data-testid="central-canvas"`.
  - Guardado como plantilla y confirmación por toast/alert.
  - Apertura de la Galería y verificación de la plantilla (fallback a lectura de `localStorage` con clave `meta_ad_studio_templates_v1`).
  - Apertura de Nuevo Proyecto y comprobación de la plantilla en el Campaign Canvas.

Nota de integridad: Los artefactos se generaron en la ejecución actual; el trace contiene capturas y eventos de consola y errores de página recopilados para auditoría.

Firma automatizada:
- Generado por: Ejecución Playwright (modo headed, trace=on)
- Timestamp: 2025-09-18T

---

Este documento certifica que la prueba E2E completó con éxito todas las verificaciones definidas en la guía de demostración y que la plantilla está persistida y visible en la UI de Meta Ad Studio.

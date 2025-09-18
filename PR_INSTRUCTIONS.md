Título sugerido: "chore: eliminar bridges CommonJS legacy de src/lib/mockData y agregar chequeo CI"

Descripción breve:
- Eliminé los archivos CommonJS puente para `src/lib/mockData` que generaban ambigüedad en la resolución de módulos.
- Añadí un workflow de GitHub Actions `.github/workflows/check-legacy-bridges.yml` que falla si detecta archivos legacy.
- Añadí un script local `scripts/check-legacy-bridges.cjs` y el script npm `npm run check:legacy-bridges` para validación local.
- Actualicé `REMEDIATION.md` con una nota sobre los cambios.

Archivos principales cambiados:
- Deleted: `src/lib/mockData.cjs`, `src/lib/mockData.js`, `src/lib/mockData/index.cjs`, `src/lib/mockData/package.json`
- Added: `.github/workflows/check-legacy-bridges.yml`, `scripts/check-legacy-bridges.cjs`, `PR_INSTRUCTIONS.md`
- Modified: `package.json` (nuevo script), `REMEDIATION.md` (nota añadida), `src/components/__tests__/TemplatesModal.test.tsx` (mock path fixed)

Cómo validar localmente:

1. Ejecutar tests:

```bash
npm ci
npm test -- --run --silent
```

2. Ejecutar el chequeo de bridges:

```bash
npm run check:legacy-bridges
```

Notas para el reviewer:
- Estos cambios eliminan puentes que podrían haber sido utilizados por scripts externos; por favor, verifique si existe alguna dependencia interna o en infra que los necesite.
- Si se requiere compatibilidad retroactiva, podemos proporcionar un pequeño wrapper o reintroducir stubs controlados.

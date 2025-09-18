# Guía rápida: Ejecutar 'Celestia' automáticamente en desarrollo

Objetivo: con un único comando generar y cargar la campaña "Celestia" en la aplicación local de forma automática.

Nuevo comando disponible:

```bash
npm run dev:celestia
```

Qué hace:
- Ejecuta `node scripts/campaigns/create-celestia-campaign.cjs` para generar `output/celestia_campaign_plan.json`.
- Lanza el servidor de desarrollo Vite.
- Cuando la app se carga en modo `DEV`, detecta `/output/celestia_campaign_plan.json` y lo importa automáticamente llamando a `importData` (solo en modo desarrollo). La campaña aparecerá en el modal de `Plantillas`.

Notas importantes:
- Esta lógica solo corre bajo `import.meta.env.DEV` (es decir, no afecta la build de producción).
- Si prefieres no auto-cargar la campaña, puedes seguir usando `npm run dev` y omitir el archivo de output o eliminarlo.
- Los cambios en `src/main.tsx` añaden la lógica de auto-carga en DEV.

Comandos útiles:

Iniciar desarrollo con Celestia auto-cargada:

```bash
npm run dev:celestia
```

Solo iniciar el servidor sin auto-carga:

```bash
npm run dev
```

Generar el plan manualmente (si lo prefieres):

```bash
node scripts/campaigns/create-celestia-campaign.cjs
```

Verificar E2E (local):

```bash
npx playwright test tests-e2e/final-acceptance-test.spec.ts
```


Feedback y revert:
- Si deseas que revertamos los cambios que añadí en `src/lib/mockData.*` para los scripts, házmelo saber y prepararé un PR con una alternativa (por ejemplo usar import dinámico ESM para scripts o ejecutar con ts-node).

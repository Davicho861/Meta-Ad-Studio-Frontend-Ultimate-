Seed: Crear plantilla "Celestia" en Meta Ad Studio

Objetivo
-------
Este documento explica cómo añadir una plantilla de demostración llamada "Celestia" al almacenamiento local (localStorage) de la aplicación para que aparezca permanentemente en la Galería y en el Campaign Canvas.

Archivos creados
----------------
- `scripts/seed/seed-celestia.cjs` — script que imprime JSON con la plantilla "Celestia".

Instrucciones rápidas
---------------------
1. Generar el JSON del seed (desde la raíz del repo):

```bash
node scripts/seed/seed-celestia.cjs > seed-celestia.json
```

2 opciones para inyectar el seed en tu navegador:

a) Manual (con DevTools):

  - Abre la app: `npm run dev` y visita `http://localhost:5173`.
  - Abre DevTools (F12) → pestaña Console.
  - Cargar el archivo `seed-celestia.json` en una variable (copiar/pegar su contenido) y ejecutar:

```js
localStorage.setItem('meta_ad_studio_templates_v1', `PASTE_JSON_HERE`);
location.reload();
```

b) Inyección automática con Playwright (opcional):

  - Puedes crear un script Playwright que abra la página y ejecute `localStorage.setItem(...)` antes de interactuar con la UI.

Ver la plantilla
---------------
- Tras la recarga, la plantilla "Celestia" aparecerá en la Galería y en la barra lateral del `Campaign Canvas` cuando crees un nuevo proyecto (New Project).

Notas y seguridad
-----------------
- Este script es un utilitario de desarrollo. No debe usarse en producción.
- El seed escribe datos en localStorage del navegador; si quieres eliminarlo, en DevTools ejecutar:

```js
localStorage.removeItem('meta_ad_studio_templates_v1');
location.reload();
```

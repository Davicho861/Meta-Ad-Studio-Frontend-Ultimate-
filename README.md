# meta-ad-studio

## Development
## Testing

## Playwright E2E
To run the full Playwright E2E suite locally, use:

```bash
npx playwright test
```

## Generación a Plantilla (nuevo flujo)

Esta aplicación ahora soporta un flujo de "Generación a Plantilla": introducir un prompt, generar una imagen simulada y guardar esa imagen como plantilla dentro de la galería (persistida en localStorage durante la sesión).

Cómo usar la funcionalidad en la app:

- Abre la aplicación (dev o preview).
- En la `TopBar`, escribe tu prompt en el campo central.
- Haz clic en el icono de rayo (botón "Exportar"/"Importar" al lado derecho) o en "Start Creating" desde la pantalla de bienvenida para iniciar la generación.
- Espera la simulación (unos segundos). Se mostrará una vista "Resultado Único" con la imagen generada.
- Haz clic en "Guardar como Plantilla" para añadirla a la galería. La plantilla se añade al array `mockImages` en memoria y se persiste en `localStorage`.

Export / Import de plantillas:

- En la `TopBar` hay dos botones: "Exportar" descargará un archivo `plantillas-meta-ad-studio.json` con las plantillas actuales.
- "Importar" abre un selector de archivo JSON; al importar, las plantillas válidas se añaden (con deduplicación).

Comandos útiles:

```bash
# arrancar dev
npm run dev

# tests unitarios
npm run test -- --run

# ejecutar E2E Playwright (config se encarga de build+preview)
npx playwright test tests-e2e/generation-flow.spec.ts --project=chromium
```

Notas implementacionales:

- `src/lib/mockData.ts`: se añadieron `addTemplate`, `saveTemplatesToStorage`, `loadTemplatesFromStorage`, `exportTemplates` e `importTemplatesFromJSON`.
- `src/store/useStore.ts`: añadido estado `newlyGeneratedImage` y `generationTrigger`.
- `src/components/CentralCanvas.tsx`: lógica de generación simulada y vista `singleResult` con botones para guardar/volver.
- `src/components/TopBar.tsx`: disparador de generación, botones "Exportar" y "Importar".
- Se añadieron pruebas unitarias y una prueba E2E: `tests-e2e/generation-flow.spec.ts` valida el flujo completo.

# Meta Canvas Orchestra — Meta Ad Studio (Prototype)

[![Meta Ad Studio CI](https://github.com/actions/workflows/ci.yml/badge.svg)](https://github.com/<TU_USUARIO>/<TU_REPOSITORIO>/actions/workflows/ci.yml)
[![Release v1.0.0](https://img.shields.io/badge/release-v1.0.0-blue.svg)](https://github.com/<TU_USUARIO>/<TU_REPOSITORIO>/releases)

Demostración de alta fidelidad del prototipo "Meta Ad Studio" construido con React + Vite + TypeScript, Tailwind CSS y microinteracciones.

## Características
- Interfaz centrada en prompt-guided ad creation
- Sonidos UI integrados (Web Audio / HTMLAudioElement)
- Modal inmersivo con video local
- Mock data para insights, tendencias e imágenes
- Tests automatizados con Vitest y Testing Library

## Tecnologías
- React + TypeScript
- Vite
- Tailwind CSS
- framer-motion, lucide-react
- Zustand (store)
- Vitest + @testing-library/react para pruebas

## Requisitos
- Node.js 18+ (o entorno compatible)
- npm / bun (el repo usa npm scripts por defecto)

## Scripts
- npm install
- npm run dev — Inicia servidor de desarrollo (puerto 8080)
- npm run build — Crea build de producción
- npm run preview — Sirve el build generado
- npm run test — Ejecuta la suite de tests (Vitest)

## Notas de assets
- Audios: ubicados en `public/sounds/*.mp3` y utilizados por `src/hooks/useSound.ts`.
- Video inmersivo: `public/videos/immersive-context.mp4` usado en `FullScreenModal`.

## Tests y CI
Se agregaron pruebas unitarias para `TopBar`, `LeftSidebar` y `FullScreenModal` en `src/components/*.test.tsx`.
El entorno de tests mockea `HTMLMediaElement.play()` en `src/tests/setupTests.ts` para evitar errores en jsdom.

## Diseño y decisiones técnicas
- Se añadió alias `@` tanto en `vite.config.ts` como en `vitest.config.ts` para resolver imports desde `src/`.
- Microinteracciones y sonidos están centralizados en `useSound` para facilitar cambios.

## Cómo contribuir
1. Abrir issue describiendo la mejora o bug.
2. Crear branch con prefijo `feat/` o `fix/`.
3. Ejecutar `npm run test` y `npm run build` antes de abrir PR.

## Estado actual
- Tests: ✅ Pasan localmente
- Build: ✅ Genera assets en `dist/`

---
Generado automáticamente como parte de la fase de hardening del prototipo.
#
# Deploy y estado de producción

## Despliegue

La aplicación está desplegada en Vercel y accesible en la siguiente URL de producción:

**https://www.metaadstudio.io** (producción)

Nota: si aún no has asignado este dominio en Vercel, puedes usar la URL de preview/deploy automática provista por Vercel hasta completar la configuración del dominio.

## Estado del Proyecto: v1.0 Lanzado

- Versión: v1.0.0
- Estado: En vivo y operativo
- CI: ✅ (GitHub Actions)
- Deploy: ✅ (Vercel)

Visita la aplicación en: https://www.metaadstudio.io

## Arquitectura y Decisiones Clave

* **Estado Global:** Se utiliza `Zustand` para una gestión de estado global ligera, reactiva y de bajo boilerplate, ideal para compartir datos como el prompt del usuario y los assets generados entre componentes desacoplados.
* **Animaciones e Interacciones:** `Framer Motion` es el núcleo de la "Firma Sensorial", permitiendo animaciones complejas y basadas en físicas que elevan la experiencia de usuario.
* **Pruebas Automatizadas:** Se optó por `Vitest` por su alta velocidad y su API compatible con Jest, junto con `React Testing Library` para pruebas centradas en el comportamiento del usuario, garantizando la robustez de la UI.
* **CI/CD:** Un pipeline en GitHub Actions automatiza la ejecución de pruebas y builds en cada push y pull request a `main`, asegurando que la base de código se mantenga siempre saludable y desplegable.
(Nota para el agente: Deberás reemplazar <TU_USUARIO>/<TU_REPOSITORIO> con los valores correctos si estuvieras en un repositorio real. Para esta simulación, puedes dejarlo como texto de ejemplo).
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/44117447-93d3-4f5f-8d66-e5745fa5c36f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/44117447-93d3-4f5f-8d66-e5745fa5c36f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Run CI locally

You can run the same steps the CI executes locally with these commands:

```sh
# Install deps and run the linter, tests and build
npm ci
npm run lint
npm test --silent
npm run build

# Install Playwright browsers and run E2E + accessibility
npx playwright install --with-deps
npx playwright test --reporter=list
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/44117447-93d3-4f5f-8d66-e5745fa5c36f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Meta Ad Studio — Architecture Overview

## Purpose
Este documento resume la pila tecnológica, la organización del código y el flujo de datos para el equipo técnico y stakeholders.

## Tech Stack
- Vite (dev server & build)
- React 18 + TypeScript
- Zustand (lightweight global state)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Lottie React (optional animated assets)
- Playwright (E2E)
- Vitest (unit/integration tests)

## Project Structure (selected)
- /src
  - /components — UI components and screens (TopBar, LeftSidebar, CentralCanvas, CampaignCanvas, FullScreenModal, etc.)
  - /app — route pages
  - /hooks — custom hooks (useSound, use-mobile, use-toast)
  - /lib — mock data and utilities
  - /store — Zustand store (`useStore.ts`)
  - /tests — vitest and integration tests
- public — static assets (icons, sounds, videos)

## State Management
- Zustand is used for application-wide state:
  - promptText: current creative prompt
  - canvasState: 'welcome' | 'generating' | 'results'
  - generatedAssets: GeneratedImage[]
  - predictiveInsights: PredictiveInsight[]
  - isGeneratingStrategy: boolean
  - selectedImage: GeneratedImage | null
- The store exposes setters for each piece of state. For E2E convenience the store is attached to `window.__APP_STORE__` in `useStore.ts` (can be disabled for production).

## Data Flow
- User interacts via TopBar (prompt input) or LeftSidebar (trend suggestions).
- Actions trigger state updates via `useStore` setters.
- `CentralCanvas` reads `canvasState` and `generatedAssets` to render welcome/generating/results views.
- `LeftSidebar` can call `setPromptText` and `setIsGeneratingStrategy` to update insights.
- `CampaignCanvas` allows dragging generated assets into a campaign workspace; local canvas assets are stored in component state.

## Testing Strategy
- Unit & Integration: Vitest + React Testing Library for components (see `tests/`)
- E2E: Playwright tests replicate real-user flows (see `tests-e2e/`)

## Build & Deployment
- Build: `npm run build` produces optimized output via Vite.
- Preview: `npm run preview` serves the build locally.
- Environment variables: sample `.env.example` added to repo.

## Notes & Next Steps
- Accessibility: basic a11y improvements applied (aria-labels where obvious). Consider running axe-core audits pre-release.
- Observability: integrate error reporting (Sentry) and performance monitoring for production.
- Security: guard `window.__APP_STORE__` attachment behind env var before shipping to public.


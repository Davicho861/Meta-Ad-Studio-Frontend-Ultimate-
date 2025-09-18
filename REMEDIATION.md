Residual accessibility issue: color-contrast on homepage CTA

Status: Persistent serious violation detected by @axe-core/playwright after targeted CSS overrides.

Details:
- Violating element: Homepage primary CTA ("Start Creating") when rendered with `outline` variant/button combining `border` + `bg-background` utility.
- Observed contrast ratio: ~1.77 - 2.34 depending on CSS cascade during tests.
- Expected: 4.5:1 (WCAG 2 AA)

Why it persists:
- Tailwind utility rules or component variant classes can generate more specific CSS at build time.
- Inline utilities, pseudo-class styles, or SVG color inheritance may override global rules.

Recommended remediation steps:
1. Replace `bg-background` on outline buttons with `bg-transparent` and explicitly set `text-white`.
2. Prefer explicit utility classes in JSX for CTA buttons: `className="bg-gradient-primary text-white"`.
3. Audit generated CSS specificity using browser DevTools: inspect computed color for the CTA text and locate the overriding rule.
4. Introduce a dedicated component variant (e.g., `cta`) in `buttonVariants.ts` that sets `background: linear-gradient(...)` plus `text-white` and high specificity if needed.
5. Add visual regression tests targeting CTA states (hover, focus) and re-run axe checks in CI.

Temporary mitigation applied:
- Global CSS overrides in `src/index.css` forcing `color: hsl(var(--button-text)) !important` on buttons with `bg-` utilities and `border bg-background` combinations to increase contrast.

If you want, I can implement the recommended change (create a `cta` variant and update `CentralCanvas.tsx` to use it) and re-run the accessibility test to reach full compliance.

--

Nota sobre limpieza de bridges CommonJS para `mockData`

Se eliminaron los archivos puente CommonJS que proporcionaban implementaciones duplicadas para `src/lib/mockData`.

- Archivos removidos: `src/lib/mockData.cjs`, `src/lib/mockData.js`, `src/lib/mockData/index.cjs`, `src/lib/mockData/package.json`.
- Motivo: evitaban ambigüedad en la resolución de módulos (CommonJS vs ESM/TypeScript) y causaban fallos intermitentes en tests y herramientas.
- Estado: la única fuente de verdad ahora es `src/lib/mockData.ts`.

Recomendación rápida:
- Abrir una PR con estos cambios y enlazar a esta nota para revisores.
- Añadir un pequeño test en CI que detecte archivos puente legacy y falle si aparecen de nuevo.

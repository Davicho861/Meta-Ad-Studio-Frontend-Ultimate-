# Meta Ad Studio — Demo Guide

This guide helps a presenter showcase the main product flows and includes a QA checklist for manual verification.

## Demo Script (5-7 minutes)

1. Launch the app (`npm run dev`) and open http://localhost:5173.
2. Show the TopBar: explain Assisted vs Expert Mode toggle.
   - Toggle to Assisted Mode: demonstrate quick suggestion badges and concise input.
   - Toggle to Expert Mode: show the advanced textarea for fine-grained prompts.
3. Use the Central Canvas:
   - In Assisted Mode, click a suggestion badge (e.g., "Fashion VR") to populate the prompt.
   - Enter a short prompt (or use the suggestion) and click the magick wand button (Start Creating).
   - Observe the generating animation (Lottie or animated fallback) and wait for results.
4. Review Generated Campaign:
   - Click generated images to view details or select them.
   - Click "Generate More" to iterate.
5. Use Left Sidebar — Strategic Oracle:
   - Switch to the Trends tab and click a trending concept; observe the prompt update.
   - Click "Generate Strategy" and watch the button show "Generando..." with a spinner.
   - After generation, point out the predictive insights.
6. Canvas Collaboration:
   - Drag generated assets from the left into the Campaign Canvas.
   - Add a Note via Tools → Add Note and place it on the canvas.
   - Approve an asset using controls (visual) and observe counts update.
7. Export & Notify:
   - Click "Export & Notify" and observe success toast.
8. Summary: Recap how AI suggestions, generation, and canvas collaboration form the core experience.

---

## QA Manual Checklist (for non-technical testers)

1. Open the app. The home canvas should show a "Start Creating" CTA.
2. Click "New Project" and confirm the app navigates to `/campaigns`.
3. In TopBar, toggle Assisted/Expert and verify the prompt input switches accordingly.
4. Enter a prompt and click the central Generate button; a generating animation should appear.
5. Wait for the result: at least 1 generated asset grid appears.
6. Click a generated image: the selected image state should update (visual confirmation).
7. In Left Sidebar → Trends, click a trend: prompt should append the trend text.
8. Click "Generate Strategy": the button becomes disabled and shows "Generando..." and spinner; after ~2s insights update.
9. Drag an asset from the left into the canvas area; asset count increases.
10. Add a note via Tools → Add Note; note appears on canvas and note count increases.
11. Click "Export & Notify"; a success toast appears and no console errors are thrown.
12. Toggle Expert Mode and verify advanced textarea appears and is editable.
13. Open browser devtools console: there should be no debug `console.log` messages from the app flows covered above.
14. Run `npx playwright test`: all E2E tests should pass.

Optional checks:
- Play the app with `NODE_ENV=production` and run `npm run build && npm run preview` to observe production build behavior.

Contact:
For questions about demo scenarios or observed issues, reach out to the product owner.

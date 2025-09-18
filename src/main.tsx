import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getAppStore } from '@/store/useStore';
import { loadTemplatesFromStorage, getTemplates, GeneratedImage } from '@/lib/mockData.ts';
// Sentry: initialize only in production
if (typeof window !== 'undefined' && import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
	// Dynamic import keeps dev bundles small and satisfies lint rules.
	void (async () => {
		const Sentry = await import('@sentry/react');
		const tracing = await import('@sentry/tracing');
		Sentry.init({
			dsn: import.meta.env.VITE_SENTRY_DSN,
			integrations: [new tracing.BrowserTracing()],
			tracesSampleRate: 0.1,
		});
	})();
}

// Typed attachment of the dev-only store hook factory for E2E tests.
declare global {
	interface Window {
	__APP_STORE__?: unknown;
	}
}

// Attach dev-only store to window only in development environment for E2E.
if (typeof window !== 'undefined' && import.meta.env.VITE_APP_ENV === 'development' && !window.__APP_STORE__) {
	window.__APP_STORE__ = getAppStore();
	// E2E: __APP_STORE__ attached (development only)
}

createRoot(document.getElementById("root")!).render(<App />);

// In development, check that campaign example assets exist and warn if missing.
if (import.meta.env.DEV) {
	void (async () => {
		try {
			const { checkCampaignAssets } = await import('@/utils/checkAssets');
			await checkCampaignAssets();
		} catch (e) {
			// Non-blocking: log and continue
			console.debug('asset checker failed', e);
		}
	})();
}
// DEV: Auto-load Celestia campaign plan if present. This runs only in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
	void (async () => {
		try {
			const resp = await fetch('/output/celestia_campaign_plan.json');
			if (!resp.ok) return; // file not present: nothing to do
			const txt = await resp.text();
			// Import the ESM mockData util and use importData to add templates at runtime
			const md = await import('@/lib/mockData.ts');
			try {
				const res = md.importData(txt);
				if (res && res.success) {
					// Auto-loaded Celestia campaign: res.message
				}
			} catch (e) {
				console.debug('Auto-load importData failed', e);
			}
		} catch (e) {
			// Non-blocking
			console.debug('Auto-load Celestia check failed', e);
		}
	})();
}

// Load persisted templates into the runtime store if any exist
if (typeof window !== 'undefined') {
	try {
		const stored = loadTemplatesFromStorage();
		if (stored && stored.length > 0) {
		const store = getAppStore();
		// Use the store to set generated assets so the UI picks them up
	try { store().setGeneratedAssets(stored); } catch (e) { /* no-op for safety */ }
		}
	} catch (e) { console.debug('failed to load persisted templates', e); }
}

// DEV: Force load the built-in mock templates so gallery always has preview videos locally.
// In production builds we do not inject test data; this block is allowed in DEV only to aid local development.
if (typeof window !== 'undefined' && import.meta.env.DEV) {
	try {
		const store = getAppStore();
		const templates = getTemplates();
		try { store().setGeneratedAssets(templates); } catch (e) { console.debug('failed to set generated assets in DEV', e); }
	} catch (e) {
		console.debug('DEV: force template load failed', e);
	}
}

// FORCE LOAD: ensure templates are present only when tests explicitly opt-in via window.__E2E__
// This reduces intrusive behavior during normal DEV while keeping deterministic E2E.
// No E2E injection here - tests are responsible for providing deterministic data via Playwright.

// DEV: start MSW and mount consent banner if available
if (typeof window !== 'undefined' && import.meta.env.DEV) {
	void (async () => {
		try {
			const [{ default: worker }, { default: ConsentBanner }] = await Promise.all([
				import('@/mocks/browser').then(m => m),
				import('@/components/ConsentBanner').then(m => m)
			]);
			try {
				if (worker && worker.start) await worker.start();
			} catch (e) { /* non-blocking */ }
			// mount ConsentBanner into the DOM
			try {
				const el = document.createElement('div');
				document.getElementById('root')?.appendChild(el);
				const ReactDOM = await import('react-dom/client');
				ReactDOM.createRoot(el).render(React.createElement(ConsentBanner));
			} catch (e) { /* non-blocking */ }
		} catch (e) {
			// non-blocking
		}
	})();
}

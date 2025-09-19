import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getAppStore, setPreviewVideo as storeSetPreviewVideo, addTemplates as storeAddTemplates, clearTemplates as storeClearTemplates } from '@/store/useStore';
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

// Mount React App (always)
if (typeof document !== 'undefined') {
	try {
		const rootEl = document.getElementById('root');
		if (rootEl) {
			const r = createRoot(rootEl);
			r.render(React.createElement(App));
		}
	} catch (e) {
		// Non-blocking: if mount fails tests will show empty DOM
		// eslint-disable-next-line no-console
		console.debug('App mount failed', e);
	}
}

// Typed attachment of the dev-only store hook factory for E2E tests.
declare global {
		interface AppStoreHelpers {
			addTemplates?: (t: GeneratedImage[]) => boolean;
			clearTemplates?: () => boolean;
			selectImageById?: (id: string) => boolean;
			setPreviewVideo?: (id: string, url: string) => boolean;
		}
		interface Window {
		__APP_STORE__?: unknown;
		__E2E__?: boolean;
		__APP_STORE_HELPERS__?: AppStoreHelpers;
		}
}

// Attach dev-only store to window when running locally (DEV) or when tests opt-in via __E2E__
if (typeof window !== 'undefined' && (import.meta.env.DEV || window.__E2E__) && !window.__APP_STORE__) {
	window.__APP_STORE__ = getAppStore();
	// E2E/DEV: __APP_STORE__ attached
}

// Expose higher level helpers for E2E tests. These helpers are only attached
// in development or when the test runner flags window.__E2E__ prior to app load.
if (typeof window !== 'undefined') {
	try {
			const shouldAttach = import.meta.env.DEV || window.__E2E__;
			if (shouldAttach) {
				window.__APP_STORE_HELPERS__ = window.__APP_STORE_HELPERS__ || {};
				window.__APP_STORE_HELPERS__.addTemplates = storeAddTemplates;
				window.__APP_STORE_HELPERS__.clearTemplates = storeClearTemplates;
				// attach a safe shim that delegates to the store-level helper to avoid recursion
				window.__APP_STORE_HELPERS__.setPreviewVideo = (id: string, url: string) => {
					try {
						// Prefer the direct store helper if exported
						if (typeof storeSetPreviewVideo === 'function') return storeSetPreviewVideo(id, url);
						// Fallback: attempt to call the store instance
						const store = getAppStore();
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return (store as any).setPreviewVideo ? (store as any).setPreviewVideo(id, url) : false;
					} catch (e) { return false; }
				};
				window.__APP_STORE_HELPERS__.selectImageById = (id: string) => {
				try {
					const store = getAppStore();
					const state = store.getState();
						  const found = state.generatedAssets?.find((g: GeneratedImage) => g.id === id) || null;
					store.setState({ selectedImage: found });
					return !!found;
				} catch (e) { return false; }
			};
		}
	} catch (e) { /* non-blocking */ }
}
// If E2E mode was flagged, set the body attribute to disable animations via CSS.
if (typeof window !== 'undefined' && (window.__E2E__ || import.meta.env.DEV)) {
	try {
 		document.body.setAttribute('data-test-mode', (window.__E2E__ ? 'true' : 'true'));
 	} catch (e) { /* noop */ }

	// DEV-only: event-driven bridge for E2E commands. Keeps production code free of test hacks.
	// Listens for 'e2e-command' CustomEvent with detail { command, payload } and delegates to
	// the store helpers previously attached to window.__APP_STORE_HELPERS__.
	try {
		window.addEventListener('e2e-command', (ev: Event) => {
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const ce = ev as CustomEvent<{ command: string; payload: any }>;
				const { command, payload } = ce.detail || {};
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const storeHelpers = (window as any).__APP_STORE_HELPERS__;
				if (storeHelpers && typeof storeHelpers[command] === 'function') {
					let result: any = null;
					try {
						// Support a payload convention: if payload is an object { args: [...] }
						// then spread args into the helper call. Otherwise pass payload as single arg.
						if (payload && typeof payload === 'object' && Array.isArray((payload as any).args)) {
							result = storeHelpers[command](...((payload as any).args));
						} else {
							result = storeHelpers[command](payload);
						}
					} catch (e) { /* noop */ }
					window.dispatchEvent(new CustomEvent('e2e-response', { detail: { status: 'success', command, result } }));
				} else {
					window.dispatchEvent(new CustomEvent('e2e-response', { detail: { status: 'error', command, message: 'Command not found' } }));
				}
			} catch (e) { /* noop */ }
		});
		// Signal to tests that the E2E bridge is ready to accept commands
		try {
			(window as any).__E2E_READY__ = true;
			window.dispatchEvent(new CustomEvent('e2e-ready', { detail: { ready: true } }));
		} catch (e) { /* noop */ }
	} catch (e) { /* noop */ }
}

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

import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
import '@testing-library/jest-dom';

// JSDOM does not implement HTMLMediaElement.play(), mock to prevent errors
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
	configurable: true,
	value: function playMock(this: HTMLMediaElement) {
		// Return a resolved promise to mimic native behaviour in tests
		return Promise.resolve();
	},
});

// JSDOM doesn't implement ResizeObserver; provide a lightweight mock for tests
class ResizeObserverMock {
	callback: (entries: ResizeObserverEntry[]) => void;
	constructor(cb: (entries: ResizeObserverEntry[]) => void) {
		this.callback = cb;
	}
	observe() {
		// no-op
	}
	unobserve() {
		// no-op
	}
	disconnect() {
		// no-op
	}
}

const gbl = globalThis as unknown as { ResizeObserver?: typeof ResizeObserver };
gbl.ResizeObserver = gbl.ResizeObserver || (ResizeObserverMock as unknown as typeof ResizeObserver);

// Some Recharts internals measure the DOM; JSDOM elements often return 0 width/height.
// Note: We purposely avoid a global override of getBoundingClientRect here.
// Tests that render recharts should mock 'recharts' locally using vi.mock(...) to
// return small placeholder components that don't rely on DOM measurement. This
// keeps tests isolated and avoids leaking globals between test suites.

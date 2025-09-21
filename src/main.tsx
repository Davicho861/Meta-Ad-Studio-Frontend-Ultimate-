import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Minimal entry: mount the React app. No E2E hooks or global test flags.
if (typeof document !== 'undefined') {
	try {
		const root = document.getElementById('root');
		if (root) createRoot(root).render(React.createElement(App));
	} catch {
		/* noop */
	}
}

export {};


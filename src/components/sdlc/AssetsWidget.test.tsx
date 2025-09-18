import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AssetsWidget from './AssetsWidget';

describe('AssetsWidget', () => {
  const mockReleases = {
    releases: [
      { version: 'v1.2.0', zip: '/downloads/v1.2.0.zip', notes: 'Initial release' },
      { version: 'v1.3.0', zip: '/downloads/v1.3.0.zip', notes: 'Bug fixes' },
    ],
  };

  beforeEach(() => {
    const g = global as unknown as { fetch?: typeof fetch };
    g.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(mockReleases) })) as unknown as typeof fetch;
  });

  afterEach(() => {
  vi.restoreAllMocks();
  });

  it('renders release entries from the mock API', async () => {
    render(<AssetsWidget />);

    await waitFor(() => expect(screen.getByText('v1.2.0')).toBeInTheDocument());
    expect(screen.getByText('Initial release')).toBeInTheDocument();
    expect(screen.getAllByText('Download').length).toBe(2);
  });

  it('renders nothing when API returns empty releases', async () => {
  const g = global as unknown as { fetch?: typeof fetch };
  g.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ releases: [] }) })) as unknown as typeof fetch;
    render(<AssetsWidget />);

    await waitFor(() => expect(screen.queryByText('Download')).toBeNull());
  });

  it('handles fetch failure gracefully', async () => {
  const g = global as unknown as { fetch?: typeof fetch };
  g.fetch = vi.fn(() => Promise.reject(new Error('network'))) as unknown as typeof fetch;
    render(<AssetsWidget />);
  // Should show error message and retry button
  await waitFor(() => expect(screen.getByText('Failed to load release assets')).toBeInTheDocument());
  expect(screen.getByText('Reintentar')).toBeInTheDocument();

  // When retry succeeds, items should render
  (g.fetch as unknown) = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ releases: [{ version: 'v9', zip: '/d.zip', notes: 'ok' }] }) })) as unknown as typeof fetch;
  screen.getByText('Reintentar').click();
  await waitFor(() => expect(screen.getByText('v9')).toBeInTheDocument());
  });
});

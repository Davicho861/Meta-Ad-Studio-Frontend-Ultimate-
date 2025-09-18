import React from 'react';
import { vi } from 'vitest';

// Mock recharts locally to avoid DOM measurement issues in tests.
vi.mock('recharts', () => {
  return {
  ResponsiveContainer: (props: React.PropsWithChildren<Record<string, unknown>>) => React.createElement('div', { className: 'recharts-responsive-container' }, props.children),
  RadialBarChart: (props: React.PropsWithChildren<Record<string, unknown>>) => React.createElement('div', { 'data-testid': 'radial-bar-chart' }, props.children),
  RadialBar: (_props: unknown) => React.createElement('div', null, null),
  Legend: () => React.createElement('div', null, null),
  BarChart: (_props: unknown) => React.createElement('div', { 'data-testid': 'bar-chart' }, null),
  Bar: () => React.createElement('div', null, null),
  LineChart: (_props: unknown) => React.createElement('div', { 'data-testid': 'line-chart' }, null),
  Line: () => React.createElement('div', null, null),
  XAxis: () => React.createElement('div', null, null),
  YAxis: () => React.createElement('div', null, null),
  Tooltip: () => React.createElement('div', null, null),
  };
});
import { render, screen, waitFor } from '@testing-library/react';
import QualityMetricsWidget from './QualityMetricsWidget';

const mockMetrics = { coverage: 92.5, accessibility: 98.3, performance: 88.1 };

beforeEach(() => {
  const g = global as unknown as { fetch?: typeof fetch };
  g.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(mockMetrics) })) as unknown as typeof fetch;
});

afterEach(() => vi.resetAllMocks());

describe('QualityMetricsWidget', () => {
  it('renders metrics from mock', async () => {
  render(<QualityMetricsWidget testSize={{ width: 600, height: 240 }} />);
    await waitFor(() => expect(screen.getByText(/Coverage:/)).toBeInTheDocument());
    expect(screen.getByText(/Coverage:/).textContent).toContain('92.5');
    expect(screen.getByText(/Accessibility:/).textContent).toContain('98.3');
  });

  it('renders gracefully when API returns empty metrics', async () => {

  const g = global as unknown as { fetch?: typeof fetch };
  g.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({}) })) as unknown as typeof fetch;

  render(<QualityMetricsWidget testSize={{ width: 600, height: 240 }} />);
    // Expect labels to be present but values to show fallback or be absent
    await waitFor(() => expect(screen.getByText(/Coverage:/)).toBeInTheDocument());
  });

  it('handles fetch error without throwing', async () => {

  const g = global as unknown as { fetch?: typeof fetch };
  g.fetch = vi.fn(() => Promise.reject(new Error('network'))) as unknown as typeof fetch;

  render(<QualityMetricsWidget testSize={{ width: 600, height: 240 }} />);
  // On fetch error the component stays in the loading state; assert it doesn't crash
  await waitFor(() => expect(screen.getByText('Loading...')).toBeInTheDocument());
  });
});

import React from 'react';
import { vi } from 'vitest';

// Mock recharts locally to avoid DOM measurement issues in tests.
vi.mock('recharts', () => {
  return {
  ResponsiveContainer: (props: React.PropsWithChildren<Record<string, unknown>>) => React.createElement('div', { className: 'recharts-responsive-container' }, props.children),
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
import SdlcProgressWidget from './SdlcProgressWidget';

describe('SdlcProgressWidget', () => {
  it('renders SDLC title and chart container', async () => {
    render(<SdlcProgressWidget testSize={{ width: 600, height: 240 }} />);
    expect(screen.getByText('SDLC Progress')).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector('.recharts-responsive-container')).toBeTruthy());
  });
});

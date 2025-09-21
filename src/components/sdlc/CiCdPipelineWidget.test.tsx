import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { act } from 'react';
import CiCdPipelineWidget from './CiCdPipelineWidget';

const mockResponse = {
  pipeline: [
    { name: 'Checkout', status: 'Passed', duration: 10 },
    { name: 'Build', status: 'In Progress', duration: 5 }
  ],
  overall: 'In Progress'
};

beforeEach(() => {
  const g = global as unknown as { fetch?: typeof fetch };
  g.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(mockResponse) })) as unknown as typeof fetch;
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('CiCdPipelineWidget', () => {
  it('renders pipeline stages and overall status', async () => {
    render(<CiCdPipelineWidget />);
    await waitFor(() => expect(screen.getByText(/Overall:/)).toBeInTheDocument());
    expect(screen.getByText(/Overall:/).textContent).toContain('In Progress');
    expect(screen.getByText(/Checkout/)).toBeInTheDocument();
    expect(screen.getByText(/✅ Passed/)).toBeInTheDocument();
  });
  
  it('shows error and allows retry on failure', async () => {
    const g = global as unknown as { fetch?: typeof fetch };
    g.fetch = vi.fn(() => Promise.reject(new Error('network'))) as unknown as typeof fetch;
    render(<CiCdPipelineWidget />);
    await waitFor(() => expect(screen.getByText('Failed to load CI/CD pipeline')).toBeInTheDocument());
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
    
    // Make retry succeed
    g.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(mockResponse) })) as unknown as typeof fetch;
    await act(async () => {
      screen.getByText('Reintentar').click();
    });
    await waitFor(() => expect(screen.getByText(/Overall:/)).toBeInTheDocument());
  const overallEl = screen.getByText(/Overall:/).closest('div')!.querySelector('strong');
  expect(overallEl?.textContent).toContain('In Progress');
  });
});

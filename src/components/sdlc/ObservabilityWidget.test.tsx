import React from 'react';
import { render, screen } from '@testing-library/react';
import ObservabilityWidget from './ObservabilityWidget';

describe('ObservabilityWidget', () => {
  it('shows disconnected message and hint to configure telemetry', () => {
    render(<ObservabilityWidget />);
    expect(screen.getByText('Observability')).toBeInTheDocument();
    expect(screen.getByText(/No external telemetry configured/i)).toBeInTheDocument();
  });
});

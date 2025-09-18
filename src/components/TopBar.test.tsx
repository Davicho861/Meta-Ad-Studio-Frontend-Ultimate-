import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopBar } from './TopBar';
import { useStore } from '@/store/useStore';
import { vi } from 'vitest';

const mockSetPromptText = vi.fn();
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn(() => ({
    promptText: '',
    setPromptText: mockSetPromptText,
    setCanvasState: vi.fn()
  }))
}));

describe('TopBar', () => {
  it('renders in Assisted mode by default and toggles to Expert mode', () => {
    render(<TopBar />);

    // Assisted mode shows suggestion badges (searching for 'Fashion VR')
    expect(screen.getByText(/Fashion VR/i)).toBeInTheDocument();

    // Toggle to Expert mode
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    fireEvent.click(toggle);

    // After toggle, the label should change to Expert Mode and switch should be checked
    expect(screen.getByText(/Expert Mode/i)).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('clicking a suggestion badge calls setPromptText', () => {
    mockSetPromptText.mockReset();
    render(<TopBar />);

    const badge = screen.getByText(/Fashion VR/i);
    expect(badge).toBeInTheDocument();
    fireEvent.click(badge);
    expect(mockSetPromptText).toHaveBeenCalled();
  });
});

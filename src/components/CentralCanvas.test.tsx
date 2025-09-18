import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

// Mock sonner toast to avoid side effects
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
  Toaster: ({ children }: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="toaster">{children}</div>
}));

// Mock react-router-dom useNavigate
const pushMock = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => pushMock }));

// Minimal mock for store
const mockSetPromptText = vi.fn();
const mockSetCanvasState = vi.fn();
const mockSetPromptShake = vi.fn();
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn(() => ({
    canvasState: 'welcome',
    setCanvasState: mockSetCanvasState,
    generatedAssets: [],
    setGeneratedAssets: vi.fn(),
    promptText: '',
    setPromptText: mockSetPromptText,
    setSelectedImage: vi.fn(),
    promptShake: 0,
    setPromptShake: mockSetPromptShake
  }))
}));

vi.mock('@/hooks/useSound', () => ({ useSound: () => ({ playSound: vi.fn() }) }));
// Mock lottie-react to avoid rendering issues in JSDOM
vi.mock('lottie-react', () => ({ __esModule: true, default: ({ children }: { children?: React.ReactNode }) => <div data-testid="lottie-mock">Lottie</div> }));

import { CentralCanvas } from './CentralCanvas';

describe('CentralCanvas', () => {
  it('navigates to /campaigns when New Project is clicked', async () => {
    render(<CentralCanvas />);

    const btn = await screen.findByRole('button', { name: /New Project/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(pushMock).toHaveBeenCalledWith('/campaigns');
  });

  it('concatenates category text to promptText when a category is clicked', async () => {
    render(<CentralCanvas />);
    const categoryBtn = await screen.findByText(/Visual Ads/i);
    expect(categoryBtn).toBeInTheDocument();
    fireEvent.click(categoryBtn);
    expect(mockSetPromptText).toHaveBeenCalled();
  });

  it('does not start generation when Start Creating clicked with empty prompt', async () => {
    render(<CentralCanvas />);
    const startBtn = await screen.findByRole('button', { name: /Start Creating/i });
    expect(startBtn).toBeInTheDocument();
    fireEvent.click(startBtn);
    // setCanvasState should not be called because prompt is empty
    expect(mockSetCanvasState).not.toHaveBeenCalled();
  });

  it('Start Creating CTA uses cta variant classes for high contrast', async () => {
    render(<CentralCanvas />);
    const startBtn = await screen.findByRole('button', { name: /Start Creating/i });
    expect(startBtn).toBeInTheDocument();
    // The button should use the cta variant which maps to bg-gradient-primary and text-white
    expect(startBtn.className).toEqual(expect.stringContaining('bg-gradient-primary'));
    expect(startBtn.className).toEqual(expect.stringContaining('text-white'));
  });
});

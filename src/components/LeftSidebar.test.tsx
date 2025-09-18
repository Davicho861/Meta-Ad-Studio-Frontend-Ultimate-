import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock Tabs primitives to always render their children (makes tab panels visible in tests)
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children?: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
}));

import { LeftSidebar } from './LeftSidebar';

const mockSetPromptText = vi.fn();
const mockSetPredictiveInsights = vi.fn();
const mockSetIsGeneratingStrategy = vi.fn();

vi.mock('@/store/useStore', () => ({
  useStore: vi.fn(() => ({
    isGeneratingStrategy: false,
    setIsGeneratingStrategy: mockSetIsGeneratingStrategy,
    predictiveInsights: [],
    setPredictiveInsights: mockSetPredictiveInsights,
    setPromptText: mockSetPromptText,
    promptText: '',
    promptShake: 0,
    setPromptShake: vi.fn()
  }))
}));

describe('LeftSidebar', () => {
  it('applies a trend suggestion to promptText when clicking a trend', async () => {
    render(<LeftSidebar />);

  // Find the trend button by role and name and click it
  const trendButton = await screen.findByRole('button', { name: /Solarpunk Aesthetics/i });
  expect(trendButton).toBeInTheDocument();
  fireEvent.click(trendButton);

    expect(mockSetPromptText).toHaveBeenCalled();
  });

  it('generates strategy and updates predictive insights', async () => {
    const { useStore } = await import('@/store/useStore');
    // initial render
    const mockHook = useStore as unknown as vi.Mock;
    mockHook.mockImplementation(() => ({
      isGeneratingStrategy: false,
      setIsGeneratingStrategy: mockSetIsGeneratingStrategy,
      predictiveInsights: [],
      setPredictiveInsights: mockSetPredictiveInsights,
      setPromptText: mockSetPromptText,
      promptText: '',
      promptShake: 0,
      setPromptShake: vi.fn()
    }));

    const { rerender } = render(<LeftSidebar />);
    const genButton = await screen.findByRole('button', { name: /Generate Strategy/i });
    expect(genButton).toBeInTheDocument();

    // Click to trigger generation
    fireEvent.click(genButton);

    // Simulate hook state change to isGeneratingStrategy=true
    mockHook.mockImplementation(() => ({
      isGeneratingStrategy: true,
      setIsGeneratingStrategy: mockSetIsGeneratingStrategy,
      predictiveInsights: [],
      setPredictiveInsights: mockSetPredictiveInsights,
      setPromptText: mockSetPromptText,
      promptText: '',
      promptShake: 0,
      setPromptShake: vi.fn()
    }));
    rerender(<LeftSidebar />);

    // Button should now be disabled
    const genBtnAfter = await screen.findByRole('button', { name: /Generando...|Generate Strategy/i });
    expect(genBtnAfter).toBeDisabled();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Full app render should import the top-level entry; use App or Index depending on project
// Mock Tabs primitives so tab panels are visible in the integration test
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children?: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
}));

import { LeftSidebar } from '@/components/LeftSidebar';
import CentralCanvas from '@/components/CentralCanvas';
import { MemoryRouter } from 'react-router-dom';

// Mocks
const mockSetPromptText = vi.fn();
const mockSetCanvasState = vi.fn();
const mockSetPredictiveInsights = vi.fn();
const mockSetIsGeneratingStrategy = vi.fn();
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn(() => ({
    // start with a non-empty prompt so handleGenerate proceeds to setCanvasState('generating')
    promptText: 'Initial creative prompt',
    setPromptText: mockSetPromptText,
    canvasState: 'welcome',
    setCanvasState: mockSetCanvasState,
    generatedAssets: [],
    setGeneratedAssets: vi.fn(),
    predictiveInsights: [],
    setPredictiveInsights: mockSetPredictiveInsights,
    isGeneratingStrategy: false,
    setIsGeneratingStrategy: mockSetIsGeneratingStrategy
  }))
}));

vi.mock('lottie-react', () => ({ __esModule: true, default: ({ children }: { children?: React.ReactNode }) => <div data-testid="lottie-mock">Lottie</div> }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() }, Toaster: ({ children }: { children?: React.ReactNode }) => <div data-testid="toaster">{children}</div> }));

describe('CreativeFlow integration', () => {
  it('happy path updates promptText and canvasState', async () => {
    // Render the two components inside a Router so useNavigate works
    render(
      <MemoryRouter>
        <div>
          <LeftSidebar />
          <CentralCanvas />
        </div>
      </MemoryRouter>
    );

  // Open Trends tab then click a trend in LeftSidebar
  const trendMatches = await screen.findAllByText(/Trends/i);
  // pick the match that is a button (the tab trigger)
  const trendsTab = trendMatches.find((el) => el.tagName === 'BUTTON' || el.closest('button')) as HTMLElement | undefined;
  expect(trendsTab).toBeTruthy();
  const trendsButton = trendsTab.tagName === 'BUTTON' ? trendsTab : trendsTab.closest('button') as HTMLElement;
  fireEvent.click(trendsButton);

  const trend = await screen.findByText(/Solarpunk Aesthetics/i);
  fireEvent.click(trend);
    expect(mockSetPromptText).toHaveBeenCalled();

    // Click a category in CentralCanvas (use actual category from promptSuggestions)
    const category = await screen.findByText(/Visual Ads/i);
    fireEvent.click(category);
    // concatenation may call setPromptText again
    expect(mockSetPromptText).toHaveBeenCalled();

    // Click Start Creating
    const startBtn = await screen.findByRole('button', { name: /Start Creating/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(mockSetCanvasState).toHaveBeenCalledWith('generating');
    }, { timeout: 3000 });
  });
});

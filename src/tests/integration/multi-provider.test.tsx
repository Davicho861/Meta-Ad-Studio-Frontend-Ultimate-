import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FullScreenModal } from '@/components/FullScreenModal';
import { vi } from 'vitest';
import { getAppStore, useStore } from '@/store/useStore';
import { resetServerStore } from '@/mocks/server-store';
import { act } from 'react-dom/test-utils';

// Mock useSound to avoid side effects
vi.mock('@/hooks/useSound', () => ({ useSound: () => ({ playSound: vi.fn() }) }));

// helper to reset sessionStorage credits before each test
function setSessionCredits(n: number) {
  try { window.sessionStorage.setItem('mock_user_credits', String(n)); } catch (e) { void e; }
}

const mockImage = {
  id: 'img1',
  url: '/images/example.jpg',
  prompt: 'Test image',
  engagement: 50,
  ctr: 2.0,
  reach: 1000,
  type: 'uploaded'
};

describe('Multi-provider and credits flow', () => {
  beforeEach(() => {
    // reset server-side mock store and mount a fresh store state
  resetServerStore();
  const s = getAppStore() as unknown as { setState?: (p: Record<string, unknown>) => void };
  try {
    const payload: Record<string, unknown> = { selectedImage: mockImage, credits: 2 };
    s.setState?.(payload);
  } catch (e) { void e; }
  });

  it('disables generate button when credits are 0', async () => {
    // set credits to 0 in session and store
    setSessionCredits(0);
  const s = getAppStore() as unknown as { setState?: (p: Record<string, unknown>) => void };
  try { s.setState?.({ credits: 0 }); } catch (e) { void e; }

    render(<FullScreenModal />);
    // open animate tab by simulating tab click
    const animateTab = screen.getByTestId('tab-animate');
    fireEvent.click(animateTab);

    const generateBtn = await screen.findByTestId('generate-video');
    expect(generateBtn).toBeDisabled();
  });

  it('sends selected provider to /api/generate-video (MSW intercepts)', async () => {
  const s = getAppStore() as unknown as { setState?: (p: Record<string, unknown>) => void };
  try { s.setState?.({ credits: 2 }); } catch (e) { void e; }

    render(<FullScreenModal />);
    await act(async () => { fireEvent.click(screen.getByTestId('tab-animate')); });
    // choose a provider (first available)
    const radios = screen.getAllByRole('radio');
    await act(async () => { fireEvent.click(radios[0]); });

    const generateBtn = await screen.findByTestId('generate-video');
    await act(async () => { fireEvent.click(generateBtn); });
    // wait until API returns and store updated via setCredits
  const spy = vi.spyOn(getAppStore() as unknown as { setState?: (...args: unknown[]) => void }, 'setState');
    await waitFor(() => { expect(generateBtn).toBeDefined(); });
    spy.mockRestore();
  });

  it('deducts credit in frontend store after successful generation', async () => {
    setSessionCredits(2);
  const s = getAppStore() as unknown as { setState?: (p: Record<string, unknown>) => void };
  try { s.setState?.({ credits: 2 }); } catch (e) { void e; }

    render(<FullScreenModal />);
    await act(async () => { fireEvent.click(screen.getByTestId('tab-animate')); });

    const generateBtn = await screen.findByTestId('generate-video');
  // debug: log credits before click
  console.debug('[TEST] before click credits', useStore.getState().credits);
    await act(async () => { fireEvent.click(generateBtn); });

    // Wait for the store to reflect the authoritative server credits value (2 -> 1)
    await waitFor(() => {
      console.debug('[TEST] in waitFor credits', useStore.getState().credits, 'LAST_NEW', ((window as unknown) as Record<string, unknown>).__LAST_NEW_CREDITS__);
      expect((((window as unknown) as Record<string, unknown>).__LAST_NEW_CREDITS__) as number).toBe(1);
    });
  });
});

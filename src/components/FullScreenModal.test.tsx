import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FullScreenModal } from './FullScreenModal';
import { vi } from 'vitest';

const mockUseStore = {
  selectedImage: {
    id: '1',
    url: '/videos/immersive-context.mp4',
    prompt: 'Test prompt',
    engagement: 80,
    ctr: 4.5,
    reach: 100000
  },
  setSelectedImage: vi.fn(),
  setCanvasState: vi.fn(),
  setGeneratedAssets: vi.fn()
};

vi.mock('@/store/useStore', () => ({
  useStore: vi.fn(() => mockUseStore)
}));

vi.mock('@/hooks/useSound', () => ({
  useSound: vi.fn(() => ({ playSound: vi.fn() }))
}));

describe('FullScreenModal', () => {
  it('applies brand filter class when clicking Apply Brand Identity', () => {
    render(<FullScreenModal />);

    const applyBtn = screen.getByText(/Apply Brand Identity/i);
    fireEvent.click(applyBtn);

    // After clicking, the overlay with 'M' should be present
    expect(screen.getByText('M')).toBeInTheDocument();
  });
});

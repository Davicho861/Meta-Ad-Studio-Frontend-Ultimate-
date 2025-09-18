import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import GalleryCard from '../GalleryCard';
import type { GeneratedImage } from '@/lib/mockData';

const mockImage = {
  id: 'test-img',
  url: '/images/campaign-examples/aura_times_square.webp',
  srcWebp: '/images/campaign-examples/aura_times_square.webp',
  prompt: 'test prompt',
  timestamp: new Date(),
  previewVideoUrl: '/videos/campaign-previews/aura_preview.mp4'
};

describe('GalleryCard', () => {
  let playSpy: ReturnType<typeof vi.spyOn>;
  let pauseSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
  playSpy = vi.spyOn(HTMLMediaElement.prototype as unknown as { play: () => Promise<void> }, 'play').mockImplementation(() => Promise.resolve());
  pauseSpy = vi.spyOn(HTMLMediaElement.prototype as unknown as { pause: () => void }, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    playSpy.mockRestore();
    pauseSpy.mockRestore();
  });

  it('plays video on hover and pauses on leave', async () => {
  const { getByAltText, container } = render(<GalleryCard image={mockImage as GeneratedImage} />);
    const img = getByAltText('test prompt');

    fireEvent.mouseEnter(container.firstChild as Element);
    // expect play called
    expect(playSpy).toHaveBeenCalled();

    fireEvent.mouseLeave(container.firstChild as Element);
    expect(pauseSpy).toHaveBeenCalled();
  });
});

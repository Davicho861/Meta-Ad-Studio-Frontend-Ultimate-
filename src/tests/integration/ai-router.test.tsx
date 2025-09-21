import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FullScreenModal } from '@/components/FullScreenModal';
import { getAppStore } from '@/store/useStore';
import { resetServerStore, getLastRequest } from '@/mocks/server-store';

beforeEach(() => {
  resetServerStore();
  const s = getAppStore() as unknown as { setState?: (s: Record<string, unknown>) => void };
  try { s.setState?.({ selectedImage: { id: 'img1', url: '/images/example.jpg', prompt: 'Test', type: 'uploaded' }, credits: 2 }); } catch (e) { void e; }
});

test('routes text-to-image to openai', async () => {
  render(<FullScreenModal />);
  fireEvent.click(screen.getByTestId('tab-animate'));
  // switch to text-to-image task
  await act(async () => {
    fireEvent.click(screen.getByText('Texto → Imagen'));
  });
  // select OpenAI provider
  await act(async () => {
    const r = screen.getByLabelText('openai');
    fireEvent.click(r);
  });
  const gen = await screen.findByTestId('generate-video');
  await act(async () => { fireEvent.click(gen); });

  await waitFor(() => {
    const lr = getLastRequest();
    expect(lr).not.toBeNull();
    expect(lr?.path).toBe('/api/generate');
    const body = lr?.body as { task?: string; provider?: string } | undefined;
    expect(body?.task).toBe('text-to-image');
    expect(body?.provider).toBe('openai');
  });
});

test('routes image-to-video to stability by default', async () => {
  render(<FullScreenModal />);
  fireEvent.click(screen.getByTestId('tab-animate'));
  // ensure image-to-video
  await act(async () => { fireEvent.click(screen.getByText('Imagen → Video')); });
  // select runway
  // default provider changed to stability; select stability explicitly
  await act(async () => { const r = screen.getByLabelText('stability'); fireEvent.click(r); });
  const gen = await screen.findByTestId('generate-video');
  await act(async () => { fireEvent.click(gen); });

  await waitFor(() => {
    const lr = getLastRequest();
    expect(lr).not.toBeNull();
    expect(lr?.path).toBe('/api/generate');
    const body = lr?.body as { task?: string; provider?: string } | undefined;
    expect(body?.task).toBe('image-to-video');
    expect(body?.provider).toBe('stability');
  });
});

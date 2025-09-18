import { useCallback } from 'react';

type SoundType = 'generative' | 'confirm' | 'toggle' | 'success' | 'error';

const soundMap: Record<SoundType, string> = {
  generative: '/sounds/generative.mp3',
  confirm: '/sounds/confirm.mp3',
  toggle: '/sounds/toggle.mp3',
  success: '/sounds/confirm.mp3',
  error: '/sounds/toggle.mp3'
};

export const useSound = () => {
  const playSound = useCallback((type: SoundType) => {
    const src = soundMap[type];
    if (!src) return Promise.resolve();

    try {
      const audio = new Audio(src);
      // Ensure quick, non-blocking playback; return a promise that resolves after play attempt
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        return p.catch((err) => {
          // Autoplay may be blocked — swallow error
          console.warn('Audio play blocked:', err);
        });
      }
      return Promise.resolve();
    } catch (e) {
      console.warn('Audio playback failed', e);
      return Promise.resolve();
    }
  }, []);

  const playSoundUrl = useCallback((url: string) => {
    try {
      const audio = new Audio(url);
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        return p.catch((err) => console.warn('Audio play blocked:', err));
      }
      return Promise.resolve();
    } catch (e) {
      console.warn('Audio playback failed', e);
      return Promise.resolve();
    }
  }, []);

  return { playSound, playSoundUrl };
};

export default useSound;
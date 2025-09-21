import { create } from 'zustand';
import { GeneratedImage, PredictiveInsight } from '@/lib/mockData.ts';

export type UserRole = 'Director' | 'Copywriter' | 'Client';
export type CanvasState = 'welcome' | 'generating' | 'results' | 'singleResult';

interface AppState {
  // Prompt and generation
  promptText: string;
  setPromptText: (text: string) => void;
  
  // Generated assets
  generatedAssets: GeneratedImage[];
  setGeneratedAssets: (assets: GeneratedImage[]) => void;
  // Refresh templates from storage
  fetchTemplates: () => void;
  
  // Canvas state
  canvasState: CanvasState;
  setCanvasState: (state: CanvasState) => void;
  
  // User role
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  
  // Analytics
  predictiveInsights: PredictiveInsight[];
  setPredictiveInsights: (insights: PredictiveInsight[]) => void;
  
  // Loading states
  isGeneratingStrategy: boolean;
  setIsGeneratingStrategy: (loading: boolean) => void;

  // Prompt UI shake trigger (for empty prompt feedback)
  promptShake: number;
  setPromptShake: (val: number) => void;
  
  // Selected image for modal
  selectedImage: GeneratedImage | null;
  setSelectedImage: (image: GeneratedImage | null) => void;
  // Modal task preselection (e.g. 'image-to-video')
  modalTask: string | null;
  setModalTask: (task: string | null) => void;
  // Newly generated single result (preview before saving as template)
  newlyGeneratedImage: GeneratedImage | null;
  setNewlyGeneratedImage: (image: GeneratedImage | null) => void;
  // Trigger token to initiate generation flow from TopBar
  generationTrigger: number | null;
  setGenerationTrigger: (token: number | null) => void;
  // Credits system
  credits: number;
  initializeCredits: () => void;
  deductCredit: () => void;
  setCredits: (n: number) => void;
}

export const useStore = create<AppState>((set) => ({
  // Prompt and generation
  promptText: '',
  setPromptText: (text) => set({ promptText: text }),
  
  // Generated assets
  generatedAssets: [],
  setGeneratedAssets: (assets) => set({ generatedAssets: assets }),

  fetchTemplates: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = window.localStorage.getItem('meta_ad_studio_templates_v1');
      if (!raw) return;
  const parsed = JSON.parse(raw) as GeneratedImage[];
  // Convert timestamps
  parsed.forEach(p => { if (p.timestamp && typeof p.timestamp === 'string') p.timestamp = new Date(p.timestamp as unknown as string); });
      set({ generatedAssets: parsed });
  } catch (e) { /* noop (debug removed) */ }
  },
  
  // Canvas state
  canvasState: 'welcome',
  setCanvasState: (state) => set({ canvasState: state }),
  
  // User role
  currentUserRole: 'Director',
  setCurrentUserRole: (role) => set({ currentUserRole: role }),
  
  // Analytics
  predictiveInsights: [],
  setPredictiveInsights: (insights) => set({ predictiveInsights: insights }),
  
  // Loading states
  isGeneratingStrategy: false,
  setIsGeneratingStrategy: (loading) => set({ isGeneratingStrategy: loading }),

  // Prompt shake
  promptShake: 0,
  setPromptShake: (val) => set({ promptShake: val }),
  
  // Selected image for modal
  selectedImage: null,
  setSelectedImage: (image) => set({ selectedImage: image }),
  // Modal task preselection (e.g. 'image-to-video')
  modalTask: null,
  setModalTask: (task) => set({ modalTask: task }),
  // Newly generated single result
  newlyGeneratedImage: null,
  setNewlyGeneratedImage: (image) => set({ newlyGeneratedImage: image }),
  // Generation trigger token
  generationTrigger: null,
  setGenerationTrigger: (token) => set({ generationTrigger: token }),
  // Credits system (default 0 until initialized)
  credits: 0,
  initializeCredits: () => set({ credits: 2 }),
  deductCredit: () => set((state: AppState) => ({ credits: Math.max(0, (state.credits || 0) - 1) })),
  // Set authoritative credits value (from server)
  setCredits: (n: number) => set({ credits: Math.max(0, n) }),
}));

// Expose store to window for E2E tests to inspect state (only in browser)
// Provide a safe getter so consumers (and tests) can access the hook factory
export function getAppStore() {
  return useStore;
}

// Attach to window when running in the browser. Prefer attaching from the
// application entry (`main.tsx`) for reliability in production/preview builds.
declare global {
  interface Window {
    __APP_STORE__?: unknown;
  }
}

if (typeof window !== 'undefined' && import.meta.env.VITE_APP_ENV === 'development' && !window.__APP_STORE__) {
  window.__APP_STORE__ = useStore;
}

// ---- Test helpers (DEV/E2E only) ----
// Add minimal helpers to manipulate templates programmatically from tests.
// These are intentionally only attached in development or when an E2E flag is set.
export function clearTemplates() {
  try {
    setTimeout(() => {
      // empty the store's generatedAssets and localStorage
      useStore.setState({ generatedAssets: [] });
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('meta_ad_studio_templates_v1');
      }
    }, 0);
    return true;
  } catch (e) {
    /* noop (debug removed) */
    return false;
  }
}

export function addTemplates(templates: GeneratedImage[]) {
  try {
    // normalize timestamps
    const normalized = (templates || []).map(t => ({ ...t, timestamp: t.timestamp ? new Date(t.timestamp as unknown as string) : new Date() }));
    // merge into existing generatedAssets
  useStore.setState((state: AppState) => {
      const existing = state.generatedAssets || [];
      const merged = existing.concat(normalized);
      // persist to localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('meta_ad_studio_templates_v1', JSON.stringify(merged));
        }
      } catch (e) { /* noop */ }
  return { generatedAssets: merged } as Partial<AppState> as AppState;
    });
    return true;
  } catch (e) {
    /* noop (debug removed) */
    return false;
  }
}

export function setPreviewVideo(id: string, url: string) {
  try {
    useStore.setState((state: AppState) => {
      const assets = state.generatedAssets || [];
      const idx = assets.findIndex(a => a.id === id);
      if (idx === -1) return {} as Partial<AppState> as AppState;
      const copy = assets.slice();
      copy[idx] = { ...copy[idx], previewVideoUrl: url };
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('meta_ad_studio_templates_v1', JSON.stringify(copy));
        }
      } catch (e) { /* noop */ }
      return { generatedAssets: copy, selectedImage: copy[idx] } as Partial<AppState> as AppState;
    });
    return true;
  } catch (e) {
    /* noop (debug removed) */
    return false;
  }
}

// Expose a compact helpers object on window for E2E when in DEV or when __E2E__ is true
// Attach helpers to window for DEV/E2E. Use eslint-disable comments to avoid noisy rules
// since these are intentionally dynamic, dev-only helpers.
/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof window !== 'undefined' && (import.meta.env.DEV || (window as any).__E2E__)) {
  try {
  (window as any).__APP_STORE_HELPERS__ = (window as any).__APP_STORE_HELPERS__ || {};
  (window as any).__APP_STORE_HELPERS__.clearTemplates = clearTemplates;
  (window as any).__APP_STORE_HELPERS__.addTemplates = addTemplates;
  (window as any).__APP_STORE_HELPERS__.selectImageById = (id: string) => {
      if (!id) return false;
      const found = useStore.getState().generatedAssets?.find((g: any) => g.id === id) || null;
      useStore.setState({ selectedImage: found });
      return !!found;
    };
    // attach setPreviewVideo directly so tests can deterministically set preview urls
    (window as any).__APP_STORE_HELPERS__.setPreviewVideo = (id: string, url: string) => {
      return setPreviewVideo(id, url);
    };
  } catch (e) { /* noop (debug removed) */ }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
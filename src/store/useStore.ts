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
  // Newly generated single result (preview before saving as template)
  newlyGeneratedImage: GeneratedImage | null;
  setNewlyGeneratedImage: (image: GeneratedImage | null) => void;
  // Trigger token to initiate generation flow from TopBar
  generationTrigger: number | null;
  setGenerationTrigger: (token: number | null) => void;
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
    } catch (e) { console.debug('fetchTemplates error', e); }
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
  // Newly generated single result
  newlyGeneratedImage: null,
  setNewlyGeneratedImage: (image) => set({ newlyGeneratedImage: image }),
  // Generation trigger token
  generationTrigger: null,
  setGenerationTrigger: (token) => set({ generationTrigger: token }),
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
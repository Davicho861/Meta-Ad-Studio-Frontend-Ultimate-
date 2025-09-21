import type { ProviderModule } from '@/lib/ai-providers';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStore, getAppStore } from '@/store/useStore';
import type { GeneratedImage } from '@/lib/mockData';
import { useSound } from '@/hooks/useSound';
import { toast } from 'sonner';
import providersList from '@/lib/ai-providers';
import { 
  X, 
  Shuffle, 
  Sparkles, 
  Play, 
  Palette, 
  Video, 
  Download,
  Eye,
  Zap
} from 'lucide-react';
import cognitiveCore from '@/lib/cognitive-core';

export const FullScreenModal = () => {
  const { selectedImage, setSelectedImage, setCanvasState, setGeneratedAssets, credits, deductCredit } = useStore();
  const { modalTask, setModalTask } = useStore();
  const { playSound } = useSound();
  const [brandApplied, setBrandApplied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'animate'>('overview');
  const [selectedProvider, setSelectedProvider] = useState<string>('stability');
  const [taskType, setTaskType] = useState<'text-to-image' | 'image-to-video' | 'text-to-audio'>('image-to-video');
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // When modal is opened via store with a preselected task, apply it
  useEffect(() => {
    if (selectedImage && modalTask) {
      // ensure animate tab and task type are set
      if (modalTask === 'image-to-video') {
        setActiveTab('animate');
        setTaskType('image-to-video');
      }
      // reset modalTask after consuming
      try { setModalTask(null); } catch (e) { void e; }
    }
  }, [selectedImage, modalTask, setModalTask]);

  if (!selectedImage) return null;
  if (!isClient) return null;

  const handleClose = () => {
    setSelectedImage(null);
  playSound('toggle');
  };

  const handleVary = () => {
  playSound('generative');
    setSelectedImage(null);
    setCanvasState('generating');
    
    // Simulate new generation
    setTimeout(() => {
      // Generate new variations (mock)
      const variations = Array.from({ length: 4 }, (_, i) => ({
        ...selectedImage,
        id: `var_${selectedImage.id}_${i}`,
        url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=800&h=600&fit=crop`,
        prompt: selectedImage.prompt + ` (Variation ${i + 1})`
      }));
      
      setGeneratedAssets(variations);
      setCanvasState('results');
    }, 3000);
  };

  const handleRemix = () => {
  playSound('generative');
    setSelectedImage(null);
    setCanvasState('generating');
    
    // Simulate remix generation
    setTimeout(() => {
      const remixes = Array.from({ length: 4 }, (_, i) => ({
        ...selectedImage,
        id: `remix_${selectedImage.id}_${i}`,
        url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=800&h=600&fit=crop`,
        prompt: `Remix: ${selectedImage.prompt} with enhanced creative elements`
      }));
      
      setGeneratedAssets(remixes);
      setCanvasState('results');
    }, 3500);
  };

  const handleImmersiveSimulator = () => {
  playSound('confirm');
    setIsSimulating(!isSimulating);
    
    if (!isSimulating) {
      toast.success('🌐 Immersive Context Activated', {
        description: 'Viewing ad in virtual environment'
      });
    }
  };

  const handleBrandIdentity = () => {
  playSound('toggle');
    setBrandApplied(!brandApplied);
    
    if (!brandApplied) {
      toast.success('🎨 Brand Identity Applied', {
        description: 'Corporate colors and logo integrated'
      });
    } else {
      toast.info('👁️ Original Version Restored');
    }
  };

  const handleCaseStudyVideo = () => {
  playSound('success');
    toast.success('🎬 Case Study Video Generated', {
      description: 'Conceptual video ready for client presentation',
      action: {
        label: 'Download',
        onClick: () => {
          // Trigger download (placeholder) — removed debug logging for production readiness
          try {
            // existing download logic should be here; no-op to avoid side effects in demo
          } catch (e) {
            // swallow silently in UI demo
          }
        }
      }
    });
  };

  // Extracted handler for generating videos/images/audio to keep JSX clean and avoid nested syntax issues
  const handleGenerateVideo = async () => {
    // Check credits from store
    if (!credits || credits <= 0) {
      toast.error('Necesitas más créditos para generar videos.');
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);

    try {
      // Local-first: call the unified mock API route. External proxy removed.
      const qs = `?provider=${encodeURIComponent(selectedProvider)}&task=${encodeURIComponent(taskType)}`;
      const resp = await fetch(`/api/generate${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-provider': selectedProvider, 'x-task': taskType },
        body: JSON.stringify({ provider: selectedProvider, imageId: selectedImage.id, task: taskType, prompt: selectedImage.prompt })
      });

      if (resp.status === 402) {
        await resp.text();
        toast.error('No hay créditos suficientes.');
        setIsGeneratingVideo(false);
        return;
      }

  /* eslint-disable @typescript-eslint/no-explicit-any -- legacy mock API response handling */
  let data: any = undefined;
  try { data = await resp.json(); } catch (err) {
        try { const txt = await resp.text(); data = JSON.parse(txt); } catch (e) { data = undefined; }
      }
  /* eslint-enable @typescript-eslint/no-explicit-any */

      // apply credits if present
      if (data && typeof data.newCredits === 'number') {
        const newCreditsImmediate = data.newCredits;
        try { (((window as unknown) as Record<string, unknown>).__LAST_NEW_CREDITS__ = newCreditsImmediate); } catch (e) { void e; }
        try { useStore.setState({ credits: newCreditsImmediate }); } catch (e) { void e; }
        try { useStore.getState().setCredits(newCreditsImmediate); } catch (e) { void e; }
        try { getAppStore().setState({ credits: newCreditsImmediate }); } catch (e) { void e; }
      }

      const videoUrl = data && (data.previewVideoUrl || data.url || (data.output && (data.output.url || data.output)) || (data.output && data.output[0] && data.output[0].url));

      if (videoUrl) {
        // create new template
        try {
          const md = await import('@/lib/mockData.ts');
          const newId = `video_${selectedImage.id}_${Date.now()}`;
          const newTemplate: GeneratedImage = { ...selectedImage, id: newId, previewVideoUrl: videoUrl, timestamp: new Date(), type: 'uploaded' };
          md.addTemplate(newTemplate);
          try { (await import('@/store/useStore')).getAppStore()().fetchTemplates(); } catch (e) { void e; }
        } catch (e) { void e; }

        // gentle progress animation
        const start = Date.now();
        let progress = 0;
        while (Date.now() - start < 3000) {
          // bump progress smoothly
          await new Promise(r => setTimeout(r, 120));
          progress = Math.min(95, progress + Math.floor(Math.random() * 12) + 6);
          setVideoProgress(progress);
        }
        setVideoProgress(100);
        toast.success(`¡Video generado con ${data.provider || 'desconocido'}!`);
      } else if (data && data.status && data.status === 'pending') {
        // pending: the proxy returned early; show pending message and keep UI waiting
        toast.info('La generación está en curso, espera unos segundos...');
        // animate modest progress
        let p = 10;
        while (p < 90) { await new Promise(r => setTimeout(r, 500)); p += 10; setVideoProgress(p); }
        setVideoProgress(100);
      } else {
        toast.error('La generación falló.');
      }
    } catch (e) {
      toast.error('Error al generar el video.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="h-full flex"
        >
          {/* Image Section */}
          <div className="flex-1 relative bg-gradient-subtle">
            <div className="absolute inset-4 flex items-center justify-center">
              <div className="relative max-w-4xl max-h-full">
                {/* Toggle between image and video when simulating */}
                  {!isSimulating && !isGeneratingVideo ? (
                    // Show static image or edited version
                    <motion.img
                      src={selectedImage.url}
                      alt={selectedImage.prompt}
                      className={`w-full h-full object-contain rounded-lg shadow-elegant transition-all duration-500 ${
                        brandApplied ? 'sepia-50 hue-rotate-180 saturate-200' : ''
                      } ${optimized ? 'contrast-110 saturate-110' : ''}`}
                      layoutId={`image-${selectedImage.id}`}
                    />
                  ) : isGeneratingVideo ? (
                    // While generating video show a placeholder progress
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="mb-2">Generando video... {videoProgress}%</div>
                        <div className="w-48 h-2 bg-white/20 rounded overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${videoProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <video
                      className="w-full h-full object-cover rounded-lg shadow-elegant"
                      src={selectedImage.previewVideoUrl || '/videos/nexus_preview.mp4'}
                      controls
                      loop
                      muted
                      autoPlay
                    />
                  )}

                {/* Brand Logo Overlay: simulated with positioned element */}
                <AnimatePresence>
                  {brandApplied && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-6 right-6 w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-primary/30"
                      style={{ pointerEvents: 'none' }}
                    >
                      <span className="text-primary-foreground font-bold text-lg">M</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* E2E/Testability hook: expose a simple video element when a previewVideoUrl is present
                    This element is only added in DEV or when window.__E2E__ is set to true so it does not
                    affect production. Tests can reliably wait for this element. */}
                {
                  // Expose a small E2E hook without using `any`
                  (typeof window !== 'undefined' && ((((window as unknown) as { __E2E__?: boolean }).__E2E__) || import.meta.env.DEV)) && selectedImage.previewVideoUrl && (
                    <div className="absolute bottom-4 left-4 w-36 h-20 z-50">
                      <video data-testid="e2e-preview-video" src={selectedImage.previewVideoUrl} muted playsInline preload="metadata" className="w-full h-full object-cover rounded" />
                    </div>
                  )
                }
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
              aria-label="Close creative lab"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Controls Section */}
          <div className="w-80 bg-card/95 backdrop-blur-xl border-l border-border/30 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Creative Lab</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedImage.prompt}
                </p>
              </div>

              {/* Tabs for new tools */}
              <div className="flex gap-2">
                <button data-testid="tab-overview" className={`px-2 py-1 rounded ${activeTab === 'overview' ? 'bg-primary text-white' : 'bg-card/30'}`} onClick={() => setActiveTab('overview')}>Overview</button>
                {selectedImage.type === 'uploaded' && (
                  <>
                    <button data-testid="tab-edit" className={`px-2 py-1 rounded ${activeTab === 'edit' ? 'bg-primary text-white' : 'bg-card/30'}`} onClick={() => setActiveTab('edit')}>Edición Contextual (IA)</button>
                    <button data-testid="tab-animate" className={`px-2 py-1 rounded ${activeTab === 'animate' ? 'bg-primary text-white' : 'bg-card/30'}`} onClick={() => setActiveTab('animate')}>Animar Imagen (IA)</button>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleVary}
                    className="w-full justify-start gap-3 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    <Shuffle className="w-4 h-4" />
                    Create Variations
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => {
                      // Simulate optimization via cognitive core
                      const res = cognitiveCore.optimizeAsset(selectedImage.id);
                      setOptimized(true);
                      playSound('confirm');
                      toast.success(res.message);
                      // revert visual tweak after short delay to simulate non-destructive optimization preview
                      setTimeout(() => setOptimized(false), 3000);
                    }}
                    variant="outline"
                    className="w-full justify-start gap-3 border-primary/30 hover:bg-primary/10"
                  >
                    <Zap className="w-4 h-4" />
                    Optimizar para Engagement (IA)
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleRemix}
                    variant="outline"
                    className="w-full justify-start gap-3 border-primary/30 hover:bg-primary/10"
                  >
                    <Sparkles className="w-4 h-4" />
                    Remix Concept
                  </Button>
                </motion.div>
              </div>

              {/* Contextual Edit Tab */}
              {activeTab === 'edit' && selectedImage.type === 'uploaded' && (
                <div className="pt-4">
                  <h3 className="text-sm font-semibold">Edición Contextual (IA)</h3>
                  <p className="text-xs text-muted-foreground mb-2">Dibuja un recuadro sobre la imagen y escribe un prompt para aplicar relleno contextual.</p>

                  <div className="mb-2 border rounded p-2 bg-card/30">
                    {/* Simple selection placeholder: allow user to set a mock rect */}
                    <label className="text-xs">Selección (x,y,w,h)</label>
                    <div className="flex gap-2 mt-1">
                      <input className="w-16 p-1 border rounded" placeholder="x" onChange={(e) => setSelectionRect({ x: Number(e.target.value) || 0, y: selectionRect?.y || 0, w: selectionRect?.w || 0, h: selectionRect?.h || 0 })} />
                      <input className="w-16 p-1 border rounded" placeholder="y" onChange={(e) => setSelectionRect({ x: selectionRect?.x || 0, y: Number(e.target.value) || 0, w: selectionRect?.w || 0, h: selectionRect?.h || 0 })} />
                      <input className="w-16 p-1 border rounded" placeholder="w" onChange={(e) => setSelectionRect({ x: selectionRect?.x || 0, y: selectionRect?.y || 0, w: Number(e.target.value) || 0, h: selectionRect?.h || 0 })} />
                      <input className="w-16 p-1 border rounded" placeholder="h" onChange={(e) => setSelectionRect({ x: selectionRect?.x || 0, y: selectionRect?.y || 0, w: selectionRect?.w || 0, h: Number(e.target.value) || 0 })} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-xs">Prompt de Relleno:</label>
                    <input data-testid="edit-prompt" id="editPrompt" className="w-full mt-1 p-2 border rounded" placeholder="Describe la edición a aplicar" />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      data-testid="generate-video"
                      onClick={async () => {
                        const inp = (document.getElementById('editPrompt') as HTMLInputElement)?.value || '';
                        if (!inp) {
                          toast.error('Introduce un prompt para aplicar la edición');
                          return;
                        }
                        setIsApplyingEdit(true);
                        // simulate processing
                        await new Promise(r => setTimeout(r, 2300));

                        // Simulated replacement: if prompt mentions 'Coca-Cola' or 'coca', use a prepared shibuya image
                        let replacement = selectedImage.url;
                        if (/coca/i.test(inp)) {
                          replacement = '/images/campaign-examples/nexus_arena_shibuya.webp';
                        } else {
                          // generic edited placeholder
                          replacement = selectedImage.url; // keep same for now
                        }

                        // Persist as a new template version
                        try {
                          const newId = `edited_${selectedImage.id}_${Date.now()}`;
                          const newTemplate: GeneratedImage = {
                            ...selectedImage,
                            id: newId,
                            url: replacement,
                            prompt: `${selectedImage.prompt} — Edit: ${inp}`,
                            timestamp: new Date(),
                            type: 'uploaded'
                          };
                          // addTemplate is imported via cognitiveCore? use dynamic import to avoid circular deps
                          const md = await import('@/lib/mockData.ts');
                          md.addTemplate(newTemplate);
                          // update store view
                          try { (await import('@/store/useStore')).getAppStore()().fetchTemplates(); } catch { /* noop */ }
                        } catch (e) { /* noop */ }

                        setIsApplyingEdit(false);
                        toast.success('¡Edición contextual aplicada con éxito!');
                      }}
                      className="w-full bg-gradient-primary"
                    >
                      Aplicar Edición (IA)
                    </Button>
                  </div>
                </div>
              )}

              {/* Animate Tab */}
              {activeTab === 'animate' && selectedImage.type === 'uploaded' && (
                <div className="pt-4">
                  <h3 className="text-sm font-semibold">Animar Imagen (IA)</h3>
                  <p className="text-xs text-muted-foreground mb-2">Selecciona un estilo de movimiento y genera un videoclip contextual.</p>

                  <div className="mb-3 p-2 border rounded bg-card/30">
                    <label className="text-xs font-medium">Créditos restantes: {credits}</label>
                    <div className="mt-2">
                      <label className="text-xs">Tarea</label>
                      <div className="flex gap-2 mt-1 mb-2">
                        <button onClick={() => setTaskType('text-to-image')} className={`px-2 py-1 rounded ${taskType==='text-to-image' ? 'bg-primary text-white' : 'bg-card/30'}`}>Texto → Imagen</button>
                        <button onClick={() => setTaskType('image-to-video')} className={`px-2 py-1 rounded ${taskType==='image-to-video' ? 'bg-primary text-white' : 'bg-card/30'}`}>Imagen → Video</button>
                        <button onClick={() => setTaskType('text-to-audio')} className={`px-2 py-1 rounded ${taskType==='text-to-audio' ? 'bg-primary text-white' : 'bg-card/30'}`}>Texto → Audio</button>
                      </div>

                      <label className="text-xs">Proveedor</label>
                      <div className="flex flex-col mt-1">
                          {providersList.filter((p): p is ProviderModule => p.capabilities?.includes(taskType)).map((p) => {
                            const mod = p;
                            return (
                              <label key={mod.name} className="inline-flex items-center mt-1">
                                <input type="radio" name="provider" value={mod.name} checked={selectedProvider===mod.name} onChange={() => setSelectedProvider(mod.name)} className="mr-2"/>
                                {mod.name}
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mb-3">
                    <div className="flex gap-2">
                      <button onClick={() => toast.info('Paneo Sutil seleccionado')} className="px-2 py-1 rounded border">Paneo Sutil</button>
                      <button onClick={() => toast.info('Zoom Lento seleccionado')} className="px-2 py-1 rounded border">Zoom Lento</button>
                      <button onClick={() => toast.info('Órbita 3D seleccionado')} className="px-2 py-1 rounded border">Órbita 3D</button>
                    </div>
                  </div>

                  <div className="flex gap-2" data-testid="animate-controls">
                    <Button
                      onClick={handleGenerateVideo}
                      data-testid="generate-video"
                      className="w-full bg-gradient-primary"
                      disabled={!credits || credits <= 0}
                      title={!credits || credits <= 0 ? 'Necesitas más créditos para generar videos.' : ''}
                    >
                      Generar Video (IA)
                    </Button>
                  </div>

                </div>
              )}

              {/* Advanced Tools */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Advanced Tools</h3>
                
                <Button
                  onClick={handleImmersiveSimulator}
                  variant={isSimulating ? "default" : "outline"}
                  className="w-full justify-start gap-3"
                >
                  <Play className="w-4 h-4" />
                  {isSimulating ? 'Exit Simulator' : 'Immersive Context'}
                </Button>

                <Button
                  onClick={handleBrandIdentity}
                  variant={brandApplied ? "default" : "outline"}
                  className="w-full justify-start gap-3"
                >
                  <Palette className="w-4 h-4" />
                  {brandApplied ? 'Remove Brand' : 'Apply Brand Identity'}
                </Button>

                <Button
                  onClick={handleCaseStudyVideo}
                  variant="outline"
                  className="w-full justify-start gap-3 border-accent/30 hover:bg-accent/10"
                >
                  <Video className="w-4 h-4" />
                  Generate Case Study
                </Button>
              </div>

              {/* Performance Metrics */}
              {selectedImage.engagement && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Performance Metrics</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement:</span>
                      <span className="text-accent font-medium">{selectedImage.engagement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CTR:</span>
                      <span className="text-accent font-medium">{selectedImage.ctr}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reach:</span>
                      <span className="text-accent font-medium">{selectedImage.reach?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Actions */}
              <div className="pt-4 border-t border-border/30">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    playSound('success');
                    toast.success('Asset exported successfully');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export High-Res
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>, document.body
  );
};
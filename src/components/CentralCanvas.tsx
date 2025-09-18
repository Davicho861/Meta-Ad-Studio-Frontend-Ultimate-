import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import { mockImages, promptSuggestions, GeneratedImage, addTemplate } from '@/lib/mockData.ts';
import { toast } from 'sonner';
import GalleryModal from './GalleryModal';
import {
  Plus,
  Image,
  Video,
  Layers,
  Sparkles,
  Wand2,
  Download,
  Share,
  Eye,
  RotateCcw,
  Zap,
  Users
} from 'lucide-react';

const CentralCanvas: React.FC = () => {
  interface LottieProps { animationData?: unknown; loop?: boolean }
  const [LottieModule, setLottieModule] = useState<React.ComponentType<LottieProps> | null>(null);
  const [lottieData, setLottieData] = useState<unknown>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
        try {
          const mod = await import('lottie-react');
          if (!mounted) return;
          // cast module default to a React component type for rendering
          const Comp = (mod?.default || mod) as React.ComponentType<LottieProps>;
          setLottieModule(() => Comp);
          try {
            const res = await fetch('https://assets10.lottiefiles.com/packages/lf20_j1adxtyb.json');
            if (res.ok) {
              const json = await res.json();
              if (mounted) setLottieData(json);
            }
          } catch (e) { console.debug('lottie fetch error', e); }
        } catch (e) { console.debug('lottie import error', e); }
    })();
    return () => { mounted = false; };
  }, []);

  const { canvasState, setCanvasState, generatedAssets, setGeneratedAssets, promptText, setPromptText, setSelectedImage, setPromptShake, newlyGeneratedImage, setNewlyGeneratedImage, generationTrigger, setGenerationTrigger } = useStore();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const { playSound } = useSound();
  const [lastGenerationToken, setLastGenerationToken] = useState<number | null>(null);

  // Centralized generation routine so both the local button and TopBar trigger can start it
  const doSimulatedGeneration = () => {
    // If prompt is empty, give feedback
    if (!promptText.trim()) {
      playSound('toggle');
      toast.error('Por favor, describe tu visión creativa');
      setPromptShake(Date.now());
      return;
    }

    playSound('generative');
    setCanvasState('generating');

    setTimeout(() => {
      const simulatedUrl = '/images/campaign-examples/aura_times_square.webp';
      const generated: GeneratedImage = {
        id: `single_${Date.now()}`,
        url: simulatedUrl,
        srcWebp: simulatedUrl,
        prompt: promptText,
        timestamp: new Date(),
        engagement: Math.floor(Math.random() * 20 + 75),
        ctr: Math.floor(Math.random() * 3 + 3),
        reach: Math.floor(Math.random() * 50000 + 100000)
      };

      setNewlyGeneratedImage(generated);
      setGeneratedAssets([generated, ...generatedAssets]);
      setCanvasState('singleResult');
      playSound('success');
      toast.success('Resultado generado');
    }, 3500);
  };

  const handleGenerate = () => {
    // Trigger generation via centralized routine and update trigger token for listeners
    if (typeof setGenerationTrigger === 'function') setGenerationTrigger(Date.now());
    doSimulatedGeneration();
  };

  // If TopBar triggers generation by updating the token, react to it here
  useEffect(() => {
    if (!generationTrigger) return;
    if (generationTrigger === lastGenerationToken) return;
    setLastGenerationToken(generationTrigger);
    // start generation routine
    doSimulatedGeneration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationTrigger]);

  const handleCategoryClick = (category: string) => {
    playSound('toggle');
    if (promptText.trim()) setPromptText(promptText + ' ' + category);
    else setPromptText(category);
  };

  const handleNewProject = () => { playSound('toggle'); try { navigate('/campaigns'); } catch { window.location.href = '/campaigns'; } };
  const handleImageClick = (image: GeneratedImage) => { playSound('toggle'); setSelectedImage(image); };

  return (
    <div className="flex-1 bg-background relative overflow-hidden" data-testid="central-canvas">
      <div className="absolute inset-0 bg-gradient-subtle opacity-30 pointer-events-none" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-glow opacity-20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-6 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="border-border/30 hover:border-primary/50" onClick={handleNewProject}>
                  <Plus className="w-4 h-4 mr-2" /> New Project
                </Button>
              </motion.div>

              <Button variant="ghost" onClick={() => { playSound('toggle'); setIsGalleryOpen(true); }}>
                <Image className="w-4 h-4 mr-2" /> Gallery
              </Button>

              <Button variant="ghost" onClick={() => { playSound('toggle'); toast('Funcionalidad en desarrollo'); }}>
                <Video className="w-4 h-4 mr-2" /> Templates
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary"><Layers className="w-3 h-3 mr-1" /> Canvas Mode</Badge>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {canvasState === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <Sparkles className="w-12 h-12 text-primary-foreground" />
                  </motion.div>

                  <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-2xl font-bold text-foreground mb-3">Welcome to the Creative Universe</motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-muted-foreground mb-8">Describe your metaverse advertising vision and watch as AI transforms it into stunning campaigns that define cultural moments.</motion.p>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={handleGenerate} size="lg" variant="cta" className="transition-all duration-300 mb-8"><Wand2 className="w-5 h-5 mr-2" /> Start Creating</Button>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex justify-center gap-4">
                    {promptSuggestions.categories.map((category, index) => (
                      <motion.div key={category} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => handleCategoryClick(category)}>
                        <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/20 hover:border-primary/30 transition-all cursor-pointer">
                          {index === 0 && <Image className="w-6 h-6 text-primary mx-auto mb-2" />}
                          {index === 1 && <Video className="w-6 h-6 text-accent mx-auto mb-2" />}
                          {index === 2 && <Users className="w-6 h-6 text-secondary-bright mx-auto mb-2" />}
                          {index === 3 && <Layers className="w-6 h-6 text-warning mx-auto mb-2" />}
                          <p className="text-sm text-muted-foreground">{category}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {canvasState === 'generating' && (
              <motion.div key="generating" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }} className="h-full flex items-center justify-center">
                <div className="text-center" data-testid="generating-indicator">
                  {LottieModule && lottieData ? (
                    <div className="w-48 h-48 mx-auto mb-6">{LottieModule && (() => {
                      const LottieComp = LottieModule as React.ComponentType<LottieProps>;
                      return <LottieComp animationData={lottieData} loop={true} />;
                    })()}</div>
                  ) : (
                    <>
                      <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }} className="w-32 h-32 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow"><Zap className="w-16 h-16 text-primary-foreground" /></motion.div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">Crafting Your Vision</h2>
                      <p className="text-muted-foreground mb-6">Our AI is analyzing trends, optimizing for engagement, and generating your metaverse masterpiece...</p>
                      <div className="flex justify-center gap-2 mb-4">{[0,150,300].map((delay, index) => (<motion.div key={index} animate={{ y: [-10,0,-10] }} transition={{ duration: 0.6, repeat: Infinity, delay: delay/1000 }} className="w-2 h-2 bg-primary rounded-full" />))}</div>
                      <p className="text-sm text-accent">Estimated completion: 30 seconds</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {canvasState === 'singleResult' && newlyGeneratedImage && (
              <motion.div key="singleResult" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="h-full flex flex-col items-center justify-start">
                <div className="w-full max-w-3xl p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Resultado Único</h2>
                  <p className="text-muted-foreground mb-4">{newlyGeneratedImage.prompt}</p>
                  <div className="w-full aspect-[16/9] mb-4">
                    <img src={newlyGeneratedImage.url} alt={newlyGeneratedImage.prompt} className="w-full h-full object-cover rounded-lg shadow-md" />
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => {
                      setNewlyGeneratedImage(null);
                      setCanvasState('results');
                    }} variant="outline">Volver a la Galería</Button>

                    <Button onClick={() => {
                      if (!newlyGeneratedImage) return;
                      try {
                        addTemplate(newlyGeneratedImage);
                        setGeneratedAssets([...generatedAssets, newlyGeneratedImage]);
                        toast.success('¡Plantilla guardada en la galería!');
                        // reset preview
                        setNewlyGeneratedImage(null);
                        setCanvasState('results');
                      } catch (e) {
                        // Error saving template: handle/log via app telemetry if needed
                        toast.error('No se pudo guardar la plantilla');
                      }
                    }} className="bg-gradient-primary hover:shadow-glow">Guardar como Plantilla</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {canvasState === 'results' && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="h-full">
                <div className="mb-6"><h2 className="text-2xl font-bold text-foreground mb-2">Generated Campaign</h2><p className="text-muted-foreground">{promptText}</p></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {generatedAssets.map((image, index) => (
                    <motion.div key={image.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05, y: -5 }} onClick={() => handleImageClick(image)} className="cursor-pointer group">
                      <Card className="overflow-hidden border-border/30 hover:border-primary/50 transition-all">
                        <div className="aspect-square relative">
                          <picture>
                            {/* Prefer explicit srcSet entries when available */}
                            {image.srcSet?.webp && <source type="image/webp" srcSet={`${image.srcSet.webp} 1x${image.srcSet.webp2x ? `, ${image.srcSet.webp2x} 2x` : ''}`} />}
                            {image.srcSet?.jpg && <source type="image/jpeg" srcSet={`${image.srcSet.jpg} 1x${image.srcSet.jpg2x ? `, ${image.srcSet.jpg2x} 2x` : ''}`} />}
                            {/* Fallbacks: individual srcWebp/srcJpg or url */}
                            {image.srcWebp && !image.srcSet?.webp && <source type="image/webp" srcSet={image.srcWebp} />}
                            {image.srcJpg && !image.srcSet?.jpg && <source type="image/jpeg" srcSet={image.srcJpg} />}
                            <img src={image.url} alt={image.alt || image.prompt} loading="lazy" decoding="async" className="w-full h-full object-cover" aria-label={image.credit ? `Credit: ${image.credit}` : undefined} />
                          </picture>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-xs line-clamp-2">{image.prompt}</p>
                              {image.credit && <p className="text-white text-[10px] opacity-80 mt-1">Credit: {image.credit}</p>}
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Badge variant="secondary" className="text-xs"><Eye className="w-3 h-3 mr-1" /> View</Badge></div>
                        </div>
                        <div className="p-3">
                          <div className="flex justify-between text-xs text-muted-foreground"><span>Engagement: {image.engagement}%</span><span>CTR: {image.ctr}%</span></div>
                          {image.credit && <div className="mt-1 text-[11px] text-muted-foreground">{image.credit}</div>}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-4"><Button onClick={handleGenerate} className="bg-gradient-primary hover:shadow-glow"><RotateCcw className="w-4 h-4 mr-2" /> Generate More</Button>
                <Button variant="outline" onClick={() => { playSound('success'); toast.success('Assets exported successfully!'); }}><Download className="w-4 h-4 mr-2" /> Export All</Button>
                <Button variant="outline" onClick={() => { playSound('toggle'); toast('Funcionalidad en desarrollo'); }}><Share className="w-4 h-4 mr-2" /> Share Campaign</Button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  <GalleryModal open={isGalleryOpen} onOpenChange={setIsGalleryOpen} />
    </div>
  );
};

export default CentralCanvas;
export { CentralCanvas };
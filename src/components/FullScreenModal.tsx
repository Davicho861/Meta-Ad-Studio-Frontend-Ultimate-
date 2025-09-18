import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import { toast } from 'sonner';
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
  const { selectedImage, setSelectedImage, setCanvasState, setGeneratedAssets } = useStore();
  const { playSound } = useSound();
  const [brandApplied, setBrandApplied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
                {!isSimulating ? (
                  <motion.img
                    src={selectedImage.url}
                    alt={selectedImage.prompt}
                    className={`w-full h-full object-contain rounded-lg shadow-elegant transition-all duration-500 ${
                      brandApplied ? 'sepia-50 hue-rotate-180 saturate-200' : ''
                    } ${optimized ? 'contrast-110 saturate-110' : ''}`}
                    layoutId={`image-${selectedImage.id}`}
                  />
                ) : (
                  <video
                    className="w-full h-full object-cover rounded-lg shadow-elegant"
                    src="/videos/immersive-context.mp4"
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
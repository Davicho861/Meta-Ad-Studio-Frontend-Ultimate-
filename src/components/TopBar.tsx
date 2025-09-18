import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { useSound } from '@/hooks/useSound';
import { exportTemplates, importTemplatesFromJSON } from '@/lib/mockData.ts';
import { 
  Sparkles, 
  Settings, 
  User, 
  Zap,
  Brain,
  Palette
} from 'lucide-react';
import TemplatesModal from '@/components/TemplatesModal';
import cognitiveCore from '@/lib/cognitive-core';

export const TopBar = () => {
  // Assisted Mode should be true by default -> Expert Mode false
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [promptQuality, setPromptQuality] = useState<{ score: number; suggestions: string[] } | null>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const { promptText, setPromptText, setCanvasState, canvasState, promptShake, setGenerationTrigger } = useStore();
  const { playSound } = useSound();
  const [importing, setImporting] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  return (
    <div className="h-16 bg-card/50 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        {/* Export / Import templates */}
    <input id="template-import-input" type="file" accept="application/json" className="hidden" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setImporting(true);
          try {
            const txt = await file.text();
            const parsed = JSON.parse(txt);
            const added = importTemplatesFromJSON(parsed);
      toast.success(`${added.length} plantillas importadas`);
          } catch (err) {
            // import error occurred
            toast.error('Archivo inválido');
          } finally { setImporting(false); e.currentTarget.value = ''; }
        }} />
  <Button variant="ghost" size="sm" onClick={() => { exportTemplates(); toast.success('Plantillas exportadas con éxito'); }} aria-label="Exportar plantillas">Exportar</Button>
    <Button variant="ghost" size="sm" onClick={() => document.getElementById('template-import-input')?.click()} aria-label="Importar plantillas">Importar</Button>
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-holographic bg-clip-text text-transparent">
            Meta Ad Studio
          </h1>
          <p className="text-xs text-muted-foreground">Creative Operating System</p>
        </div>
      </div>

      {/* Central Magic Prompt */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          {/* Expert Mode Toggle */}
          <div className="flex items-center gap-2 mb-2">
            <Switch
              checked={isExpertMode}
              onCheckedChange={(checked) => {
                setIsExpertMode(checked);
                // play ui toggle
                playSound('toggle');
              }}
              className="data-[state=checked]:bg-accent"
              aria-label="Toggle assisted or expert mode"
            />
            <span className="text-sm text-muted-foreground">
              {isExpertMode ? 'Expert Mode' : 'Assisted Mode'}
            </span>
            {!isExpertMode && (
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Brain className="w-3 h-3 mr-1" />
                AI Guided
              </Badge>
            )}
          </div>

          {/* Prompt Input */}
          <div className="relative">
            <AnimatePresence mode="wait">
          {isExpertMode ? (
                <motion.div
                  key="expert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Textarea
                    value={promptText}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPromptText(v);
                      // Real-time simulated Linter in Expert Mode
                      const evalRes = cognitiveCore.evaluatePrompt(v);
                      setPromptQuality(evalRes);
                    }}
                    placeholder="Enter complex prompt with parameters (e.g., --style cyberpunk --ar 16:9 --chaos 50)"
                    className={`min-h-24 bg-input/50 border-border/30 focus:border-primary/50 focus:bg-input/70 transition-all duration-300 resize-none ${canvasState === 'generating' ? 'opacity-50 pointer-events-none' : ''}`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="assisted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div key={promptShake || 'input'} animate={promptShake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }} transition={{ duration: 0.6 }}>
                    <Input
                      value={promptText}
              onChange={(e) => {
                const v = e.target.value;
                setPromptText(v);
                // keep promptQuality updated even in assisted mode for preview
                const evalRes = cognitiveCore.evaluatePrompt(v);
                setPromptQuality(evalRes);
              }}
                      placeholder="Describe your metaverse ad concept..."
                      className={`pr-12 h-12 bg-input/50 border-border/30 focus:border-primary/50 focus:bg-input/70 transition-all duration-300 ${canvasState === 'generating' ? 'opacity-50 pointer-events-none' : ''}`}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="absolute right-1 top-1">
                <Button
                  size="sm"
                  className="h-10 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  onClick={() => {
                    if (promptText.trim()) {
                      playSound('generative');
                      // trigger generation flow handled by CentralCanvas
                      if (typeof setGenerationTrigger === 'function') setGenerationTrigger(Date.now());
                      setCanvasState('generating');
                    } else {
                      // visual feedback for empty prompt
                      if (toast?.warning) {
                        toast.warning('Por favor, describe tu visión creativa');
                      }
                      // trigger shake handled by CentralCanvas/Store when needed
                    }
                  }}
                  aria-label="Start generation"
                >
                  <Zap className="w-4 h-4" />
                </Button>
            </motion.div>
            {/* Prompt Quality Indicator (visible in Expert Mode) */}
            {isExpertMode && promptQuality && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Calidad del Prompt:</span>
                  <span className="font-medium">{promptQuality.score}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center" title={promptQuality.suggestions.join('\n')}>💡</button>
                  <span className="text-muted-foreground">Haz clic en la bombilla para ver sugerencias</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <AnimatePresence>
            {!isExpertMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-2 mt-2 overflow-hidden"
              >
                {['Fashion VR', 'Gaming Event', 'NFT Launch'].map((label, i) => (
                  <motion.div key={label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary-bright/20 transition-colors"
                      onClick={() => {
                        // Append suggestion to prompt (instead of replace)
                        const suggestion = i === 0
                          ? 'Luxury fashion brand launching in VR showroom'
                          : i === 1
                            ? 'Gaming platform community event announcement'
                            : 'NFT art collection reveal campaign';

                        if (promptText.trim()) {
                          setPromptText(promptText + '. ' + suggestion);
                        } else {
                          setPromptText(suggestion);
                        }
                        playSound('toggle');
                      }}
                    >
                      {i === 0 && <Palette className="w-3 h-3 mr-1" />}
                      {label}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Controls */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="hover:bg-muted/50" aria-label="Open settings">
          <Settings className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" className="hover:bg-muted/50" onClick={() => setTemplatesOpen(true)} aria-label="Abrir plantillas">
          <User className="w-4 h-4" />
        </Button>

        <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />

        {/* Avatar with dropdown menu */}
        <div className="relative">
          {/* DropdownMenu implementation using simple conditional render to avoid adding new deps */}
          <button
            aria-label="User menu"
            onClick={() => setShowAvatarMenu((s) => !s)}
            className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-glow"
          >
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </button>
          {showAvatarMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-card rounded shadow-lg border border-border/30 z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-muted/20" onClick={() => { toast('Mi Perfil (simulado)'); setShowAvatarMenu(false); }}>Mi Perfil</button>
              <button className="w-full text-left px-3 py-2 hover:bg-muted/20" onClick={() => { toast('Configuración (simulado)'); setShowAvatarMenu(false); }}>Configuración</button>
              <button className="w-full text-left px-3 py-2 hover:bg-muted/20 text-destructive" onClick={() => { toast('Cerrando sesión (simulado)'); setShowAvatarMenu(false); }}>Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
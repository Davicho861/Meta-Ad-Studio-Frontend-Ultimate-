import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, useDraggable, useDroppable, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import { toast } from 'sonner';
import { mockImages } from '@/lib/mockData';
import GalleryCard from './GalleryCard';
import cognitiveCore from '@/lib/cognitive-core';
import { 
  ArrowLeft, 
  Plus, 
  StickyNote, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle,
  Share,
  Download
} from 'lucide-react';

type AssetStatus = 'review' | 'approved' | 'rejected';

interface CanvasAsset {
  id: string;
  type: 'image' | 'note';
  x: number;
  y: number;
  content: string;
  status: AssetStatus;
  imageUrl?: string;
}

export const CampaignCanvas = () => {
  const { generatedAssets, currentUserRole } = useStore();
  const { playSound } = useSound();
  const [canvasAssets, setCanvasAssets] = useState<CanvasAsset[]>([]);
  const [inconsistentConnections, setInconsistentConnections] = useState<string[]>([]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const assetsToShow = generatedAssets.length > 0 ? generatedAssets : mockImages;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (active.id.toString().startsWith('sidebar-image-')) {
      // Dragging from sidebar - create new asset
      const imageId = active.id.toString().replace('sidebar-image-', '');
      const image = assetsToShow.find(img => img.id === imageId);
      
      if (image) {
        const newAsset: CanvasAsset = {
          id: `canvas-${Date.now()}`,
          type: 'image',
          x: Math.max(0, delta.x + 300),
          y: Math.max(0, delta.y + 100),
          content: image.prompt,
          status: 'review',
          imageUrl: image.url
        };
        
        setCanvasAssets(prev => [...prev, newAsset]);
  playSound('toggle');
        toast.success('Asset added to canvas');

        // Proactive: generate initial suggestions as ghost hints (non-persistent)
        // We store them in a lightweight state by adding very small notes marked 'review'
        const suggestions = cognitiveCore.suggestNextSteps(image.id, { assets: [{ id: newAsset.id, name: image.id, aesthetics: image.prompt }] });
        // Add first suggestion as a gentle ghost note on the canvas
        if (suggestions && suggestions.length > 0) {
          const s = suggestions[0];
          const ghostNote: CanvasAsset = {
            id: `ghost-${Date.now()}`,
            type: 'note',
            x: newAsset.x + 220,
            y: newAsset.y,
            content: `${s.title}: ${s.description}`,
            status: 'review'
          };
          setCanvasAssets(prev => [...prev, ghostNote]);
        }
      }
    } else {
      // Moving existing canvas asset
      const assetId = active.id.toString();
      setCanvasAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, x: asset.x + delta.x, y: asset.y + delta.y }
          : asset
      ));
    }
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    
    const newNote: CanvasAsset = {
      id: `note-${Date.now()}`,
      type: 'note',
      x: 400 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      content: noteText,
      status: 'review'
    };
    
    setCanvasAssets(prev => [...prev, newNote]);
    setNoteText('');
    setShowNoteInput(false);
  playSound('toggle');
    toast.success('Note added to canvas');
  };

  // Recompute incoherences: simple all-pairs between images and notes
  // Connection id format: `${imageId}::${noteId}`
  const recomputeIncoherences = (assetsList: CanvasAsset[]) => {
    const imageAssets = assetsList.filter(a => a.type === 'image');
    const noteAssets = assetsList.filter(a => a.type === 'note');
    const alerts: string[] = [];
    for (const img of imageAssets) {
      for (const note of noteAssets) {
        try {
          const res = cognitiveCore.checkCoherence({ aesthetics: img.content }, note.content as string) as { level?: string; message?: string };
          if (res && res.level === 'warning') {
            alerts.push(`${img.id}::${note.id}`);
          }
        } catch (e) {
          // ignore
        }
      }
    }
    setInconsistentConnections(alerts);
  };

  // Update recompute on assets change
  useEffect(() => {
    recomputeIncoherences(canvasAssets);
  }, [canvasAssets]);

  const handleStatusChange = (assetId: string, status: AssetStatus) => {
    setCanvasAssets(prev => prev.map(asset => 
      asset.id === assetId ? { ...asset, status } : asset
    ));
  playSound(status === 'approved' ? 'success' : 'toggle');
  };

  const handleExportCampaign = () => {
  playSound('success');
    toast.success('🚀 Campaign Exported & Integrated', {
      description: 'Task created in Asana, notification sent to Slack, assets uploaded to Google Drive'
    });
  };

  // Setup sensors for better accessibility and fluid drag
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background text-foreground">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-glow opacity-20 pointer-events-none" />
      
  <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative z-10 h-screen flex">
          {/* Asset Sidebar */}
          <div className="w-80 bg-card/50 backdrop-blur-xl border-r border-border/50 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" onClick={() => { window.history.back(); playSound('toggle'); }} aria-label="Go back">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </motion.div>
                <div>
                  <h1 className="font-bold text-lg">Campaign Canvas</h1>
                  <p className="text-xs text-muted-foreground">Collaborative Campaign Planning</p>
                </div>
              </div>

              {/* User Role Badge */}
              <Badge variant="outline" className="border-primary/30">
                {currentUserRole} Mode
              </Badge>

              {/* Available Assets */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Generated Assets</h3>
                <div className="grid grid-cols-2 gap-2">
                  {assetsToShow.map((image) => (
                    <div key={image.id}>
                      <GalleryCard image={image} className="h-20" />
                      {/* keep draggable wrapper for DnD by using DraggableAsset for drag operations */}
                      <DraggableAsset key={`draggable-${image.id}`} image={{ id: image.id, url: image.url, prompt: image.prompt }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Tools</h3>
                
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => { setShowNoteInput(!showNoteInput); playSound('toggle'); }}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <StickyNote className="w-4 h-4" />
                    Add Note
                  </Button>
                </motion.div>

                {showNoteInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add campaign note..."
                      className="min-h-20"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddNote}>
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNoteInput(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => {
                      // Simulate async integrations with staggered logs
                      playSound('confirm');
                      try {
                        // simulate API call in demo; debug logs removed for production readiness
                      } catch (e) { /* no-op */ }
                      setTimeout(() => {
                        try {
                          // simulate webhook post; debug logs removed
                        } catch (e) { /* no-op */ }
                        setTimeout(() => {
                          try {
                            // simulate upload; debug logs removed
                          } catch (e) { /* no-op */ }
                          setTimeout(() => {
                            toast.success('✅ Campaña exportada e integraciones notificadas.');
                            playSound('success');
                          }, 1000);
                        }, 1500);
                      }, 1000);
                    }}
                    className="w-full justify-start gap-2 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    <Share className="w-4 h-4" />
                    Export & Notify
                  </Button>
                </motion.div>
              </div>

              {/* Campaign Stats */}
              <div className="pt-4 border-t border-border/30 space-y-2">
                <h3 className="text-sm font-semibold">Campaign Status</h3>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assets:</span>
                    <span>{canvasAssets.filter(a => a.type === 'image').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notes:</span>
                    <span>{canvasAssets.filter(a => a.type === 'note').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved:</span>
                    <span className="text-green-400">
                      {canvasAssets.filter(a => a.status === 'approved').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <CanvasDropArea assets={canvasAssets} onStatusChange={handleStatusChange} onAddSuggestionNote={(assetId, suggestion) => {
            // add suggestion as a note near the asset
            const asset = canvasAssets.find(a => a.id === assetId);
            const x = asset ? asset.x + 120 : 400 + Math.random() * 200;
            const y = asset ? asset.y + 40 : 200 + Math.random() * 200;
            const newNote: CanvasAsset = {
              id: `note-${Date.now()}`,
              type: 'note',
              x,
              y,
              content: `${suggestion.title}: ${suggestion.description}`,
              status: 'review'
            };
            setCanvasAssets(prev => [...prev, newNote]);
            playSound('confirm');
            toast.success('Sugerencia añadida al lienzo');
          }} inconsistentConnections={inconsistentConnections} />
        </div>
      </DndContext>
    </motion.div>
  );
};

// Draggable Asset Component
type SidebarImage = { id: string; url: string; prompt: string };
const DraggableAsset = ({ image }: { image: SidebarImage }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-image-${image.id}`
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative group cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <img
        src={image.url}
        alt={image.prompt}
        className="w-full h-20 object-cover rounded-lg border border-border/30 group-hover:border-primary/50 transition-colors"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-1 left-1 right-1">
          <p className="text-xs text-white line-clamp-2">{image.prompt}</p>
        </div>
      </div>
    </div>
  );
};

// Canvas Drop Area Component
const CanvasDropArea = ({ 
  assets, 
  onStatusChange, 
  onAddSuggestionNote,
  inconsistentConnections
}: { 
  assets: CanvasAsset[];
  onStatusChange: (id: string, status: AssetStatus) => void;
  onAddSuggestionNote?: (assetId: string, suggestion: { id: string; title: string; description: string; confidence: number }) => void;
  inconsistentConnections: string[];
}) => {
  const { setNodeRef } = useDroppable({ id: 'canvas-drop-area' });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 relative bg-gradient-subtle/30 overflow-hidden"
    >
      {/* Connections overlay: draw lines between images and notes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {assets.map((a) => {
          if (a.type !== 'image') return null;
          // find nearby notes for this image (simple: all notes)
          return assets.filter(n => n.type === 'note').map((n) => {
            const connId = `${a.id}::${n.id}`;
            const x1 = a.x + 48; // rough center offset
            const y1 = a.y + 24;
            const x2 = n.x + 60;
            const y2 = n.y + 12;
            const strokeClass = inconsistentConnections.includes(connId) ? 'stroke-amber-400' : 'stroke-border/40';
            return (
              <g key={connId}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} className={`${strokeClass}`} strokeLinecap="round" />
                {inconsistentConnections.includes(connId) && (
                  <title>{`Alerta: incoherencia detectada entre activo y nota`}</title>
                )}
              </g>
            );
          });
        })}
      </svg>
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Canvas Assets */}
      {assets.map((asset) => (
        <CanvasAssetComponent
          key={asset.id}
          asset={asset}
          onStatusChange={onStatusChange}
          onAddSuggestionNote={onAddSuggestionNote}
        />
      ))}

      {/* Welcome Message */}
      {assets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Plus className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Start Building Your Campaign</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Drag assets from the sidebar to create your collaborative campaign canvas
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Individual Canvas Asset Component
const CanvasAssetComponent = ({ 
  asset, 
  onStatusChange, 
  onAddSuggestionNote
}: { 
  asset: CanvasAsset;
  onStatusChange: (id: string, status: AssetStatus) => void;
  onAddSuggestionNote?: (assetId: string, suggestion: { id: string; title: string; description: string; confidence: number }) => void;
}) => {
  // keep cognitiveCore local for quick calls
  const localCore = cognitiveCore;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: asset.id
  });

  const style = {
    position: 'absolute' as const,
    left: asset.x,
    top: asset.y,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  const getStatusIcon = (status: AssetStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case 'approved': return 'border-green-400/50 bg-green-400/10';
      case 'rejected': return 'border-red-400/50 bg-red-400/10';
      default: return 'border-yellow-400/50 bg-yellow-400/10';
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-75 scale-95' : ''
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={`relative p-4 rounded-lg backdrop-blur-sm border-2 transition-all ${getStatusColor(asset.status)}`}>
        {/* Asset Content */}
        {asset.type === 'image' ? (
          <div className="w-48 space-y-2">
            <img
              src={asset.imageUrl}
              alt={asset.content}
              className="w-full h-32 object-cover rounded-md"
            />
            <p className="text-sm text-foreground line-clamp-2">{asset.content}</p>
            {/* Floating IA action buttons */}
            <div className="absolute -right-10 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline" className="text-xs px-2" onClick={() => {
                const suggestions = localCore.suggestNextSteps(asset.id, { assets: [{ id: asset.id, name: asset.content, aesthetics: asset.content }] });
                if (suggestions && suggestions[0]) onAddSuggestionNote?.(asset.id, suggestions[0]);
              }}>+ Sugerir</Button>
              <Button size="sm" variant="outline" className="text-xs px-2" onClick={() => {
                const suggestions = localCore.suggestNextSteps(asset.id, { assets: [{ id: asset.id, name: asset.content, aesthetics: asset.content }] });
                if (suggestions && suggestions[1]) onAddSuggestionNote?.(asset.id, suggestions[1]);
              }}>+ Crear Copy</Button>
              <Button size="sm" variant="outline" className="text-xs px-2" onClick={() => {
                const suggestions = localCore.suggestNextSteps(asset.id, { assets: [{ id: asset.id, name: asset.content, aesthetics: asset.content }] });
                if (suggestions && suggestions[2]) onAddSuggestionNote?.(asset.id, suggestions[2]);
              }}>+ Audiencia</Button>
            </div>
          </div>
        ) : (
          <div className="w-48 p-3 bg-card/80 rounded-md">
            <p className="text-sm text-foreground">{asset.content}</p>
          </div>
        )}

        {/* Status Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            {getStatusIcon(asset.status)}
            <span className="text-xs capitalize">{asset.status}</span>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(asset.id, 'approved')}
              className="h-6 w-6 p-0 hover:bg-green-400/20"
            >
              <CheckCircle className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(asset.id, 'review')}
              className="h-6 w-6 p-0 hover:bg-yellow-400/20"
            >
              <Clock className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(asset.id, 'rejected')}
              className="h-6 w-6 p-0 hover:bg-red-400/20"
            >
              <XCircle className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useStore, addTemplates } from '@/store/useStore';
import { setPreviewVideo } from '@/store/useStore';
import generateVideoPrompt from '@/lib/AIPromptGenerator';
import { GeneratedImage } from '@/lib/mockData';
import { filterAssets } from '@/lib/filterAssets';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';

type CanvasAsset = {
  id: string; // unique instance id
  templateId: string; // reference to GeneratedImage.id
  x: number;
  y: number;
};

const CANVAS_STORAGE_KEY = 'campaign_canvas_state_v1';

const CampaignCanvas: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchTemplates = useStore((s: any) => s.fetchTemplates);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generatedAssets = useStore((s: any) => s.generatedAssets || []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setSelectedImage = useStore((s: any) => s.setSelectedImage);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'generated' | 'uploaded'>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Canvas state: instances placed on canvas with positions
  const [canvasAssets, setCanvasAssets] = useState<CanvasAsset[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const lastPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filtered = useMemo(() => filterAssets(generatedAssets || [], query, typeFilter), [generatedAssets, query, typeFilter]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newTemplate: GeneratedImage = {
        id: `uploaded_${Date.now()}`,
        url: base64String,
        type: 'uploaded',
        alt: file.name,
        prompt: `uploaded:${file.name}`,
        timestamp: new Date()
      };
      addTemplates([newTemplate]);
      // clear the input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  }

  // Persist and restore canvasAssets
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CANVAS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CanvasAsset[];
        setCanvasAssets(parsed || []);
      }
    } catch (e) {
      // noop
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(canvasAssets));
    } catch (e) {
      // noop
    }
  }, [canvasAssets]);

  // dnd handlers
  function DraggableThumb({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
      cursor: 'grab',
      opacity: isDragging ? 0.6 : 1,
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
    } as React.CSSProperties;
    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        {children}
      </div>
    );
  }

  function DroppableCanvas({ children }: { children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({ id: 'canvas-droppable' });
    return (
      <div ref={(el) => { setNodeRef(el); canvasRef.current = el; }} style={{ width: '100%', height: '100%' }} data-droppable-is-over={isOver}>
        {children}
      </div>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(String(active.id));
    // attach pointermove to capture client coords while dragging
    const onPointerMove = (ev: PointerEvent) => {
      lastPointer.current = { x: ev.clientX, y: ev.clientY };
    };
    window.addEventListener('pointermove', onPointerMove);
  // store listener so we can remove it on end
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__cv_onPointerMove = onPointerMove;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    // remove pointer listener
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const up = (window as any).__cv_onPointerMove;
    if (up) {
      window.removeEventListener('pointermove', up);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__cv_onPointerMove;
    }
    setActiveId(null);

    if (!over) return;
    if (String(over.id) !== 'canvas-droppable') return;
    const templateId = String(active.id);
    // compute position relative to canvasRef using lastPointer
    try {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) {
        // fallback
        const newInstance: CanvasAsset = { id: `instance_${Date.now()}`, templateId, x: 50, y: 50 };
        setCanvasAssets(prev => [...prev, newInstance]);
        return;
      }
      const pointer = lastPointer.current || { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      // place center of image at pointer
      const imgW = 120;
      const imgH = 90;
      const x = Math.round(pointer.x - rect.left - imgW / 2);
      const y = Math.round(pointer.y - rect.top - imgH / 2);
      const newInstance: CanvasAsset = { id: `instance_${Date.now()}`, templateId, x, y };
      setCanvasAssets(prev => [...prev, newInstance]);
    } catch (e) {
      const newInstance: CanvasAsset = { id: `instance_${Date.now()}`, templateId, x: 50, y: 50 };
      setCanvasAssets(prev => [...prev, newInstance]);
    }
  }

  // When clicking an image instance on the canvas, open the AI actions panel
  function handleCanvasImageClick(instId: string) {
    setSelectedInstanceId(instId);
    const inst = canvasAssets.find(c => c.id === instId);
    if (inst) {
  const tmpl = (generatedAssets || []).find((g: GeneratedImage) => g.id === inst.templateId);
      if (tmpl) {
        // set selected image in global store (for existing modals)
        setSelectedImage(tmpl);
      }
    }
  }

  // Simulate image-to-video locally using canvas + MediaRecorder.
  // Returns a Blob (video) so the frontend can upload it to a persistence endpoint.
  async function simulateImageToVideo(dataUrl: string, duration = 4000): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const width = 1280;
        const height = 720;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = dataUrl;

        img.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const stream = (canvas as any).captureStream(30);
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
          const chunks: BlobPart[] = [];
          recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            resolve(blob);
          };

          const fps = 30;
          const totalFrames = Math.floor((duration / 1000) * fps);

          let frame = 0;
          function drawFrame() {
            const t = frame / Math.max(1, totalFrames - 1);
            // zoom from 1.05 -> 1.0
            const zoom = 1.05 - 0.05 * t;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);
            const iw = img.width;
            const ih = img.height;
            // compute draw size while preserving aspect
            const arImg = iw / ih;
            const arCanvas = width / height;
            let drawW = width;
            let drawH = height;
            if (arImg > arCanvas) {
              drawH = height;
              drawW = drawH * arImg;
            } else {
              drawW = width;
              drawH = drawW / arImg;
            }
            drawW *= zoom;
            drawH *= zoom;
            const dx = (width - drawW) / 2;
            const dy = (height - drawH) / 2;
            ctx.drawImage(img, dx, dy, drawW, drawH);

            // subtle vignette
            const grad = ctx.createRadialGradient(width/2, height/2, Math.min(width,height)/8, width/2, height/2, Math.max(width,height)/1.1);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.25)');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,width,height);

            frame++;
            if (frame <= totalFrames) {
              // schedule next frame
              setTimeout(() => requestAnimationFrame(drawFrame), 1000 / fps);
            } else {
              // stop after slight delay to ensure last frame captured
              setTimeout(() => recorder.stop(), 150);
            }
          }

          recorder.start(100);
          drawFrame();
        };
        img.onerror = (err) => reject(err);
      } catch (e) {
        reject(e);
      }
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full" data-testid="campaign-canvas">
        <aside className="w-80 border-r p-4" aria-label="Sidebar">
        <h3 className="font-semibold mb-2">Assets</h3>
        <div className="mb-2 text-sm">Assets: <span>{generatedAssets.length}</span></div>

        <div className="mb-2">
          <input
            id="upload-asset-input"
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="upload-asset-input" className="inline-block px-3 py-1 bg-slate-100 rounded cursor-pointer">Subir asset</label>
        </div>

        <div className="mb-2">
          <input placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} className="w-full p-1 border rounded" />
        </div>

        <div className="mb-3 text-sm">
          <label className="mr-2"><input type="radio" name="typeFilter" checked={typeFilter === 'all'} onChange={() => setTypeFilter('all')} /> Todos</label>
          <label className="mx-2"><input type="radio" name="typeFilter" checked={typeFilter === 'generated'} onChange={() => setTypeFilter('generated')} /> Generados</label>
          <label className="mx-2"><input type="radio" name="typeFilter" checked={typeFilter === 'uploaded'} onChange={() => setTypeFilter('uploaded')} /> Subidos</label>
        </div>

        <div className="overflow-auto max-h-[60vh]">
          {filtered.length === 0 && <div className="text-sm text-slate-500">No hay assets.</div>}
          <ul>
              {filtered.map(a => (
              <li key={a.id} className="mb-2">
                <DraggableThumb id={a.id}>
                  <button type="button" onClick={() => setSelectedImage(a)} className="flex items-center gap-2 w-full text-left">
                    <img src={a.url} alt={a.alt || a.id} style={{ width: 64, height: 48, objectFit: 'cover' }} />
                    <div className="text-xs">
                      <div>{a.alt || a.id}</div>
                      <div className="text-slate-400">{a.prompt?.slice(0, 60)}</div>
                    </div>
                  </button>
                </DraggableThumb>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex-1 p-4 relative">
        <div id="canvas-drop-area" className="w-full h-full border-2 border-dashed flex items-center justify-center">
          <DroppableCanvas>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {canvasAssets.length === 0 && <div className="text-slate-500">Canvas vacío. Arrastra assets aquí.</div>}
              {canvasAssets.map(inst => {
                const tmpl = (generatedAssets || []).find((g: GeneratedImage) => g.id === inst.templateId);
                if (!tmpl) return null;
                return (
                  <img key={inst.id} src={tmpl.url} alt={tmpl.alt || tmpl.id} style={{ position: 'absolute', left: inst.x, top: inst.y, width: 120, height: 90, objectFit: 'cover', cursor: 'pointer' }} onClick={() => handleCanvasImageClick(inst.id)} />
                );
              })}
            </div>
          </DroppableCanvas>
        </div>
      </main>
      {/* Drag overlay to show ghost while dragging */}
      <DragOverlay>
        {activeId ? (() => {
    const tmpl = (generatedAssets || []).find((g: GeneratedImage) => g.id === activeId);
          if (!tmpl) return null;
          return <img src={tmpl.url} alt={tmpl.alt || tmpl.id} style={{ width: 120, height: 90, objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', borderRadius: 4 }} />;
        })() : null}
      </DragOverlay>
      {/* AI Actions panel (Co-Creation) */}
      {selectedInstanceId && (() => {
        const inst = canvasAssets.find(c => c.id === selectedInstanceId);
        if (!inst) return null;
  const tmpl = (generatedAssets || []).find((g: GeneratedImage) => g.id === inst.templateId);
        if (!tmpl) return null;
  const prompt = generateVideoPrompt(tmpl as GeneratedImage);
        return (
          <aside style={{ position: 'fixed', right: 12, top: 80, width: 380, maxHeight: '70vh', background: '#fff', border: '1px solid #e6e6e6', padding: 12, borderRadius: 8, overflow: 'auto', zIndex: 60 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <img src={tmpl.url} alt={tmpl.alt || tmpl.id} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Acciones de IA</h4>
                <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#666' }}>{tmpl.alt || tmpl.id}</p>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Sugerencia del Director de IA:</label>
              <textarea readOnly rows={8} value={prompt} style={{ width: '100%', resize: 'vertical', padding: 8, fontSize: 12 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedInstanceId(null)} style={{ padding: '8px 12px', background: '#f3f4f6', border: 'none', borderRadius: 6 }}>Cerrar</button>
              <button onClick={async () => {
                try {
                  toast('Iniciando simulación...');
                  const videoBlob = await simulateImageToVideo(tmpl.url);
                  // upload to persistence endpoint
                  const fd = new FormData();
                  fd.append('file', videoBlob, `campaign_video_${Date.now()}.webm`);
                  const res = await fetch('/api/save-video', { method: 'POST', body: fd });
                  if (!res.ok) throw new Error('Upload failed');
                  const json = await res.json();
                  const videoUrl = json && (json.url || json.path);
                  if (!videoUrl) throw new Error('No url returned');
                  // save to store - attach persistent url to the template id
                  setPreviewVideo(tmpl.id, videoUrl);
                  toast.success('¡Tu video de campaña ha sido generado con éxito!');
                  setSelectedInstanceId(null);
                } catch (e) {
                  console.error(e);
                  toast.error('Error al generar el video.');
                }
              }} style={{ padding: '8px 12px', background: '#0ea5a4', color: '#fff', border: 'none', borderRadius: 6 }}>✅ Aprobar y Generar Video</button>
            </div>
          </aside>
        );
      })()}
    </div>
    </DndContext>
  );
};

export { CampaignCanvas };
export default CampaignCanvas;
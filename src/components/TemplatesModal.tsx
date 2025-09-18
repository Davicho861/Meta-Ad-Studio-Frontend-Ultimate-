import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { getTemplates, removeTemplate, importData } from '@/lib/mockData.ts';
import cognitiveCore from '@/lib/cognitive-core';
import { useStore } from '@/store/useStore';
import ConfirmDialog from './ConfirmDialog';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

export const TemplatesModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [refreshToggle, setRefreshToggle] = React.useState(0);
  const templates = getTemplates();
  const { setSelectedImage, fetchTemplates } = useStore();
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="presentation">
      <div className="bg-card p-4 rounded-lg w-full max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="templates-modal-title">
        <div className="flex justify-between items-center mb-4">
          <h3 id="templates-modal-title" className="text-lg font-bold">Plantillas</h3>
          <Button variant="ghost" onClick={onClose}><X className="w-4 h-4"/></Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Importar Plan de Campaña
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="application/json"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const txt = await file.text();
                const res = importData(txt);
                if (res.success) {
                  toast.success(res.message);
                  onClose();
                  // Record save in cognitive core (simulated learning)
                  try { if (res.count && res.count > 0) cognitiveCore.recordTemplateAction('save', `Imported ${res.count} templates`); } catch { /* noop */ }
                  // Update store and local UI without reloading
                  try { fetchTemplates(); } catch { /* noop */ }
                  setRefreshToggle((v) => v + 1);
                } else {
                  toast.error(res.message);
                }
                } catch (err) {
                  // Import error occurred
                  toast.error('Error al importar el plan');
                } finally {
                  e.currentTarget.value = '';
                }
            }}
          />

        </div>

        <div className="grid grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="border border-border/30 rounded p-2 flex gap-2 items-start">
              <img src={t.url} alt={t.prompt} className="w-24 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="text-sm line-clamp-2">{t.prompt}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => { setSelectedImage(t); onClose(); }}>Preview</Button>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmingId(t.id)}>Eliminar</Button>
                </div>

                <ConfirmDialog
                  open={confirmingId === t.id}
                  title="Eliminar plantilla"
                  description="¿Estás seguro de que quieres eliminar esta plantilla? Esta acción no se puede deshacer."
                  onConfirm={() => { removeTemplate(t.id); try { cognitiveCore.recordTemplateAction('delete', t.prompt); } catch (err) { /* noop */ } setConfirmingId(null); }}
                  onCancel={() => setConfirmingId(null)}
                  confirmLabel="Confirmar"
                  cancelLabel="Cancelar"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;

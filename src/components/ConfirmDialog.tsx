import React from 'react';
import { Button } from '@/components/ui/button';

export const ConfirmDialog = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}: {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
      <div className="bg-card p-4 rounded-lg w-full max-w-md">
        {title && <h3 className="text-lg font-bold">{title}</h3>}
        {description && <p className="text-sm mt-2">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

// Mock before importing the component. Use the same path the component imports.
vi.mock('@/lib/mockData.ts', () => ({
  getTemplates: () => [
    { id: 't-1', url: '/mock/1.png', prompt: 'Prueba' },
  ],
  removeTemplate: vi.fn(),
}));

import TemplatesModal from '../TemplatesModal';

describe('TemplatesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra confirmación antes de eliminar y llama a removeTemplate al confirmar', async () => {
    const onClose = vi.fn();
    render(<TemplatesModal open={true} onClose={onClose} />);

    // Eliminar button should be visible
    const eliminar = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(eliminar);

    // After click, Confirmar button should appear
    const confirmar = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmar).toBeInTheDocument();

    // Click confirmar
    fireEvent.click(confirmar);

    // removeTemplate mock should have been called
  const { removeTemplate } = await import('@/lib/mockData.ts');
    expect(removeTemplate).toHaveBeenCalledWith('t-1');
  });

  it('no elimina si se pulsa cancelar y vuelve al estado inicial', async () => {
    const onClose = vi.fn();
    render(<TemplatesModal open={true} onClose={onClose} />);

    const eliminar = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(eliminar);

    // Cancelar button should appear
    const cancelar = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelar).toBeInTheDocument();

    fireEvent.click(cancelar);

  const { removeTemplate } = await import('@/lib/mockData.ts');
    expect(removeTemplate).not.toHaveBeenCalled();

    // The Eliminar button should be visible again
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });
});

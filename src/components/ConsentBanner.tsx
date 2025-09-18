import React, { useEffect, useState } from 'react';
import { getConsent, setConsent } from '@/lib/consent';

const ConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = getConsent();
    if (!c) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white border p-4 rounded shadow-lg z-50 max-w-md">
      <div className="text-sm">Para mejorar Meta Ad Studio, ¿nos permites recolectar datos de uso anónimos para potenciar los insights de la IA de tu agencia?</div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => { setConsent(true); setVisible(false); }} className="px-3 py-1 bg-blue-600 text-white rounded">Aceptar</button>
        <button onClick={() => { setConsent(false); setVisible(false); }} className="px-3 py-1 border rounded">Rechazar</button>
      </div>
    </div>
  );
};

export default ConsentBanner;

import React from 'react';
import cognitiveCore from '@/lib/cognitive-core';
import { Badge } from '@/components/ui/badge';

const StrategicOracle: React.FC = () => {
  const insights = cognitiveCore.getAgencyInsights();

  return (
    <div className="p-4 bg-card/60 rounded border border-border/20">
      <h4 className="text-sm font-semibold mb-2">Insights de tu Agencia</h4>
      <div className="text-xxs text-muted-foreground">
        <div>Plantillas guardadas: <span className="font-medium">{insights.savedCount}</span></div>
        <div className="mt-2">Patrones detectados:</div>
        <ul className="list-disc list-inside mt-1">
          {insights.patterns.map((p, i) => (
            <li key={i} className="mb-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{p.uplift}</Badge>
                <div>
                  <div className="font-medium text-sm">{p.pattern}</div>
                  <div className="text-xxs text-muted-foreground">Ejemplos: {p.examples.join(', ') || '—'}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StrategicOracle;

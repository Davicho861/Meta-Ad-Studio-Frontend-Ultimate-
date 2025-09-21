import React, { useEffect, useState } from 'react';
import { checkCampaignAssetsReport, AssetReport } from '@/utils/checkAssets';
import cognitiveCore from '@/lib/cognitive-core';

const AssetCheckerBanner: React.FC = () => {
  const [report, setReport] = useState<AssetReport | null>(null);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let mounted = true;
    (async () => {
      try {
        const r = await checkCampaignAssetsReport();
        if (mounted && r) setReport(r);
        } catch (e) {
        /* noop (debug removed) */
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!import.meta.env.DEV || !report) return null;

  const missingCount = report.missing.length;
  // Simulated content analysis using cognitive core
  const contentSuggestions: string[] = [];
  try {
    (report.ok || []).forEach((ok) => {
      const name = ok.url || ok.field || '';
      if (/preview|aura_preview/i.test(name)) {
        contentSuggestions.push('Se ha detectado que aura_preview.mp4 tiene un bitrate alto. Recomiendo comprimirlo para mejorar el tiempo de carga en un 40%.');
      }
      if (/highres|4k/i.test(name)) {
        contentSuggestions.push('Activos de alta resolución detectados. Considera versiones comprimidas para web (p.ej. 720p).');
      }
    });
    // If no obvious suggestions, ask cognitive core to analyze state
    if (contentSuggestions.length === 0) {
  const insights = cognitiveCore.analyzeState({ assets: (report.ok || []).map((o) => ({ id: o.field || 'asset', name: o.url })) });
      insights.slice(0,2).forEach(i => contentSuggestions.push(`${i.title}: ${i.description}`));
    }
  } catch (e) {
    // swallow analysis errors in banner
  }
  return (
    <div className="fixed left-4 bottom-4 z-50 bg-card/80 backdrop-blur-sm border border-border p-3 rounded-md text-xs shadow">
      <div className="font-semibold">Asset Checker</div>
      <div className="mt-1">OK: {report.ok.length} • Missing: {missingCount}</div>
      {missingCount > 0 && (
        <div className="mt-2 max-h-40 overflow-auto text-xxs">
          {report.missing.map((m, i) => (
            <div key={i} className="mb-1 text-rose-400">{m.entry.field}: {m.entry.url} {m.status ? `(${m.status})` : ''}</div>
          ))}
        </div>
      )}
      {contentSuggestions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/20 text-xxs">
          <div className="font-semibold">Sugerencias de IA</div>
          <ul className="list-disc list-inside mt-1 text-muted-foreground">
            {contentSuggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssetCheckerBanner;

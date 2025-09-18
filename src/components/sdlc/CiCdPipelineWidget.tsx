import React, { useEffect, useState, useCallback } from 'react';

type Stage = { name: string; status: string; duration: number };

const CiCdPipelineWidget: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [overall, setOverall] = useState<string>('Unknown');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/mock-api/sdlc/ci-status.json');
      const data = await r.json();
      setStages(data.pipeline || []);
      setOverall(data.overall || 'Unknown');
    } catch (e) {
      setError('Failed to load CI/CD pipeline');
      setStages([]);
      setOverall('Unknown');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-4 bg-card/40 border border-border/20 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">CI/CD Pipeline</h2>
      {loading && <div>Loading...</div>}

      {error && (
        <div>
          <div className="text-sm text-destructive mb-2">{error}</div>
          <button onClick={load} className="btn btn-sm">Reintentar</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-2">Overall: <strong>{overall}</strong></div>
      <ul className="space-y-2">
        {stages.map((s) => (
          <li key={s.name} className="flex items-center justify-between">
            <span>{s.name}</span>
            <span className={`text-sm ${s.status === 'Passed' ? 'text-green-400' : s.status === 'Failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {s.status === 'Passed' ? '\u2705 Passed' : s.status === 'Failed' ? '\u274c Failed' : '\u23f3 ' + s.status}
            </span>
          </li>
        ))}
      </ul>
        </>
      )}
    </div>
  );
};

export default CiCdPipelineWidget;

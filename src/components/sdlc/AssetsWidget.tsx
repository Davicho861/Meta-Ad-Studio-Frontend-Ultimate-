import React, { useEffect, useState, useCallback } from 'react';

type Release = { version: string; zip: string; notes: string };

const AssetsWidget: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/mock-api/sdlc/release-assets.json');
      const d = await r.json();
      setReleases(d.releases || []);
    } catch (e) {
      setError('Failed to load release assets');
      setReleases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-4 bg-card/40 border border-border/20 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Release Assets</h2>

      {loading && <div>Loading...</div>}

      {error && (
        <div>
          <div className="text-sm text-destructive mb-2">{error}</div>
          <button onClick={load} className="btn btn-sm">Reintentar</button>
        </div>
      )}

      {!loading && !error && (
        <ul className="space-y-2">
          {releases.map((r) => (
            <li key={r.version} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{r.version}</div>
                <div className="text-sm text-muted-foreground">{r.notes}</div>
              </div>
              <a href={r.zip} className="text-primary underline">Download</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssetsWidget;

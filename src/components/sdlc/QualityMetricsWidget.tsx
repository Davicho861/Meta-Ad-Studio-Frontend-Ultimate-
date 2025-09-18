import React, { useEffect, useState, useCallback } from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

type Metrics = { coverage: number; accessibility: number; performance: number };

const QualityMetricsWidget: React.FC<{ testSize?: { width: number; height: number } }> = ({ testSize }) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/mock-api/sdlc/quality-metrics.json')
      .then((r) => r.json())
      .then((data) => setMetrics(data))
      .catch(() => setError('Unable to load metrics'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="p-4 bg-card/40 border border-border/20 rounded-lg">Loading...</div>;
  if (error)
    return (
      <div className="p-4 bg-card/40 border border-border/20 rounded-lg">
        <div className="text-sm text-destructive font-medium">{error}</div>
        <button className="mt-2 px-3 py-1 bg-primary text-white rounded" onClick={load}>
          Retry
        </button>
      </div>
    );

  const data = [
    { name: 'Coverage', value: Math.round(metrics!.coverage) },
    { name: 'Accessibility', value: Math.round(metrics!.accessibility) },
    { name: 'Performance', value: Math.round(metrics!.performance) },
  ];

  const height = testSize?.height ?? 160;

  return (
    <div className="p-4 bg-card/40 border border-border/20 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Quality Metrics</h2>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RadialBarChart data={data} startAngle={0} endAngle={360} innerRadius={10} outerRadius={80}>
            <RadialBar dataKey="value" background={{ fill: '#111' }} />
            <Legend />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-2">
        <div>Coverage: <strong>{metrics!.coverage}%</strong></div>
        <div>Accessibility: <strong>{metrics!.accessibility}%</strong></div>
        <div>Performance: <strong>{metrics!.performance}%</strong></div>
      </div>
    </div>
  );
};

export default QualityMetricsWidget;

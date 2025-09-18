import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const SdlcProgressWidget: React.FC<{ testSize?: { width: number; height: number } }> = ({ testSize }) => {
  const data = [
    { name: 'Design', percent: 100 },
    { name: 'Implementation', percent: 100 },
    { name: 'Testing', percent: 100 },
    { name: 'Hardening', percent: 100 },
    { name: 'Release', percent: 80 },
  ];

  return (
    <div className="p-4 bg-card/40 border border-border/20 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">SDLC Progress</h2>
  <div style={{ width: '100%', height: testSize?.height ?? 120 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={100} />
            <Bar dataKey="percent" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SdlcProgressWidget;

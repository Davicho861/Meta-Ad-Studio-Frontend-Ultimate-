import React from 'react';
import CiCdPipelineWidget from '@/components/sdlc/CiCdPipelineWidget';
import QualityMetricsWidget from '@/components/sdlc/QualityMetricsWidget';
import SdlcProgressWidget from '@/components/sdlc/SdlcProgressWidget';
import AssetsWidget from '@/components/sdlc/AssetsWidget';
import ObservabilityWidget from '@/components/sdlc/ObservabilityWidget';

const StatusPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Meta Ad Studio Mission Control</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 grid grid-rows-2 gap-4">
          <CiCdPipelineWidget />
          <QualityMetricsWidget />
        </div>

        <div className="col-span-1 grid grid-rows-3 gap-4">
          <SdlcProgressWidget />
          <AssetsWidget />
          <ObservabilityWidget />
        </div>
      </div>
    </div>
  );
};

export default StatusPage;

import React from 'react';

const ObservabilityWidget: React.FC = () => {
  return (
    <div className="p-4 bg-card/40 border border-border/20 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Observability</h2>
      <div className="text-sm text-muted-foreground">Status: <strong>No Connected</strong></div>
      <p className="text-xs mt-2 text-muted-foreground">No external telemetry configured. Connect Sentry/Datadog to enable live errors and traces.</p>
    </div>
  );
};

export default ObservabilityWidget;

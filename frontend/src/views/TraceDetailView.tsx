// TraceDetailView - View single trace with annotation
import React from 'react';
import { useParams } from 'react-router-dom';
import TraceViewer from '../components/TraceViewer';

export const TraceDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Trace ID not found</p>
      </div>
    );
  }

  return (
    <div className="trace-detail-view">
      <TraceViewer traceId={id} />
    </div>
  );
};

export default TraceDetailView;

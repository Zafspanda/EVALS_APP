// TracesView - List all traces
import React from 'react';
import TraceList from '../components/TraceList';

export const TracesView: React.FC = () => {
  return (
    <div className="traces-view">
      <TraceList />
    </div>
  );
};

export default TracesView;

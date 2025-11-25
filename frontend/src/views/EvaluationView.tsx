import React from 'react';
import { useParams } from 'react-router-dom';

const EvaluationView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="evaluation-view">
      <h2>Trace Evaluation - ID: {id}</h2>
      <div style={{ padding: '12px', background: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
        Trace evaluation functionality will be implemented in Phase 2 of the migration.
      </div>
    </div>
  );
};

export default EvaluationView;

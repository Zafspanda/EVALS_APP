import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/lib/sds';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome to the Evals App with Sendle Design System</p>

      <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
        <Button variant="primary" onClick={() => navigate('/import')}>
          Import CSV
        </Button>
        <Button variant="secondary" onClick={() => navigate('/traces/1')}>
          View Sample Trace
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;

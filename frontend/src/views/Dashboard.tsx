// Dashboard View - Home page with user stats
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@sendle/sds-ui';
import { useUserStats } from '../hooks/useAnnotations';
import './Dashboard.scss';

export const Dashboard: React.FC = () => {
  const { stats, loading, error } = useUserStats();

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <header className="dashboard__header">
          <h1>Evaluation Dashboard</h1>
          <p className="dashboard__subtitle">
            Review and annotate the Sendle support chatbot conversation traces
          </p>
        </header>

        {loading && (
          <div className="dashboard__loading">
            <div className="dashboard__spinner"></div>
            <p>Loading stats...</p>
          </div>
        )}

        {error && (
          <div className="dashboard__error">
            <p>Failed to load stats</p>
          </div>
        )}

        {stats && (
          <div className="dashboard__stats">
            <div className="dashboard__stat-card">
              <h3>Total Annotations</h3>
              <p className="dashboard__stat-value">{stats.total_annotations}</p>
            </div>
            <div className="dashboard__stat-card dashboard__stat-card--pass">
              <h3>✓ Pass</h3>
              <p className="dashboard__stat-value">{stats.pass_count}</p>
            </div>
            <div className="dashboard__stat-card dashboard__stat-card--fail">
              <h3>✗ Fail</h3>
              <p className="dashboard__stat-value">{stats.fail_count}</p>
            </div>
          </div>
        )}

        <div className="dashboard__actions">
          <Link to="/traces">
            <Button variant="primary" size="medium">
              View All Traces
            </Button>
          </Link>
          <Link to="/import">
            <Button variant="secondary" size="medium">
              Import CSV
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

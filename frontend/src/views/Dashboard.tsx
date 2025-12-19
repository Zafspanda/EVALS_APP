// Dashboard View - Home page with user stats
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge, Status } from '../sds';
import { useUserStats } from '../hooks/useAnnotations';
import { apiService } from '../services/api';
import type { Annotation } from '../types/api';
import './Dashboard.scss';

export const Dashboard: React.FC = () => {
  const { stats, loading, error } = useUserStats();
  const navigate = useNavigate();
  const [totalTraces, setTotalTraces] = useState<number>(0);
  const [loadingTraces, setLoadingTraces] = useState(true);

  // Fetch total traces count
  useEffect(() => {
    const fetchTraces = async () => {
      try {
        const response = await apiService.getTraces(1, 1); // Get first page to get total
        setTotalTraces(response.total);
      } catch (err) {
        console.error('Failed to fetch traces count:', err);
      } finally {
        setLoadingTraces(false);
      }
    };
    fetchTraces();
  }, []);

  // Handle Start Coding button
  const handleStartCoding = async () => {
    try {
      const trace = await apiService.getNextUnannotatedTrace();
      navigate(`/trace/${trace.trace_id}`);
    } catch (err) {
      console.error('No unannotated traces found:', err);
      alert('No unannotated traces available');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <div className="dashboard__header-card">
          <h1>Evaluation Dashboard</h1>
          <p className="dashboard__subtitle">
            Review and annotate the Sendle support chatbot conversation traces
          </p>
        </div>

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
          <>
            <div className="dashboard__stats">
              <div className="dashboard__stat-card dashboard__stat-card--neutral">
                <h3>Total Traces</h3>
                <p className="dashboard__stat-value">{loadingTraces ? '...' : totalTraces}</p>
              </div>
              <div className="dashboard__stat-card dashboard__stat-card--neutral">
                <h3>Your Annotations</h3>
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

            {/* Quick Actions */}
            <div className="dashboard__section">
              <h2 className="dashboard__section-title">Quick Actions</h2>
              <div className="dashboard__section-card">
                <div className="dashboard__quick-actions">
                  <Button variant="primary" size="medium" onClick={handleStartCoding}>
                    Start Coding
                  </Button>
                  <Link to="/import">
                    <Button variant="secondary" size="medium">
                      Import CSV
                    </Button>
                  </Link>
                  <Link to="/traces">
                    <Button variant="secondary" size="medium">
                      View All Traces
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Annotations */}
            <div className="dashboard__section">
              <h2 className="dashboard__section-title">Recent Annotations</h2>
              {stats.recent_annotations && stats.recent_annotations.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover dashboard__annotations-table">
                    <thead>
                      <tr>
                        <th>STATUS</th>
                        <th>TRACE ID</th>
                        <th>DATE</th>
                        <th className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_annotations.map((annotation) => (
                        <tr
                          key={annotation.trace_id}
                          className={annotation.holistic_pass_fail === 'Pass' ? 'success' : 'danger'}
                        >
                          <td className="text-center">
                            <span className={`dashboard__status-icon dashboard__status-icon--${annotation.holistic_pass_fail.toLowerCase()}`}>
                              {annotation.holistic_pass_fail === 'Pass' ? '✓' : '✗'}
                            </span>
                          </td>
                          <td>
                            <span className="dashboard__trace-id">{annotation.trace_id}</span>
                          </td>
                          <td>
                            {new Date(annotation.updated_at).toLocaleDateString()} {new Date(annotation.updated_at).toLocaleTimeString()}
                          </td>
                          <td className="text-center">
                            <Link to={`/trace/${annotation.trace_id}`}>
                              <Button variant="secondary" size="small">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="dashboard__empty-message">No annotations yet. Start coding to create your first annotation!</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

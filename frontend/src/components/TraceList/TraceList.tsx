// TraceList Component - Paginated list of traces
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from '@sendle/sds-ui';
import { useTraces } from '../../hooks/useTraces';
import { apiService } from '../../services/api';
import type { Trace, Annotation } from '../../types/api';
import './TraceList.scss';

export const TraceList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [annotations, setAnnotations] = useState<Map<string, Annotation>>(new Map());

  const { traces, total, loading, error, refresh } = useTraces(page, pageSize);

  // Fetch annotations for current page traces
  useEffect(() => {
    if (traces && traces.length > 0) {
      fetchAnnotationsForTraces(traces);
    }
  }, [traces]);

  const fetchAnnotationsForTraces = async (traceList: Trace[]) => {
    try {
      const annotationPromises = traceList.map((trace) =>
        apiService.getAnnotationForTrace(trace.trace_id).catch(() => null)
      );
      const annotationResults = await Promise.all(annotationPromises);

      const newAnnotations = new Map<string, Annotation>();
      annotationResults.forEach((annotation, index) => {
        if (annotation) {
          newAnnotations.set(traceList[index].trace_id, annotation);
        }
      });

      setAnnotations(newAnnotations);
    } catch (err) {
      console.error('Error fetching annotations:', err);
    }
  };

  const getStatusIndicator = (traceId: string) => {
    const annotation = annotations.get(traceId);
    if (!annotation) {
      return <span className="trace-list__status-icon trace-list__status-icon--unannotated" aria-label="Unannotated">○</span>;
    }
    if (annotation.holistic_pass_fail === 'Pass') {
      return <span className="trace-list__status-icon trace-list__status-icon--pass" aria-label="Pass">✓</span>;
    }
    if (annotation.holistic_pass_fail === 'Fail') {
      return <span className="trace-list__status-icon trace-list__status-icon--fail" aria-label="Fail">✗</span>;
    }
    return <span className="trace-list__status-icon" aria-label="Unknown">?</span>;
  };

  const getRowClassName = (traceId: string) => {
    const annotation = annotations.get(traceId);
    if (!annotation) return 'trace-list__row';
    if (annotation.holistic_pass_fail === 'Pass') {
      return 'trace-list__row trace-list__row--pass';
    }
    if (annotation.holistic_pass_fail === 'Fail') {
      return 'trace-list__row trace-list__row--fail';
    }
    return 'trace-list__row';
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleViewTrace = (traceId: string) => {
    navigate(`/trace/${traceId}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1); // Reset to first page
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && traces.length === 0) {
    return (
      <div className="trace-list">
        <div className="trace-list__loading">
          <div className="trace-list__spinner"></div>
          <p>Loading traces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trace-list">
        <div className="trace-list__error">
          <p>⚠️ Failed to load traces</p>
          <p className="trace-list__error-message">{error.message}</p>
          <Button variant="primary" onClick={() => refresh()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="trace-list">
      <div className="trace-list__header">
        <h2 className="trace-list__title">Traces</h2>
        <div className="trace-list__controls">
          <label htmlFor="page-size">
            Rows per page:
            <select
              id="page-size"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="trace-list__page-size-select"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>

      <div className="trace-list__table-container">
        <table className="trace-list__table">
          <thead>
            <tr>
              <th className="trace-list__th--status">STATUS</th>
              <th className="trace-list__th--trace-id">TRACE ID</th>
              <th className="trace-list__th--session">SESSION</th>
              <th className="trace-list__th--turn">TURN</th>
              <th className="trace-list__th--user-message">USER MESSAGE</th>
              <th className="trace-list__th--ai-response">AI RESPONSE</th>
              <th className="trace-list__th--actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {traces.length === 0 ? (
              <tr>
                <td colSpan={7} className="trace-list__empty">
                  No traces found
                </td>
              </tr>
            ) : (
              traces.map((trace) => (
                <tr key={trace.trace_id} className={getRowClassName(trace.trace_id)}>
                  <td className="trace-list__cell trace-list__cell--center">
                    {getStatusIndicator(trace.trace_id)}
                  </td>
                  <td className="trace-list__cell" title={trace.trace_id}>
                    {truncateText(trace.trace_id, 24)}
                  </td>
                  <td className="trace-list__cell" title={trace.flow_session}>
                    {trace.flow_session.substring(0, 8)}...
                  </td>
                  <td className="trace-list__cell trace-list__cell--center">
                    {trace.turn_number}
                  </td>
                  <td className="trace-list__cell" title={trace.user_message}>
                    {truncateText(trace.user_message, 100)}
                  </td>
                  <td className="trace-list__cell" title={trace.ai_response}>
                    {truncateText(trace.ai_response, 100)}
                  </td>
                  <td className="trace-list__cell trace-list__cell--center">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleViewTrace(trace.trace_id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="trace-list__pagination">
          <Button
            variant="secondary"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>

          <span className="trace-list__page-info">
            Page {page} of {totalPages} ({total} total)
          </span>

          <Button
            variant="secondary"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TraceList;

// TraceViewer Component - Main trace display
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider } from '@sendle/sds-ui';
import { useTrace, useAdjacentTraces } from '../../hooks/useTraces';
import { useAnnotation } from '../../hooks/useAnnotations';
import ToolCallCard from './ToolCallCard';
import QuickActions from '../QuickActions';
import './TraceViewer.scss';

interface TraceViewerProps {
  traceId: string;
}

export const TraceViewer: React.FC<TraceViewerProps> = ({ traceId }) => {
  const navigate = useNavigate();

  // Fetch trace data, adjacent traces, and annotation
  const { trace, loading: traceLoading, error: traceError, refresh: refreshTrace } = useTrace(traceId);
  const { prev, next } = useAdjacentTraces(traceId);
  const { annotation, refresh: refreshAnnotation } = useAnnotation(traceId);

  // Debug: log adjacent traces
  console.log('TraceViewer - Adjacent traces:', { prev, next, traceId });

  const handleNavigateToPrev = () => {
    console.log('Previous button clicked, prev:', prev);
    if (prev) {
      console.log('Navigating to previous trace:', prev);
      navigate(`/trace/${prev}`);
    } else {
      console.log('No previous trace available');
    }
  };

  const handleNavigateToNext = () => {
    if (next) {
      navigate(`/trace/${next}`);
    }
  };

  const handleAnnotationSaved = () => {
    refreshAnnotation();
  };

  if (traceLoading) {
    return (
      <div className="trace-viewer">
        <div className="trace-viewer__loading">
          <div className="trace-viewer__spinner"></div>
          <p>Loading trace...</p>
        </div>
      </div>
    );
  }

  if (traceError) {
    return (
      <div className="trace-viewer">
        <div className="trace-viewer__error">
          <p>⚠️ Failed to load trace</p>
          <p className="trace-viewer__error-message">{traceError.message}</p>
          <Button variant="primary" onClick={() => refreshTrace()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="trace-viewer">
        <div className="trace-viewer__empty">
          <p>📭 Trace not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trace-viewer">
      {/* Header with navigation */}
      <div className="trace-viewer__header">
        <div className="trace-viewer__nav">
          <Button
            variant="secondary"
            size="small"
            onClick={handleNavigateToPrev}
            disabled={!prev}
          >
            ← Previous
          </Button>
          <h1 className="trace-viewer__title">Trace: {traceId}</h1>
          <Button
            variant="secondary"
            size="small"
            onClick={handleNavigateToNext}
            disabled={!next}
          >
            Next →
          </Button>
        </div>
      </div>

      <Divider />

      {/* Metadata */}
      <div className="trace-viewer__metadata">
        <div className="trace-viewer__metadata-item">
          <strong>Session:</strong>
          <span>{trace.flow_session}</span>
        </div>
        <div className="trace-viewer__metadata-item">
          <strong>Turn:</strong>
          <span>{trace.turn_number}</span>
        </div>
      </div>

      <Divider />

      {/* Conversation History - All Turns Stacked */}
      <div className="trace-viewer__conversation">
        {/* Previous turns from context */}
        {trace.context && trace.context.length > 0 && (
          <>
            {trace.context.map((turn: any) => (
              <div key={turn.turn_number} className="trace-viewer__turn trace-viewer__turn--previous">
                <div className="trace-viewer__turn-header">
                  Turn {turn.turn_number}
                </div>
                <div className="trace-viewer__message-block">
                  <h3 className="trace-viewer__message-title">👤 User Input</h3>
                  <p className="trace-viewer__message-content">{turn.user_message}</p>
                </div>
                <div className="trace-viewer__message-block">
                  <h3 className="trace-viewer__message-title">🤖 AI Response</h3>
                  <p className="trace-viewer__message-content">{turn.ai_response}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Current turn */}
        <div className="trace-viewer__turn trace-viewer__turn--current">
          <div className="trace-viewer__turn-header trace-viewer__turn-header--current">
            Turn {trace.turn_number} (Current)
          </div>
          <div className="trace-viewer__message-block">
            <h3 className="trace-viewer__message-title">👤 User Input</h3>
            <p className="trace-viewer__message-content">{trace.user_message}</p>
          </div>

          {/* Tool calls */}
          {trace.tool_calls && trace.tool_calls.length > 0 && (
            <div className="trace-viewer__tool-calls">
              <h3 className="trace-viewer__tool-calls-title">🔧 Tool Calls</h3>
              {trace.tool_calls.map((toolCall) => (
                <ToolCallCard key={toolCall.id} toolCall={toolCall} />
              ))}
            </div>
          )}

          <div className="trace-viewer__message-block">
            <h3 className="trace-viewer__message-title">🤖 AI Response</h3>
            <p className="trace-viewer__message-content">{trace.ai_response}</p>
          </div>
        </div>
      </div>

      <Divider />

      {/* Annotation section */}
      <QuickActions
        traceId={traceId}
        nextTraceId={next}
        existingAnnotation={annotation}
        onSaveSuccess={handleAnnotationSaved}
      />
    </div>
  );
};

export default TraceViewer;

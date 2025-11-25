// QuickActions Component - Main annotation actions
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert } from '@sendle/sds-ui';
import { useSaveAnnotation } from '../../hooks/useAnnotations';
import { useNextUnannotated } from '../../hooks/useTraces';
import type { Annotation } from '../../types/api';
import FailureForm from './FailureForm';
import './QuickActions.scss';

interface QuickActionsProps {
  traceId: string;
  nextTraceId?: string | null;
  existingAnnotation?: Annotation | null;
  onSaveSuccess?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  traceId,
  nextTraceId,
  existingAnnotation,
  onSaveSuccess,
}) => {
  const [showFailForm, setShowFailForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { saveAnnotation, saving } = useSaveAnnotation();
  const { fetchNext, loading: navigating } = useNextUnannotated();
  const navigate = useNavigate();

  const goToNext = async () => {
    console.log('goToNext called');
    try {
      console.log('Fetching next unannotated trace...');
      const nextTrace = await fetchNext();
      console.log('Next trace result:', nextTrace);

      if (nextTrace && nextTrace.trace_id) {
        console.log('Navigating to trace:', nextTrace.trace_id);
        navigate(`/trace/${nextTrace.trace_id}`);
      } else {
        console.log('No more unannotated traces');
        setSuccess('All traces have been annotated!');
        setTimeout(() => navigate('/traces'), 1500);
      }
    } catch (err) {
      console.error('Error getting next unannotated trace:', err);
      setError('Failed to find next unannotated trace');
    }
  };

  const handlePassAndNext = async () => {
    setError(null);
    setSuccess(null);

    try {
      const result = await saveAnnotation({
        trace_id: traceId,
        holistic_pass_fail: 'Pass',
      });

      if (result) {
        setSuccess('Trace marked as Pass');
        onSaveSuccess?.();
        await goToNext();
      } else {
        setError('Failed to save annotation');
      }
    } catch (err) {
      setError('Failed to save annotation');
      console.error('Error saving annotation:', err);
    }
  };

  const handleSkip = async () => {
    console.log('Skip button clicked, nextTraceId:', nextTraceId);
    setError(null);
    setSuccess(null);

    try {
      // Prefer using adjacent next trace (same as Next button)
      if (nextTraceId) {
        console.log('Using adjacent next trace:', nextTraceId);
        navigate(`/trace/${nextTraceId}`);
      } else {
        // Fall back to unannotated endpoint
        console.log('No adjacent trace, trying unannotated endpoint');
        await goToNext();
      }
    } catch (err) {
      console.error('Error in handleSkip:', err);
      setError('Failed to skip to next trace');
    }
  };

  const handleMarkAsFail = () => {
    setShowFailForm(!showFailForm);
    setError(null);
    setSuccess(null);
  };

  const handleFailureCancel = () => {
    setShowFailForm(false);
  };

  const handleFailureSave = async () => {
    setShowFailForm(false);
    onSaveSuccess?.();
    await goToNext();
  };

  return (
    <div className="quick-actions">
      {error && (
        <Alert variant="risk" className="quick-actions__alert">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="quick-actions__alert">
          {success}
        </Alert>
      )}

      {existingAnnotation && (
        <Alert variant="info" className="quick-actions__existing">
          <strong>Existing Annotation:</strong> You have previously annotated this
          trace as <strong>{existingAnnotation.holistic_pass_fail}</strong>.
          Using quick actions will update your annotation.
        </Alert>
      )}

      <div className="quick-actions__buttons">
        <Button
          variant="primary"
          onClick={handlePassAndNext}
          disabled={saving || navigating || showFailForm}
        >
          {saving ? 'Saving...' : '✓ Pass & Next'}
        </Button>

        <Button
          variant="secondary"
          onClick={handleSkip}
          disabled={saving || navigating || showFailForm}
        >
          {navigating ? 'Loading...' : '⏭ Skip'}
        </Button>

        <Button
          variant="risk"
          onClick={handleMarkAsFail}
          disabled={saving || navigating}
        >
          {showFailForm ? '✗ Cancel Fail' : '✗ Mark as Fail'}
        </Button>
      </div>

      {showFailForm && (
        <FailureForm
          traceId={traceId}
          existingAnnotation={existingAnnotation}
          onSave={handleFailureSave}
          onCancel={handleFailureCancel}
        />
      )}
    </div>
  );
};

export default QuickActions;

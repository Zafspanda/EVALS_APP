// FailureForm Component - Form for marking traces as failed
import React, { useState, useEffect, FormEvent } from 'react';
import { Input, TextArea, Button, Alert } from '@sendle/sds-ui';
import { useSaveAnnotation } from '../../hooks/useAnnotations';
import type { Annotation } from '../../types/api';
import './FailureForm.scss';

interface FailureFormProps {
  traceId: string;
  existingAnnotation?: Annotation | null;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  first_failure_note: string;
  open_codes: string;
  comments_hypotheses: string;
}

interface FormErrors {
  first_failure_note?: string;
  comments_hypotheses?: string;
}

export const FailureForm: React.FC<FailureFormProps> = ({
  traceId,
  existingAnnotation,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    first_failure_note: '',
    open_codes: '',
    comments_hypotheses: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { saveAnnotation, saving } = useSaveAnnotation();

  // Load existing annotation data if present and it's a failure
  useEffect(() => {
    if (existingAnnotation && existingAnnotation.holistic_pass_fail === 'Fail') {
      setFormData({
        first_failure_note: existingAnnotation.first_failure_note || '',
        open_codes: existingAnnotation.open_codes || '',
        comments_hypotheses: existingAnnotation.comments_hypotheses || '',
      });
    }
  }, [existingAnnotation]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_failure_note.trim()) {
      newErrors.first_failure_note = 'First failure note is required for failures';
    }

    if (!formData.comments_hypotheses.trim()) {
      newErrors.comments_hypotheses = 'Comments/hypothesis required for failures';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      setSubmitError('Please check the form for errors');
      return;
    }

    try {
      const result = await saveAnnotation({
        trace_id: traceId,
        holistic_pass_fail: 'Fail',
        first_failure_note: formData.first_failure_note,
        open_codes: formData.open_codes || undefined,
        comments_hypotheses: formData.comments_hypotheses,
      });

      if (result) {
        onSave();
      } else {
        setSubmitError('Failed to save annotation');
      }
    } catch (err) {
      setSubmitError('Failed to save annotation');
      console.error('Error saving failure annotation:', err);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      first_failure_note: '',
      open_codes: '',
      comments_hypotheses: '',
    });
    setErrors({});
    setSubmitError(null);
    onCancel();
  };

  return (
    <div className="failure-form">
      <Alert variant="risk" className="failure-form__header">
        <strong>✗ Failure Annotation</strong> - Please provide details below
      </Alert>

      <form onSubmit={handleSubmit}>
        {submitError && (
          <Alert variant="risk" className="failure-form__error">
            {submitError}
          </Alert>
        )}

        {/* Open Codes Field */}
        <div className="failure-form__field">
          <label htmlFor="open_codes" className="failure-form__label">
            Open Codes
          </label>
          <Input
            id="open_codes"
            value={formData.open_codes}
            onChange={(e) =>
              setFormData({ ...formData, open_codes: e.target.value })
            }
            placeholder="e.g., hallucination, constraint_violation"
            maxLength={500}
          />
          <span className="failure-form__hint">
            Comma-separated codes (optional)
          </span>
        </div>

        {/* First Failure Note Field */}
        <div className="failure-form__field">
          <label htmlFor="first_failure_note" className="failure-form__label">
            First Failure Note <span className="failure-form__required">*</span>
          </label>
          <Input
            id="first_failure_note"
            value={formData.first_failure_note}
            onChange={(e) =>
              setFormData({ ...formData, first_failure_note: e.target.value })
            }
            placeholder="Describe the first point of failure"
            maxLength={256}
            aria-required="true"
            aria-invalid={!!errors.first_failure_note}
          />
          {errors.first_failure_note && (
            <span className="failure-form__error-text">
              {errors.first_failure_note}
            </span>
          )}
        </div>

        {/* Comments/Hypotheses Field */}
        <div className="failure-form__field">
          <label
            htmlFor="comments_hypotheses"
            className="failure-form__label"
          >
            Comments / Hypothesis <span className="failure-form__required">*</span>
          </label>
          <TextArea
            id="comments_hypotheses"
            value={formData.comments_hypotheses}
            onChange={(e) =>
              setFormData({ ...formData, comments_hypotheses: e.target.value })
            }
            placeholder="Analysis and context (required for failures)"
            rows={4}
            maxLength={1000}
            aria-required="true"
            aria-invalid={!!errors.comments_hypotheses}
          />
          {errors.comments_hypotheses && (
            <span className="failure-form__error-text">
              {errors.comments_hypotheses}
            </span>
          )}
        </div>

        <div className="failure-form__actions">
          <Button
            variant="secondary"
            onClick={handleCancel}
            type="button"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button variant="risk" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save & Next'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FailureForm;

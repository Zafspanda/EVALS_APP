import { test, expect } from './support/fixtures/auth.fixture';
import { createTrace, createAnnotation } from './support/factories/trace.factory';
import { waitForApiResponse } from './support/helpers/wait-for';

test.describe('Annotation Form', () => {
  test.beforeEach(async ({ page, authenticatedUser }) => {
    // Mock trace data
    const mockTrace = createTrace({ id: 1, status: 'pending' });

    await page.route('**/api/traces/1', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(mockTrace)
      })
    );

    // Navigate to trace annotation page
    await page.goto('/traces/1');
    await page.waitForSelector('[data-testid="annotation-form"]');
  });

  test('[P0] should submit annotation with all required fields', async ({ page }) => {
    // GIVEN: User is on the annotation form
    await expect(page.locator('[data-testid="annotation-form"]')).toBeVisible();

    // WHEN: User fills in all required fields
    // Select human label
    await page.click('[data-testid="label-pass"]');

    // Set confidence level
    await page.click('[data-testid="confidence-4"]');

    // Select evaluator agreement
    await page.click('[data-testid="evaluator-agrees-yes"]');

    // Add notes
    await page.fill('[data-testid="annotation-notes"]', 'Response meets all criteria');

    // Mock successful submission
    await page.route('**/api/annotations', route =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({
          id: 'annotation_1',
          trace_id: 1,
          human_label: 'pass',
          human_confidence: 4,
          evaluator_agrees: 'yes',
          notes: 'Response meets all criteria',
          created_at: new Date().toISOString()
        })
      })
    );

    // Submit the form
    await page.click('[data-testid="submit-annotation"]');

    // THEN: Annotation is saved and user sees success message
    await expect(page.locator('[data-testid="success-toast"]')).toHaveText(
      'Annotation saved successfully'
    );

    // Should navigate to next trace
    await expect(page).toHaveURL('/traces/2');
  });

  test('[P0] should validate required fields before submission', async ({ page }) => {
    // GIVEN: User is on the annotation form
    await expect(page.locator('[data-testid="annotation-form"]')).toBeVisible();

    // WHEN: User tries to submit without filling required fields
    await page.click('[data-testid="submit-annotation"]');

    // THEN: Validation errors are displayed
    await expect(page.locator('[data-testid="error-human-label"]')).toHaveText(
      'Please select a label'
    );
    await expect(page.locator('[data-testid="error-confidence"]')).toHaveText(
      'Please select a confidence level'
    );
    await expect(page.locator('[data-testid="error-evaluator-agrees"]')).toHaveText(
      'Please indicate evaluator agreement'
    );

    // Form should not be submitted
    await expect(page).toHaveURL('/traces/1');
  });

  test('[P1] should handle failure modes selection', async ({ page }) => {
    // GIVEN: User selects 'fail' as human label
    await page.click('[data-testid="label-fail"]');

    // WHEN: Failure modes section appears
    await expect(page.locator('[data-testid="failure-modes-section"]')).toBeVisible();

    // Select multiple failure modes
    await page.click('[data-testid="failure-constraint_violation"]');
    await page.click('[data-testid="failure-hallucination"]');

    // Fill other required fields
    await page.click('[data-testid="confidence-3"]');
    await page.click('[data-testid="evaluator-agrees-no"]');

    // Mock submission with failure modes
    await page.route('**/api/annotations', route => {
      const body = JSON.parse(route.request().postData() || '{}');
      expect(body.failure_modes).toEqual(['constraint_violation', 'hallucination']);

      route.fulfill({
        status: 201,
        body: JSON.stringify({
          ...body,
          id: 'annotation_2',
          created_at: new Date().toISOString()
        })
      });
    });

    await page.click('[data-testid="submit-annotation"]');

    // THEN: Annotation with failure modes is saved
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('[P1] should mark trace as golden set', async ({ page }) => {
    // GIVEN: User has filled required fields
    await page.click('[data-testid="label-pass"]');
    await page.click('[data-testid="confidence-5"]');
    await page.click('[data-testid="evaluator-agrees-yes"]');

    // WHEN: User marks trace as golden set
    await page.check('[data-testid="is-golden-set"]');

    // Mock submission verifying golden set flag
    await page.route('**/api/annotations', route => {
      const body = JSON.parse(route.request().postData() || '{}');
      expect(body.is_golden_set).toBe(true);

      route.fulfill({
        status: 201,
        body: JSON.stringify({ ...body, id: 'annotation_3' })
      });
    });

    await page.click('[data-testid="submit-annotation"]');

    // THEN: Trace is marked as golden set
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('golden set');
  });

  test('[P1] should handle dynamic labels from rubric', async ({ page }) => {
    // GIVEN: Rubric with dynamic labels is loaded
    await page.route('**/api/rubric', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          failure_modes: ['constraint_violation', 'hallucination', 'off_topic']
        })
      })
    );

    await page.reload();
    await page.waitForSelector('[data-testid="dynamic-labels-section"]');

    // WHEN: User sets dynamic label values
    await page.click('[data-testid="dynamic-constraint_violation-true"]');
    await page.click('[data-testid="dynamic-hallucination-false"]');
    await page.click('[data-testid="dynamic-off_topic-na"]');

    // Fill required fields
    await page.click('[data-testid="label-fail"]');
    await page.click('[data-testid="confidence-2"]');
    await page.click('[data-testid="evaluator-agrees-no"]');

    // Mock submission with dynamic labels
    await page.route('**/api/annotations', route => {
      const body = JSON.parse(route.request().postData() || '{}');
      expect(body.dynamic_labels).toEqual({
        constraint_violation: true,
        hallucination: false,
        off_topic: 'n/a'
      });

      route.fulfill({
        status: 201,
        body: JSON.stringify({ ...body, id: 'annotation_4' })
      });
    });

    await page.click('[data-testid="submit-annotation"]');

    // THEN: Dynamic labels are saved with annotation
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('[P2] should save draft annotation on navigation away', async ({ page }) => {
    // GIVEN: User has partially filled the form
    await page.click('[data-testid="label-unsure"]');
    await page.click('[data-testid="confidence-2"]');
    await page.fill('[data-testid="annotation-notes"]', 'Need to review guidelines');

    // WHEN: User navigates away
    // Mock draft save
    await page.route('**/api/annotations/draft', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ draft_saved: true })
      })
    );

    await page.click('[data-testid="nav-dashboard"]');

    // THEN: Confirmation dialog appears
    await expect(page.locator('[data-testid="unsaved-changes-dialog"]')).toBeVisible();

    // Save draft and continue
    await page.click('[data-testid="save-draft-button"]');
    await waitForApiResponse(page, '/api/annotations/draft');

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('[P2] should load existing annotation for review', async ({ page }) => {
    // GIVEN: Trace already has an annotation
    const existingAnnotation = createAnnotation(1, {
      human_label: 'pass',
      human_confidence: 4,
      evaluator_agrees: 'yes',
      notes: 'Good response',
      is_golden_set: true
    });

    await page.route('**/api/annotations/trace/1', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(existingAnnotation)
      })
    );

    // WHEN: User navigates to annotated trace
    await page.goto('/traces/1');

    // THEN: Existing annotation is loaded in form
    await expect(page.locator('[data-testid="label-pass"]')).toBeChecked();
    await expect(page.locator('[data-testid="confidence-4"]')).toBeChecked();
    await expect(page.locator('[data-testid="evaluator-agrees-yes"]')).toBeChecked();
    await expect(page.locator('[data-testid="annotation-notes"]')).toHaveValue('Good response');
    await expect(page.locator('[data-testid="is-golden-set"]')).toBeChecked();

    // Should show edit mode
    await expect(page.locator('[data-testid="edit-mode-badge"]')).toBeVisible();
  });
});
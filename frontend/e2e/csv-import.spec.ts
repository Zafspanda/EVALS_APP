import { test, expect } from '@playwright/test';
import { waitForApiResponse, waitForNetworkIdle } from './support/helpers/wait-for';
import * as path from 'path';

test.describe('CSV Import Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Network-first: Mock auth before navigation
    await page.route('**/api/auth/me', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'test_user',
          email: 'evaluator@test.com',
          role: 'admin'
        })
      })
    );

    await page.goto('/');
  });

  test('[P0] should import valid traces CSV successfully', async ({ page }) => {
    // GIVEN: User is on the import page
    await page.click('[data-testid="import-csv-button"]');
    await expect(page.locator('[data-testid="csv-import-dialog"]')).toBeVisible();

    // WHEN: User uploads a valid CSV file
    const csvFile = path.join(__dirname, '../fixtures/valid-traces.csv');
    await page.setInputFiles('[data-testid="csv-file-input"]', csvFile);

    // Mock successful upload response
    await page.route('**/api/traces/upload', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          traces_imported: 100,
          validation_errors: [],
          message: 'Successfully imported 100 traces'
        })
      })
    );

    await page.click('[data-testid="upload-button"]');

    // THEN: Import succeeds and shows success message
    await expect(page.locator('[data-testid="success-message"]')).toHaveText(
      'Successfully imported 100 traces'
    );
    await expect(page.locator('[data-testid="trace-count"]')).toHaveText('100');
  });

  test('[P0] should validate CSV columns before import', async ({ page }) => {
    // GIVEN: User is on the import page
    await page.click('[data-testid="import-csv-button"]');

    // WHEN: User uploads CSV with missing required columns
    const invalidCsvFile = path.join(__dirname, '../fixtures/invalid-columns.csv');
    await page.setInputFiles('[data-testid="csv-file-input"]', invalidCsvFile);

    // THEN: Validation error is displayed before upload
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText(
      'Missing required columns: llm_prompt, llm_response'
    );
    await expect(page.locator('[data-testid="upload-button"]')).toBeDisabled();
  });

  test('[P1] should show import progress for large files', async ({ page }) => {
    // GIVEN: User is on the import page
    await page.click('[data-testid="import-csv-button"]');

    // WHEN: User uploads a large CSV file
    const largeCsvFile = path.join(__dirname, '../fixtures/large-traces.csv');
    await page.setInputFiles('[data-testid="csv-file-input"]', largeCsvFile);

    // Mock chunked upload progress
    let progress = 0;
    await page.route('**/api/traces/upload/progress', route => {
      progress += 25;
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          progress: Math.min(progress, 100),
          processed: Math.min(progress * 10, 1000),
          total: 1000
        })
      });
    });

    await page.click('[data-testid="upload-button"]');

    // THEN: Progress bar is displayed and updates
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-text"]')).toContainText('Processing');

    // Wait for completion
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
  });

  test('[P1] should handle duplicate traces appropriately', async ({ page }) => {
    // GIVEN: Database already has some traces
    await page.route('**/api/traces/count', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ count: 50 })
      })
    );

    await page.goto('/import');

    // WHEN: User uploads CSV with duplicate trace IDs
    const duplicateCsvFile = path.join(__dirname, '../fixtures/duplicate-traces.csv');
    await page.setInputFiles('[data-testid="csv-file-input"]', duplicateCsvFile);

    await page.route('**/api/traces/upload', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          traces_imported: 25,
          duplicates_skipped: 25,
          message: 'Imported 25 new traces, skipped 25 duplicates'
        })
      })
    );

    await page.click('[data-testid="upload-button"]');

    // THEN: Shows summary with duplicates handled
    await expect(page.locator('[data-testid="import-summary"]')).toContainText(
      'Imported 25 new traces'
    );
    await expect(page.locator('[data-testid="duplicate-warning"]')).toContainText(
      '25 duplicates skipped'
    );
  });

  test('[P2] should support CSV preview before import', async ({ page }) => {
    // GIVEN: User is on the import page
    await page.click('[data-testid="import-csv-button"]');

    // WHEN: User uploads a CSV file
    const csvFile = path.join(__dirname, '../fixtures/valid-traces.csv');
    await page.setInputFiles('[data-testid="csv-file-input"]', csvFile);

    // Enable preview mode
    await page.click('[data-testid="preview-toggle"]');

    // THEN: Preview table shows first 10 rows
    await expect(page.locator('[data-testid="preview-table"]')).toBeVisible();
    const rows = page.locator('[data-testid="preview-table"] tbody tr');
    await expect(rows).toHaveCount(10);

    // Verify column headers are displayed
    await expect(page.locator('[data-testid="preview-table"] th')).toContainText([
      'llm_prompt',
      'llm_response',
      'llm_model_name'
    ]);
  });
});

test.describe('Living Rubric Import', () => {
  test('[P1] should import living rubric CSV and generate dynamic labels', async ({ page }) => {
    // GIVEN: Admin user is on rubric import page
    await page.route('**/api/auth/me', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'admin_user',
          role: 'admin'
        })
      })
    );

    await page.goto('/admin/rubric');

    // WHEN: Admin uploads rubric CSV
    const rubricFile = path.join(__dirname, '../fixtures/living-rubric.csv');
    await page.setInputFiles('[data-testid="rubric-file-input"]', rubricFile);

    await page.route('**/api/rubric/import', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          failure_modes: [
            'constraint_violation',
            'hallucination',
            'off_topic',
            'poor_quality'
          ],
          version: '1.0.0'
        })
      })
    );

    await page.click('[data-testid="import-rubric-button"]');

    // THEN: Rubric is imported and dynamic labels are available
    await expect(page.locator('[data-testid="rubric-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="failure-mode-list"]')).toContainText([
      'constraint_violation',
      'hallucination',
      'off_topic',
      'poor_quality'
    ]);

    // Verify dynamic labels appear in annotation form
    await page.goto('/traces/1');
    await expect(page.locator('[data-testid="dynamic-label-constraint_violation"]')).toBeVisible();
    await expect(page.locator('[data-testid="dynamic-label-hallucination"]')).toBeVisible();
  });
});
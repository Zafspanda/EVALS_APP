import { test, expect } from './support/fixtures/auth.fixture';
import { createTraces, createAnnotation } from './support/factories/trace.factory';
import { waitForApiResponse, waitForNetworkIdle } from './support/helpers/wait-for';

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page, authenticatedUser }) => {
    // Mock traces and annotations data
    const mockTraces = createTraces(10);
    const mockAnnotations = mockTraces.map(t =>
      createAnnotation(t.id, { is_golden_set: t.id <= 3 })
    );

    await page.route('**/api/traces', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ traces: mockTraces, total: 10 })
      })
    );

    await page.route('**/api/annotations', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ annotations: mockAnnotations })
      })
    );

    await page.goto('/export');
  });

  test('[P0] should export all annotations as CSV', async ({ page }) => {
    // GIVEN: User is on export page
    await expect(page.locator('[data-testid="export-page"]')).toBeVisible();

    // WHEN: User selects CSV format and exports all
    await page.click('[data-testid="format-csv"]');
    await page.click('[data-testid="export-all"]');

    // Mock export endpoint
    const csvContent = `trace_id,llm_prompt,llm_response,human_label,human_confidence,evaluator_agrees,is_golden_set
1,"Test prompt 1","Response 1","pass",4,"yes",true
2,"Test prompt 2","Response 2","fail",2,"no",true`;

    await page.route('**/api/export/csv', route =>
      route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="annotations_export.csv"'
        },
        body: csvContent
      })
    );

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');

    // THEN: CSV file is downloaded
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('annotations_export.csv');

    // Verify download content
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const content = Buffer.concat(chunks).toString();
    expect(content).toContain('trace_id,llm_prompt');
    expect(content).toContain('pass');
  });

  test('[P0] should export as JSONL for CI pipeline', async ({ page }) => {
    // GIVEN: User wants JSONL format for CI integration
    await page.click('[data-testid="format-jsonl"]');

    // WHEN: User exports all annotations
    const jsonlContent = `{"trace_id":1,"human_label":"pass","human_confidence":4,"evaluator_agrees":"yes"}
{"trace_id":2,"human_label":"fail","human_confidence":2,"evaluator_agrees":"no"}`;

    await page.route('**/api/export/jsonl', route =>
      route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Content-Disposition': 'attachment; filename="annotations.jsonl"'
        },
        body: jsonlContent
      })
    );

    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');

    // THEN: JSONL file is downloaded
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('annotations.jsonl');
  });

  test('[P1] should filter export to golden set only', async ({ page }) => {
    // GIVEN: User wants only golden set traces
    await page.click('[data-testid="format-csv"]');

    // WHEN: User enables golden set filter
    await page.check('[data-testid="filter-golden-set"]');

    // Mock filtered export
    await page.route('**/api/export/csv?golden_set=true', route =>
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/csv' },
        body: 'trace_id,human_label\n1,"pass"\n2,"pass"\n3,"fail"'
      })
    );

    await page.click('[data-testid="export-button"]');

    // THEN: Export contains only golden set traces
    await expect(page.locator('[data-testid="export-status"]')).toContainText(
      'Exported 3 golden set traces'
    );
  });

  test('[P1] should show progress for large exports', async ({ page }) => {
    // GIVEN: Large dataset to export
    await page.click('[data-testid="format-csv"]');

    // WHEN: Starting export of large dataset
    // Mock progress updates
    await page.route('**/api/export/csv', async route => {
      // Simulate slow export
      await new Promise(resolve => setTimeout(resolve, 1000));

      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/csv' },
        body: 'large dataset...'
      });
    });

    await page.route('**/api/export/progress', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          progress: 50,
          processed: 500,
          total: 1000,
          status: 'processing'
        })
      })
    );

    await page.click('[data-testid="export-button"]');

    // THEN: Progress bar is shown during export
    await expect(page.locator('[data-testid="export-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-text"]')).toContainText('Processing');

    // Wait for completion
    await page.waitForSelector('[data-testid="export-complete"]', { timeout: 10000 });
  });

  test('[P1] should include metadata in export', async ({ page }) => {
    // GIVEN: User exports with metadata
    await page.click('[data-testid="format-csv"]');
    await page.check('[data-testid="include-metadata"]');

    // WHEN: Exporting
    await page.route('**/api/export/csv?include_metadata=true', route => {
      const csvWithMetadata = `# Export Date: ${new Date().toISOString()}
# Rubric Version: 1.0.0
# Total Traces: 10
# Golden Set: 3
trace_id,human_label,human_confidence
1,"pass",4
2,"fail",2`;

      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/csv' },
        body: csvWithMetadata
      });
    });

    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');

    // THEN: Export includes metadata headers
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const content = Buffer.concat(chunks).toString();
    expect(content).toContain('# Export Date:');
    expect(content).toContain('# Rubric Version:');
  });

  test('[P2] should export with dynamic label columns', async ({ page }) => {
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
    await page.click('[data-testid="format-csv"]');

    // WHEN: Exporting with dynamic columns
    const csvWithDynamicLabels = `trace_id,human_label,constraint_violation,hallucination,off_topic
1,"pass",false,false,"n/a"
2,"fail",true,true,false`;

    await page.route('**/api/export/csv', route =>
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/csv' },
        body: csvWithDynamicLabels
      })
    );

    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');

    // THEN: Export includes dynamic label columns
    const download = await downloadPromise;
    const content = await download.path();
    expect(content).toBeTruthy();
  });

  test('[P2] should handle export errors gracefully', async ({ page }) => {
    // GIVEN: Export will fail
    await page.click('[data-testid="format-csv"]');

    // WHEN: Export endpoint returns error
    await page.route('**/api/export/csv', route =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ detail: 'Database connection failed' })
      })
    );

    await page.click('[data-testid="export-button"]');

    // THEN: Error message is displayed
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText(
      'Export failed'
    );

    // Retry button should be available
    await expect(page.locator('[data-testid="retry-export"]')).toBeVisible();
  });
});
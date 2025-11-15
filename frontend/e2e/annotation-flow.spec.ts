import { test, expect } from '@playwright/test'

test.describe('Annotation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173')
  })

  test('Import CSV → View trace → Save annotation', async ({ page }) => {
    // Step 1: Navigate to Import page
    await page.click('text=Import CSV')
    await expect(page).toHaveURL('/import')

    // Step 2: Upload CSV file
    const csvContent = `trace_id,flow_session,turn_number,total_turns,user_message,ai_response,col7,col8,col9,col10,col11,col12,col13,col14,col15,col16,col17,col18,col19,col20,col21,col22,col23,col24,col25,col26,col27,col28
test_trace_001,session_001,1,1,What is the weather?,The weather is sunny today.,,,,,,,,,,,,,,,,,,,,,`

    const buffer = Buffer.from(csvContent, 'utf-8')
    const fileChooserPromise = page.waitForEvent('filechooser')

    // Click on upload area
    await page.click('.n-upload-dragger')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([{
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: buffer
    }])

    // Click import button
    await page.click('text=Import test.csv')

    // Wait for success message
    await expect(page.locator('text=Import Complete!')).toBeVisible()

    // Step 3: Navigate to traces
    await page.click('text=View Traces')
    await expect(page).toHaveURL('/traces')

    // Wait for traces to load
    await page.waitForSelector('text=test_trace_001')

    // Step 4: Click on trace to view details
    await page.click('button:has-text("View")')
    await expect(page).toHaveURL(/\/trace\/test_trace_001/)

    // Step 5: Fill annotation form
    await page.click('input[value="Pass"]')
    await page.fill('input[placeholder*="comma-separated codes"]', 'helpful,accurate')
    await page.fill('textarea[placeholder*="comments"]', 'This is a test annotation')

    // Step 6: Save annotation
    await page.click('button:has-text("Save Annotation")')

    // Wait for success message
    await expect(page.locator('text=Annotation saved successfully')).toBeVisible()
  })

  test('CSV validation with invalid data', async ({ page }) => {
    // Navigate to Import page
    await page.click('text=Import CSV')

    // Try to upload non-CSV file
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('.n-upload-dragger')

    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([{
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Invalid content', 'utf-8')
    }])

    // Should show error
    await expect(page.locator('text=Please select a CSV file')).toBeVisible()
  })

  test('Annotation form validation', async ({ page }) => {
    // Assume we have a trace loaded (would normally set this up)
    await page.goto('/trace/test_trace_001')

    // Select Fail but don't fill failure note
    await page.click('input[value="Fail"]')

    // Try to save without filling required failure note
    await page.click('button:has-text("Save Annotation")')

    // Should show validation error or the field should be visible
    await expect(page.locator('text=First Failure Note')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('Main navigation works correctly', async ({ page }) => {
    await page.goto('http://localhost:5173')

    // Test navigation to Traces
    await page.click('text=Traces')
    await expect(page).toHaveURL('/traces')

    // Test navigation to Import
    await page.click('text=Import CSV')
    await expect(page).toHaveURL('/import')

    // Test navigation back to Home
    await page.click('text=Home')
    await expect(page).toHaveURL('/')
  })

  test('Trace navigation (previous/next)', async ({ page }) => {
    // This would need multiple traces to be imported first
    // Mock or setup multiple traces in the database

    await page.goto('/trace/test_trace_001')

    // Check navigation buttons exist
    await expect(page.locator('button:has-text("Previous Trace")')).toBeVisible()
    await expect(page.locator('button:has-text("Next Trace")')).toBeVisible()
  })
})
/**
 * Helper utilities for deterministic test waiting
 * Avoids hard waits and provides explicit conditions
 */

/**
 * Polls for a condition to be true
 * @param condition - Async function that returns true when condition is met
 * @param timeout - Maximum time to wait in ms (default 5000)
 * @param interval - Poll interval in ms (default 100)
 */
export const waitFor = async (
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Retries an operation with exponential backoff
 * @param fn - Function to retry
 * @param maxAttempts - Maximum number of attempts (default 3)
 * @param delay - Initial delay between attempts in ms (default 1000)
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError?.message}`);
};

/**
 * Waits for an API response to complete
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to match
 * @param timeout - Maximum time to wait
 */
export const waitForApiResponse = async (
  page: any,
  urlPattern: string | RegExp,
  timeout: number = 5000
): Promise<any> => {
  return page.waitForResponse(
    (response: any) => {
      const url = response.url();
      return typeof urlPattern === 'string'
        ? url.includes(urlPattern)
        : urlPattern.test(url);
    },
    { timeout }
  );
};

/**
 * Waits for network to be idle
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait
 */
export const waitForNetworkIdle = async (
  page: any,
  timeout: number = 5000
): Promise<void> => {
  await page.waitForLoadState('networkidle', { timeout });
};

/**
 * Waits for a specific number of elements to be visible
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param count - Expected count
 * @param timeout - Maximum time to wait
 */
export const waitForElementCount = async (
  page: any,
  selector: string,
  count: number,
  timeout: number = 5000
): Promise<void> => {
  await waitFor(
    async () => {
      const elements = await page.locator(selector).count();
      return elements === count;
    },
    timeout
  );
};
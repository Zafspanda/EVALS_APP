import { test as base } from '@playwright/test';
import { createUser, deleteUser } from '../factories/user.factory';

export interface AuthFixtures {
  authenticatedUser: {
    id: string;
    email: string;
    username: string;
    clerkId: string;
  };
}

/**
 * Authentication fixture with auto-cleanup
 * Provides an authenticated user session for tests
 */
export const test = base.extend<AuthFixtures>({
  authenticatedUser: async ({ page }, use) => {
    // Setup: Create test user
    const user = await createUser();

    // Mock Clerk authentication
    await page.addInitScript((user) => {
      // Mock Clerk's isSignedIn state
      window.localStorage.setItem('clerk:session', JSON.stringify({
        userId: user.clerkId,
        sessionId: 'test_session_' + Date.now(),
        status: 'active'
      }));

      // Mock user object
      window.localStorage.setItem('clerk:user', JSON.stringify({
        id: user.clerkId,
        primaryEmailAddress: user.email,
        username: user.username
      }));
    }, user);

    // Navigate to app (should be authenticated)
    await page.goto('/');

    // Verify authentication worked
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 });

    // Provide user to test
    await use(user);

    // Cleanup: Delete user and clear session
    await page.evaluate(() => {
      window.localStorage.removeItem('clerk:session');
      window.localStorage.removeItem('clerk:user');
    });
    await deleteUser(user.id);
  },
});

export { expect } from '@playwright/test';
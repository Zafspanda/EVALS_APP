import { faker } from '@faker-js/faker';

export interface TestUser {
  id: string;
  email: string;
  username: string;
  clerkId: string;
  role: 'admin' | 'evaluator';
  assignedTraces?: { start: number; end: number };
}

/**
 * Creates a test user with random data
 * Uses faker for all random values to avoid hardcoding
 */
export const createUser = (overrides: Partial<TestUser> = {}): TestUser => {
  const username = faker.internet.userName();

  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName: username }),
    username,
    clerkId: `user_${faker.string.alphanumeric(24)}`,
    role: 'evaluator',
    ...overrides,
  };
};

/**
 * Creates multiple test users
 */
export const createUsers = (count: number, overrides: Partial<TestUser> = {}): TestUser[] =>
  Array.from({ length: count }, () => createUser(overrides));

/**
 * Creates an admin user
 */
export const createAdminUser = (overrides: Partial<TestUser> = {}): TestUser =>
  createUser({ ...overrides, role: 'admin' });

/**
 * Creates an evaluator with assigned traces
 */
export const createEvaluatorWithTraces = (
  traceRange: { start: number; end: number },
  overrides: Partial<TestUser> = {}
): TestUser =>
  createUser({
    ...overrides,
    role: 'evaluator',
    assignedTraces: traceRange
  });

/**
 * Cleanup function to delete user (mocked for testing)
 * In a real app, this would call the backend API
 */
export const deleteUser = async (userId: string): Promise<void> => {
  // In a real implementation, this would call:
  // await fetch(`${API_BASE_URL}/api/users/${userId}`, { method: 'DELETE' });

  // For testing, we just log the deletion
  console.log(`[Test Cleanup] Deleted user: ${userId}`);
  return Promise.resolve();
};
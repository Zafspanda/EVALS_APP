import { faker } from '@faker-js/faker';

export interface TestTrace {
  id: number;
  // Input fields (28 columns from CSV)
  llm_prompt: string;
  llm_prompt_template: string;
  llm_response: string;
  llm_response_logprobs: string;
  llm_model_name: string;
  evaluator_model_name: string;
  evaluator_prompt: string;
  evaluator_response: string;
  synthetic_user_criteria?: string;
  additional_context?: string;

  // Status
  status: 'pending' | 'coded' | 'reviewed';
  assigned_to?: string;
}

export interface TestAnnotation {
  trace_id: number;
  human_label: 'pass' | 'fail' | 'unsure' | 'irrelevant';
  human_confidence: 1 | 2 | 3 | 4 | 5;
  failure_modes?: string[];
  evaluator_agrees: 'yes' | 'no' | 'n/a';
  is_golden_set: boolean;
  needs_support_clarification: boolean;
  taxonomy_category?: string;
  notes?: string;
  dynamic_labels?: Record<string, boolean | 'n/a'>;
}

/**
 * Creates a test trace with realistic data
 */
export const createTrace = (overrides: Partial<TestTrace> = {}): TestTrace => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  llm_prompt: faker.lorem.paragraph(),
  llm_prompt_template: faker.lorem.sentence(),
  llm_response: faker.lorem.paragraphs(2),
  llm_response_logprobs: JSON.stringify(Array.from({ length: 10 }, () =>
    faker.number.float({ min: -5, max: 0 })
  )),
  llm_model_name: faker.helpers.arrayElement(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2']),
  evaluator_model_name: faker.helpers.arrayElement(['gpt-4', 'claude-3']),
  evaluator_prompt: faker.lorem.paragraph(),
  evaluator_response: faker.helpers.arrayElement(['pass', 'fail']),
  synthetic_user_criteria: faker.lorem.sentence(),
  additional_context: faker.lorem.sentence(),
  status: 'pending',
  ...overrides,
});

/**
 * Creates multiple test traces
 */
export const createTraces = (count: number, overrides: Partial<TestTrace> = {}): TestTrace[] =>
  Array.from({ length: count }, (_, i) => createTrace({
    id: i + 1,
    ...overrides
  }));

/**
 * Creates traces with assigned user
 */
export const createAssignedTraces = (
  count: number,
  userId: string,
  startId: number = 1
): TestTrace[] =>
  Array.from({ length: count }, (_, i) => createTrace({
    id: startId + i,
    assigned_to: userId,
    status: faker.helpers.arrayElement(['pending', 'coded', 'reviewed'])
  }));

/**
 * Creates a test annotation
 */
export const createAnnotation = (
  traceId: number,
  overrides: Partial<TestAnnotation> = {}
): TestAnnotation => ({
  trace_id: traceId,
  human_label: faker.helpers.arrayElement(['pass', 'fail', 'unsure', 'irrelevant']),
  human_confidence: faker.helpers.arrayElement([1, 2, 3, 4, 5]),
  failure_modes: faker.helpers.arrayElements(
    ['constraint_violation', 'hallucination', 'off_topic', 'poor_quality'],
    { min: 0, max: 2 }
  ),
  evaluator_agrees: faker.helpers.arrayElement(['yes', 'no', 'n/a']),
  is_golden_set: faker.datatype.boolean({ probability: 0.1 }),
  needs_support_clarification: faker.datatype.boolean({ probability: 0.2 }),
  taxonomy_category: faker.helpers.arrayElement([
    'task_completion',
    'creative_writing',
    'reasoning',
    'factual_qa',
    'code_generation',
    'other'
  ]),
  notes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : undefined,
  ...overrides,
});

/**
 * Creates annotation with dynamic labels from rubric
 */
export const createAnnotationWithDynamicLabels = (
  traceId: number,
  rubricLabels: string[]
): TestAnnotation => {
  const dynamicLabels: Record<string, boolean | 'n/a'> = {};

  rubricLabels.forEach(label => {
    dynamicLabels[label] = faker.helpers.arrayElement([true, false, 'n/a']);
  });

  return createAnnotation(traceId, { dynamic_labels: dynamicLabels });
};
// API Type Definitions for Evals App
// Migrated from Vue to React

export interface Trace {
  trace_id: string;
  flow_session: string;
  turn_number: number;
  total_turns: number;
  user_message: string;
  ai_response: string;
  tool_calls?: ToolCall[];
  previous_turns?: PreviousTurn[];
  annotation?: Annotation;
}

export interface ToolCall {
  id: string;
  function_name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface PreviousTurn {
  turn_number: number;
  user_message: string;
  ai_response: string;
}

export interface Annotation {
  annotation_id?: string;
  trace_id: string;
  user_id?: string;
  holistic_pass_fail: 'Pass' | 'Fail';
  first_failure_note?: string;
  open_codes?: string;
  comments_hypotheses?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdjacentTraces {
  prev: string | null;
  next: string | null;
}

export interface RecentAnnotation {
  trace_id: string;
  holistic_pass_fail: 'Pass' | 'Fail';
  updated_at: string;
}

export interface UserStats {
  total_annotations: number;
  pass_count: number;
  fail_count: number;
  pass_rate?: number;
  recent_annotations?: RecentAnnotation[];
}

export interface TracesResponse {
  traces: Trace[];
  total: number;
  page: number;
  page_size: number;
}

export interface User {
  user_id: string;
  email: string;
  created_at: string;
}

import { create } from 'zustand';

interface Trace {
  _id: string;
  trace_id: string;
  flow_session: string;
  turn_number: number;
  total_turns: number;
  user_message: string;
  ai_response: string;
  context?: Array<{
    turn_number: number;
    user_message: string;
    ai_response: string;
  }>;
  imported_at: string;
}

interface TracesState {
  traces: Trace[];
  currentTrace: Trace | null;
  isLoading: boolean;
  setTraces: (traces: Trace[]) => void;
  setCurrentTrace: (trace: Trace | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useTracesStore = create<TracesState>((set) => ({
  traces: [],
  currentTrace: null,
  isLoading: false,
  setTraces: (traces) => set({ traces }),
  setCurrentTrace: (currentTrace) => set({ currentTrace }),
  setLoading: (isLoading) => set({ isLoading }),
}));

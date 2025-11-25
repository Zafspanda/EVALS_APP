import { create } from 'zustand';

interface Annotation {
  _id: string;
  trace_id: string;
  user_id: string;
  holistic_pass_fail: 'Pass' | 'Fail';
  first_failure_note?: string;
  open_codes: string[];
  comments_hypotheses?: string;
  needs_clarification: boolean;
  is_golden_set: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

interface AnnotationsState {
  annotations: Record<string, Annotation>;
  isSaving: boolean;
  setAnnotation: (traceId: string, annotation: Annotation) => void;
  setSaving: (isSaving: boolean) => void;
}

export const useAnnotationsStore = create<AnnotationsState>((set) => ({
  annotations: {},
  isSaving: false,
  setAnnotation: (traceId, annotation) =>
    set((state) => ({
      annotations: { ...state.annotations, [traceId]: annotation },
    })),
  setSaving: (isSaving) => set({ isSaving }),
}));

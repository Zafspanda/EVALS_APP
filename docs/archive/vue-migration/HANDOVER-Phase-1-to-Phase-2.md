# 🔄 Migration Handover: Phase 1 → Phase 2

**Date:** 2025-11-23
**From:** Dev Agent (Amelia) - Phase 1: Core Infrastructure
**To:** Next Dev Agent - Phase 2: Component Migration
**Project:** Evals App - Vue → React + SDS Migration

---

## ✅ What Was Completed (Phase 1)

### 📦 Deliverables

**Phase 1: Core Infrastructure** is **100% COMPLETE**

All foundation infrastructure for React + SDS migration is in place:

1. **Clerk Authentication** ✅
   - File: `frontend/src/main.tsx:15-20`
   - ClerkProvider wrapping App component
   - Using `VITE_CLERK_PUBLISHABLE_KEY` from env

2. **API Service Layer** ✅
   - File: `frontend/src/services/api.ts` (122 lines)
   - Migrated from Axios to native `fetch`
   - Clerk token injection via `window.Clerk.session.getToken()`
   - Full TypeScript typing
   - API methods: auth, traces (import, get, adjacent, next unannotated), annotations (save, get, stats)

3. **TypeScript Type Definitions** ✅
   - File: `frontend/src/types/api.ts` (57 lines)
   - Types: `Trace`, `Annotation`, `ToolCall`, `TracesResponse`, `UserStats`, `AdjacentTraces`, etc.

4. **Custom Hooks for Data Fetching** ✅
   - File: `frontend/src/hooks/useTraces.ts` (113 lines)
     - `useTraces(page, pageSize)` - Paginated list
     - `useTrace(traceId)` - Single trace
     - `useAdjacentTraces(traceId)` - Prev/next navigation
     - `useNextUnannotated()` - Get next unannotated

   - File: `frontend/src/hooks/useAnnotations.ts` (81 lines)
     - `useAnnotation(traceId)` - Get annotation for trace
     - `useSaveAnnotation()` - Save annotation mutation
     - `useUserStats()` - User stats

### 📂 File Structure Created

```
frontend/src/
├── types/
│   └── api.ts              # TypeScript definitions
├── services/
│   └── api.ts              # Fetch-based API service
└── hooks/
    ├── useTraces.ts        # Trace data hooks
    └── useAnnotations.ts   # Annotation data hooks
```

### 🔧 Environment Setup

- **React 18.3.1** installed
- **@clerk/clerk-react 5.56.2** installed
- **SDS** linked from local: `/Sendle/SDS/sendle-design-system-main/packages/sds-ui`
- React scaffold running on **port 5175** (npm run dev:react)
- Backend API running on **port 8000**

---

## 🎯 Your Mission: Phase 2 - Component Migration

### 📋 Phase 2 Scope

**Goal:** Migrate all Vue components to React + Sendle Design System

**Estimated Time:** 4 days (Days 2-6 of migration)

**Status:** Not started

### 📍 Documentation Sources

All Phase 2 requirements are documented in:

1. **Primary Guide:** `docs/migration-implementation-guide.md`
   - Lines 1077-1110: Phase 2 breakdown
   - Lines 280-1002: Detailed component migration mappings

2. **Tracking File:** `docs/migration-status.yaml`
   - Lines 60-131: Component checklist

3. **UX Spec:** `docs/ux-design-specification.md`
   - UX patterns and component behaviors

4. **Vue Reference:** `frontend/src-vue-backup/`
   - Original Vue components to migrate from

---

## 📝 Phase 2 Task Breakdown

### Priority Order (Recommended)

#### **Task Group 1: QuickActions + FailureForm** (Days 2-3)
**Complexity:** HIGH | **Priority:** 1 (Core user flow)

**Source:**
- Vue: `frontend/src-vue-backup/components/AnnotationForm.vue` (~250 LOC)

**Target:**
- React: `frontend/src/components/QuickActions/QuickActions.tsx`
- React: `frontend/src/components/QuickActions/FailureForm.tsx`
- SCSS: `frontend/src/components/QuickActions/QuickActions.scss`

**What to Build:**
1. **QuickActions.tsx**
   - 3 action buttons: "Pass & Next", "Skip", "Mark as Fail"
   - Conditional rendering of FailureForm
   - Uses: `useSaveAnnotation()` hook, `useNextUnannotated()` hook
   - SDS Components: Button, Alert

2. **FailureForm.tsx**
   - Form fields: `first_failure_note` (required), `open_codes`, `comments_hypotheses`
   - Client-side validation
   - Save & navigate to next trace
   - SDS Components: Input, TextArea, Button, Alert

**Reference:**
- Implementation guide: Lines 410-643
- Example code provided in guide

**Success Criteria:**
- [ ] "Pass & Next" saves annotation and navigates to next unannotated trace
- [ ] "Skip" navigates without saving
- [ ] "Mark as Fail" shows inline form
- [ ] Fail form validates required field
- [ ] Fail form saves and navigates on submit

---

#### **Task Group 2: TraceViewer** (Days 3-4)
**Complexity:** HIGH | **Priority:** 1 (Core display)

**Source:**
- Vue: `frontend/src-vue-backup/components/TraceViewer.vue` (~300 LOC)

**Target:**
- React: `frontend/src/components/TraceViewer/TraceViewer.tsx`
- React: `frontend/src/components/TraceViewer/ToolCallCard.tsx` (subcomponent)
- React: `frontend/src/components/TraceViewer/SessionContext.tsx` (subcomponent)
- SCSS: `frontend/src/components/TraceViewer/TraceViewer.scss`

**What to Build:**
1. **TraceViewer.tsx**
   - Displays trace metadata (turn number, session, etc.)
   - User input, AI response sections
   - Tool calls rendering (uses ToolCallCard)
   - Session context for multi-turn conversations (uses SessionContext)
   - Prev/Next navigation buttons
   - Integrates QuickActions component
   - Uses: `useTrace(traceId)`, `useAdjacentTraces(traceId)`, `useAnnotation(traceId)`
   - SDS Components: Button, Divider

2. **ToolCallCard.tsx**
   - Displays individual tool call (function name, arguments, result)
   - Collapsible/expandable view

3. **SessionContext.tsx**
   - Timeline of previous turns in conversation
   - Replaces Naive UI NTimeline

**Reference:**
- Implementation guide: Lines 283-407
- Example code provided in guide

**Success Criteria:**
- [ ] Trace loads and displays correctly
- [ ] Tool calls rendered properly
- [ ] Session context shows for multi-turn conversations
- [ ] Prev/Next navigation works
- [ ] QuickActions integrated and functional

---

#### **Task Group 3: TraceList** (Day 5)
**Complexity:** MEDIUM | **Priority:** 2

**Source:**
- Vue: `frontend/src-vue-backup/components/TraceList.vue` (~200 LOC)

**Target:**
- React: `frontend/src/components/TraceList/TraceList.tsx`
- SCSS: `frontend/src/components/TraceList/TraceList.scss`

**What to Build:**
- Paginated data table
- Columns: Status, Trace ID, Session, Turn, User Message, AI Response, Actions
- Status indicators: ✓ Pass (green), ✗ Fail (red), ○ Unannotated (gray)
- Row highlighting based on annotation status
- Pagination controls
- "View" button navigates to trace detail
- Uses: `useTraces(page, pageSize)`
- SDS Components: Table (or custom table), Badge, Button

**Reference:**
- Implementation guide: Lines 646-771

**Success Criteria:**
- [ ] Table renders with pagination
- [ ] Status badges display correctly
- [ ] Row highlighting works
- [ ] Pagination controls functional
- [ ] View button navigates to /trace/:id

---

#### **Task Group 4: AppHeader + CsvImporter** (Day 6)
**Complexity:** MEDIUM | **Priority:** 3

**Source:**
- Vue: `frontend/src-vue-backup/components/AppHeader.vue` (~150 LOC)
- Vue: `frontend/src-vue-backup/components/CsvImporter.vue` (~180 LOC)

**Target:**
- React: `frontend/src/components/AppHeader/AppHeader.tsx`
- React: `frontend/src/components/CsvImporter/CsvImporter.tsx`

**What to Build:**

1. **AppHeader.tsx**
   - Navigation menu (Home, Traces, Import CSV)
   - Clerk auth integration (SignedIn, SignedOut, UserButton)
   - User stats display (annotation count)
   - Responsive design (collapse on mobile)
   - Uses: `useUserStats()`, `@clerk/clerk-react` hooks
   - SDS Components: Button

2. **CsvImporter.tsx**
   - File upload with drag-and-drop
   - File validation (extension .csv, size <10MB)
   - Upload progress feedback
   - Success/error messages
   - Uses: `apiService.importCSV(file)`
   - SDS Components: FileUpload, Button, Alert

**Reference:**
- Implementation guide: Lines 774-1002

**Success Criteria:**
- [ ] Header navigation works
- [ ] Clerk auth displays correctly
- [ ] User stats shown
- [ ] CSV drag-and-drop works
- [ ] File validation works
- [ ] Upload succeeds and imports traces

---

## 🗂️ Component Checklist (from migration-status.yaml)

Track your progress by updating `docs/migration-status.yaml`:

### Views (Simple Wrappers)
- [ ] App.tsx (Root component)
- [ ] Dashboard View
- [ ] Evaluation View
- [ ] Import View
- [ ] Export View

### Components
- [ ] AppHeader Component
- [ ] TraceViewer Component
- [ ] AnnotationForm → QuickActions + FailureForm
- [ ] CsvImporter Component
- [ ] ExportDialog Component
- [ ] ProgressTracker Component

---

## 🛠️ Tools & Resources Available

### 1. **API Service & Hooks (Ready to Use)**

```tsx
// Import hooks
import { useTraces, useTrace, useAdjacentTraces, useNextUnannotated } from '../hooks/useTraces';
import { useAnnotation, useSaveAnnotation, useUserStats } from '../hooks/useAnnotations';
import { apiService } from '../services/api';

// Use in components
const { traces, total, loading, error, refresh } = useTraces(page, pageSize);
const { trace, loading, error } = useTrace(traceId);
const { saveAnnotation, saving, error } = useSaveAnnotation();
```

### 2. **TypeScript Types (Already Defined)**

```tsx
import type { Trace, Annotation, UserStats } from '../types/api';
```

### 3. **Clerk Auth Hooks**

```tsx
import { useAuth, useUser } from '@clerk/clerk-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const { isLoaded, userId } = useAuth();
const { user } = useUser();
```

### 4. **SDS Components**

```tsx
// SDS is linked locally - import works as normal
import { Button, Input, TextArea, Alert, Badge, Divider } from '@sendle/sds-ui';

// To check available components, browse:
// /Sendle/SDS/sendle-design-system-main/packages/sds-ui/react/

// Available component categories:
// - inputs/       (Button, Input, TextArea, Checkbox, Radio, Select, etc.)
// - data_display/ (Badge, Table?, etc.)
// - feedback/     (Alert, Toast?, etc.)
// - layout/       (Container, Grid?, etc.)
// - navigation/   (Nav components)
// - icons/        (Icon components)

// Note: Verify Table component availability by checking react/data_display/
// If not available, build custom table with SDS design tokens
```

### 5. **Vue Reference Code**

All original Vue components are in:
```
frontend/src-vue-backup/components/
frontend/src-vue-backup/views/
```

Use these as reference for:
- Component logic
- Data flow
- Event handlers
- UI structure

---

## 📖 Key Migration Patterns

### Vue → React Cheatsheet

| Vue | React |
|-----|-------|
| `ref(value)` | `useState(value)` |
| `reactive(obj)` | `useState(obj)` |
| `computed(() => ...)` | `useMemo(() => ..., [deps])` |
| `watch(source, cb)` | `useEffect(() => {...}, [deps])` |
| `onMounted(cb)` | `useEffect(() => { cb() }, [])` |
| `defineProps` | `interface Props { ... }` |
| `defineEmits` | Callback props `onSave: () => void` |
| `v-model` | Controlled components `value + onChange` |
| `@click` | `onClick` |

### Naive UI → SDS Component Mapping

| Naive UI | SDS/Custom |
|----------|-----------|
| `NButton` | `<Button>` |
| `NInput` | `<Input>` |
| `NTextArea` | `<TextArea>` |
| `NAlert` | `<Alert>` |
| `NTag` | `<Badge>` |
| `NDivider` | `<Divider>` |
| `NCard` | Custom `<div>` with SDS tokens |
| `NDataTable` | `<Table>` or custom |
| `NForm` | Native `<form>` |
| `useMessage()` | Custom toast or SDS notification |

---

## 🚨 Important Notes

### 1. **SDS Component Availability**

**IMPORTANT:** SDS is installed **locally via npm link**, NOT from a remote registry.

- **Local path:** `/Users/zaf-imac2021/Documents/Documents - Mac Mini/GitHub/Sendle/SDS/sendle-design-system-main/packages/sds-ui/`
- **Linked to frontend:** `@sendle/sds-ui@0.25.0` → `./../../Sendle/SDS/sendle-design-system-main/packages/sds-ui`
- **No GitHub PAT needed** - using local installation

**SDS Structure:**
```
/Sendle/SDS/sendle-design-system-main/packages/sds-ui/
├── react/              # React components
│   ├── inputs/         # Input components
│   ├── data_display/   # Data display components
│   ├── feedback/       # Feedback components (alerts, etc.)
│   ├── layout/         # Layout components
│   ├── navigation/     # Navigation components
│   └── icons/          # Icon components
├── scss/               # SCSS styles
└── tokens/             # Design tokens
```

**Component Discovery:**
- Browse local files: `/Sendle/SDS/.../react/` folders
- Check `react/index.js` for exported components
- If component missing: Build custom using SDS design tokens from `tokens/` folder

**Already Configured:**
- ✅ SDS SCSS imported in `main.tsx`: `import '@sendle/sds-ui/scss/sds.scss';`
- ✅ npm link active: `@sendle/sds-ui@0.25.0` → local package
- ✅ Vite configured to handle SDS imports

### 2. **File Organization**

Follow this structure for each component:

```
src/components/ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.scss      # Styles (SDS tokens)
├── Subcomponent.tsx        # Subcomponents (if needed)
└── index.ts                # Export
```

### 3. **Testing Strategy**

After each component:
1. **Manual test** in browser (port 5175)
2. **Check console** for errors
3. **Verify SDS styling** matches design
4. **Test core functionality** (forms, navigation, data loading)

### 4. **State Management**

- Use **component-local state** (`useState`) for simple state
- Use **custom hooks** for API data (already created)
- **No Context needed yet** - add only if prop drilling becomes excessive

### 5. **Error Handling**

All hooks return `{ data, loading, error }`. Display errors to user:

```tsx
if (loading) return <div>Loading...</div>;
if (error) return <Alert type="error">{error.message}</Alert>;
```

---

## 📊 Progress Tracking

### How to Update Migration Status

After completing each component:

1. Open: `docs/migration-status.yaml`
2. Find component under `Phase 2: Component Migration`
3. Update status: `"not-started"` → `"completed"`
4. Add notes about implementation
5. Commit changes

Example:
```yaml
- name: "QuickActions Component"
  status: "completed"
  notes: "Split into QuickActions.tsx + FailureForm.tsx. Using useSaveAnnotation hook."
```

---

## 🔗 Critical Files Reference

### Documentation
- **Migration Guide:** `docs/migration-implementation-guide.md` (2030 lines)
- **Migration Status:** `docs/migration-status.yaml` (tracking file)
- **UX Spec:** `docs/ux-design-specification.md`
- **Architecture:** `docs/architecture/` (multiple files)

### Code
- **Vue Backup:** `frontend/src-vue-backup/` (reference only, don't modify)
- **React Source:** `frontend/src/` (your workspace)
- **Types:** `frontend/src/types/api.ts`
- **API Service:** `frontend/src/services/api.ts`
- **Hooks:** `frontend/src/hooks/`

### Config
- **Vite Config:** `frontend/vite.config.react.ts`
- **TypeScript:** `frontend/tsconfig.json`
- **Package:** `frontend/package.json`
- **Env:** `frontend/.env` (Clerk keys)

---

## 🎬 Getting Started Checklist

Before you begin Phase 2:

- [ ] Read this handover document completely
- [ ] Review `docs/migration-implementation-guide.md` (Phase 2 section)
- [ ] Explore Vue components in `frontend/src-vue-backup/components/`
- [ ] Verify React dev server running: `npm run dev:react` (port 5175)
- [ ] Verify backend API running: `./venv/bin/uvicorn app.main:app --reload` (port 8000)
- [ ] Check SDS Storybook for component availability
- [ ] Create first component directory: `src/components/QuickActions/`

---

## 💡 Recommended Workflow

For each component:

1. **Read Vue source** - Understand logic and data flow
2. **Read migration guide section** - See React implementation example
3. **Create React component file(s)**
4. **Implement with SDS components**
5. **Add TypeScript types**
6. **Test in browser**
7. **Update migration-status.yaml**
8. **Commit progress**

---

## 🆘 If You Get Stuck

1. **Check migration guide:** Detailed examples for each component
2. **Review Phase 1 code:** See patterns in hooks/services
3. **Vue reference:** Compare with original Vue implementation
4. **SDS Storybook:** Check component API and examples
5. **Types:** Use TypeScript types for guidance

---

## 📈 Success Metrics

Phase 2 is complete when:

- [ ] All 11 components migrated to React
- [ ] All components use SDS or custom SDS-styled components
- [ ] No Naive UI dependencies remain
- [ ] Components functional (tested manually)
- [ ] `docs/migration-status.yaml` updated with all completions
- [ ] React app runs without console errors

---

## 🎯 Final Handover Summary

**You're starting with:**
✅ Complete API infrastructure (fetch + Clerk auth)
✅ Custom hooks for all data operations
✅ TypeScript types defined
✅ React + SDS scaffold running

**Your job:**
🔨 Migrate 11 components from Vue to React + SDS
📝 Follow the detailed guide in `migration-implementation-guide.md`
✅ Update `migration-status.yaml` as you go

**Estimated time:** 4 days

**Next phase (Phase 3):** Views and routing (1 day)

---

Good luck! The foundation is solid. Follow the guide, reference the Vue code, and you'll succeed. 🚀

---

**Questions?** Check the migration guide first - it has detailed examples for every component.

**Document Version:** 1.0
**Created:** 2025-11-23
**Author:** Dev Agent (Amelia)

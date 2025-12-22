# Vue → React + SDS Migration Implementation Guide

_Version 1.0 - November 23, 2025_
_Author: BMad Architecture Team_

---

## Executive Summary

This document provides a comprehensive implementation plan for migrating the **Open Coding Web Application** frontend from Vue 3 + Naive UI to React + Sendle Design System (SDS).

**Migration Rationale:**
- Ensure compatibility with Sendle Design System (SDS is React-only)
- Maintain consistency with Sendle's core product ecosystem
- Eliminate long-term technical debt from maintaining parallel Vue components
- Enable seamless adoption of SDS updates and improvements

**Estimated Timeline:** 7-10 working days for core migration + 3-5 days for testing/polish

**Resources Required:**
- 1 Frontend Engineer (primary)
- 1 UX Designer (SDS component validation)
- 1 QA Engineer (feature parity testing)

**Reference Documents:**
- Strategic Justification: `docs/Course-correction-SDS.md`
- UX Specification: `docs/ux-design-specification.md`
- Technical Spec: `docs/tech-spec.md`

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Target State Architecture](#2-target-state-architecture)
3. [Component Migration Mapping](#3-component-migration-mapping)
4. [Migration Phases](#4-migration-phases)
5. [State Management Strategy](#5-state-management-strategy)
6. [API Integration Migration](#6-api-integration-migration)
7. [Testing Strategy](#7-testing-strategy)
8. [Rollout Plan](#8-rollout-plan)
9. [Risks & Mitigation](#9-risks--mitigation)
10. [Appendices](#10-appendices)

---

## 1. Current State Analysis

### 1.1 Vue Component Inventory

**Core Components** (`/src/components/`):

| Component | LOC | Complexity | Naive UI Components | Description |
|-----------|-----|------------|---------------------|-------------|
| **TraceViewer.vue** | ~300 | High | NCard, NSpin, NEmpty, NDescriptions, NTimeline, NButton, NDivider, NP, NH4 | Displays conversation traces with context, timeline, prev/next navigation |
| **AnnotationForm.vue** | ~250 | High | NCard, NForm, NFormItem, NInput, NButton, NCollapse, NAlert, useMessage | Quick actions + conditional fail form with validation |
| **TraceList.vue** | ~200 | Medium | NCard, NDataTable, NButton, NTag, useMessage | Paginated data table with status indicators |
| **AppHeader.vue** | ~150 | Medium | NLayoutHeader, NSpace, NH2, NMenu, NTag, NButton | Navigation header with Clerk auth integration |
| **CsvImporter.vue** | ~180 | Medium | NCard, NUpload, NUploadDragger, NButton, NAlert, useMessage | CSV file upload with drag-drop validation |

**View Components** (`/src/views/`):

| View | Purpose | Complexity |
|------|---------|------------|
| **HomeView.vue** | Dashboard with stats (NStatistic, NGrid) | Medium |
| **TracesView.vue** | Wrapper for TraceList | Low |
| **TraceDetailView.vue** | Wrapper for TraceViewer | Low |
| **ImportView.vue** | Wrapper for CsvImporter | Low |

**Demo/Removable Components:**
- HelloWorld.vue, TheWelcome.vue, WelcomeItem.vue, AboutView.vue
- `components/icons/*` (example icon components)

### 1.2 Routing Configuration

**Vue Router** (`/src/router/index.ts`):

```typescript
const routes = [
  { path: '/', component: HomeView },
  { path: '/traces', component: TracesView },
  { path: '/trace/:id', component: TraceDetailView },
  { path: '/import', component: ImportView }
]
```

**Features:**
- Web history mode
- Route-based code splitting (lazy loading)
- Dynamic route parameter (`:id`)

### 1.3 State Management

**Current Approach:** No Pinia stores (component-local state only)

- All state managed using Vue 3 Composition API (`ref`, `reactive`, `computed`)
- Props drilling for parent-child communication
- Event emitters for child-parent communication (`emit`)
- No global state management currently needed

### 1.4 Naive UI Component Usage

**Most Used Components:**
- **Forms:** NForm, NFormItem, NInput (text/textarea), NButton
- **Data Display:** NDataTable, NCard, NTag, NDescriptions, NTimeline
- **Layout:** NSpace, NGrid, NLayout, NLayoutHeader
- **Feedback:** NAlert, NSpin, NEmpty, useMessage (toast)
- **Upload:** NUpload, NUploadDragger
- **Navigation:** NMenu
- **Auth (Clerk):** SignedIn, SignedOut, UserButton

**Components Requiring SDS Mapping:**
- NDataTable → SDS Table
- NTimeline → Custom or SDS alternative
- NCollapse → SDS Accordion/Collapsible
- NDescriptions → Custom or SDS alternative
- useMessage → SDS Toast/Notification system

### 1.5 API Service

**Location:** `/src/services/api.ts`

**HTTP Client:** Axios with Clerk auth interceptor

**Endpoints:**
- `GET /api/auth/me` - Get current user
- `POST /api/traces/import-csv` - Import CSV
- `GET /api/traces` - List traces (paginated)
- `GET /api/traces/:id` - Get single trace
- `GET /api/traces/:id/adjacent` - Get prev/next traces
- `GET /api/traces/next/unannotated` - Get next unannotated
- `POST /api/annotations` - Save annotation
- `GET /api/annotations/trace/:id` - Get annotation for trace
- `GET /api/annotations/user/stats` - Get user stats

**Authentication:**
- Axios request interceptor injects Clerk token
- Token retrieved from `window.Clerk.session.getToken()`
- Bearer token in Authorization header

### 1.6 File Structure

```
frontend/
├── src/
│   ├── App.vue                    # Root component
│   ├── main.ts                    # Entry point
│   ├── router/
│   │   └── index.ts               # Vue Router config
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── AnnotationForm.vue
│   │   ├── CsvImporter.vue
│   │   ├── TraceList.vue
│   │   ├── TraceViewer.vue
│   │   └── [demo components]     # To be removed
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── TracesView.vue
│   │   ├── TraceDetailView.vue
│   │   └── ImportView.vue
│   ├── services/
│   │   └── api.ts                 # Axios API service
│   ├── stores/                    # [Empty - no Pinia stores]
│   └── assets/
│       └── main.css
├── src-vue-backup/                # Full Vue backup
├── package.json
├── vite.config.ts
└── index.html
```

---

## 2. Target State Architecture

### 2.1 React + SDS Technology Stack

**Core Framework:**
- React 18.x
- TypeScript 5.x
- Vite 5.x (maintained from Vue setup)

**Design System:**
- `@sendle/sds-ui` (Sendle Design System)
- SDS React components
- SDS SCSS utilities
- SDS design tokens

**Routing:**
- React Router v6

**State Management:**
- React hooks (useState, useEffect, useReducer)
- Context API for shared state (if needed)
- Zustand (optional, if global state complexity increases)

**Authentication:**
- `@clerk/clerk-react` (Clerk React SDK)

**HTTP Client:**
- Native `fetch` with custom wrapper OR
- SWR / React Query (recommended for caching/optimistic updates)

**Form Handling:**
- React Hook Form (optional, for complex validation)
- Controlled components with useState (for simple forms)

**Testing:**
- Vitest (unit/component tests)
- Playwright (E2E tests)
- React Testing Library

### 2.2 Target File Structure

```
frontend/
├── src/
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Root component with SDS providers
│   ├── routes/
│   │   └── index.tsx              # React Router configuration
│   ├── components/
│   │   ├── AppHeader/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppHeader.scss     # SDS tokens
│   │   │   └── index.ts
│   │   ├── TraceViewer/
│   │   │   ├── TraceViewer.tsx
│   │   │   ├── ToolCallCard.tsx   # Subcomponent
│   │   │   ├── SessionContext.tsx # Subcomponent
│   │   │   ├── TraceViewer.scss
│   │   │   └── index.ts
│   │   ├── QuickActions/
│   │   │   ├── QuickActions.tsx
│   │   │   ├── FailureForm.tsx
│   │   │   ├── QuickActions.scss
│   │   │   └── index.ts
│   │   ├── TraceList/
│   │   │   ├── TraceList.tsx
│   │   │   ├── TraceList.scss
│   │   │   └── index.ts
│   │   ├── CsvImporter/
│   │   │   ├── CsvImporter.tsx
│   │   │   ├── CsvImporter.scss
│   │   │   └── index.ts
│   │   └── common/                # Shared components
│   │       ├── ProgressTracker/
│   │       └── LoadingSpinner/
│   ├── views/
│   │   ├── Dashboard.tsx          # HomeView → Dashboard
│   │   ├── TracesView.tsx
│   │   ├── TraceDetailView.tsx
│   │   └── ImportView.tsx
│   ├── services/
│   │   └── api.ts                 # Fetch-based API service
│   ├── hooks/
│   │   ├── useAuth.ts             # Clerk auth hook
│   │   ├── useTraces.ts           # Traces data fetching
│   │   └── useAnnotations.ts      # Annotations data fetching
│   ├── context/
│   │   └── AuthContext.tsx        # Clerk auth context (if needed)
│   ├── types/
│   │   ├── trace.ts
│   │   ├── annotation.ts
│   │   └── api.ts
│   ├── styles/
│   │   ├── globals.scss           # Global styles + SDS import
│   │   └── variables.scss         # SDS token overrides (if needed)
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
├── package.json
├── vite.config.ts                 # React plugin instead of Vue
├── tsconfig.json
└── index.html
```

---

## 3. Component Migration Mapping

### 3.1 TraceViewer.vue → TraceViewer.tsx

**Complexity:** High
**Priority:** 1 (core functionality)

**Vue Component Analysis:**
- Displays trace with metadata (NDescriptions)
- Timeline for conversation history (NTimeline)
- Current turn display
- Previous/Next navigation
- Integrates AnnotationForm
- Responsive design with breakpoints

**React + SDS Implementation:**

```tsx
// src/components/TraceViewer/TraceViewer.tsx
import React, { useState, useEffect } from 'react';
import { Button, Divider } from '@sendle/sds-ui';
import SessionContext from './SessionContext';
import ToolCallCard from './ToolCallCard';
import QuickActions from '../QuickActions';
import './TraceViewer.scss';

interface TraceViewerProps {
  traceId: string;
}

export const TraceViewer: React.FC<TraceViewerProps> = ({ traceId }) => {
  const [trace, setTrace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjacentTraces, setAdjacentTraces] = useState({ prev: null, next: null });

  useEffect(() => {
    loadTrace(traceId);
    loadAdjacentTraces(traceId);
  }, [traceId]);

  // ... API calls using fetch or SWR

  if (loading) return <LoadingSpinner />;
  if (!trace) return <EmptyState message="Trace not found" />;

  return (
    <div className="trace-viewer">
      {/* Header with navigation */}
      <div className="trace-header">
        <Button
          variant="secondary"
          onClick={() => navigateTo(adjacentTraces.prev)}
          disabled={!adjacentTraces.prev}
        >
          ← Previous
        </Button>
        <h2>Turn {trace.turnNumber} of {trace.totalTurns}</h2>
        <Button
          variant="secondary"
          onClick={() => navigateTo(adjacentTraces.next)}
          disabled={!adjacentTraces.next}
        >
          Next →
        </Button>
      </div>

      <Divider />

      {/* Session context for multi-turn conversations */}
      {trace.previousTurns?.length > 0 && (
        <SessionContext previousTurns={trace.previousTurns} />
      )}

      {/* Current turn */}
      <div className="current-turn">
        <div className="user-input">
          <h3>👤 User Input</h3>
          <p>{trace.userMessage}</p>
        </div>

        {/* Tool calls */}
        {trace.toolCalls?.map(tool => (
          <ToolCallCard key={tool.id} tool={tool} />
        ))}

        <div className="ai-response">
          <h3>🤖 AI Response</h3>
          <p>{trace.aiResponse}</p>
        </div>
      </div>

      <Divider />

      {/* Annotation form */}
      <QuickActions
        traceId={traceId}
        existingAnnotation={trace.annotation}
        onSaveSuccess={() => handleAnnotationSaved()}
      />
    </div>
  );
};
```

**Migration Checklist:**
- [ ] Replace NCard with custom div + SDS styling
- [ ] Replace NSpin with custom LoadingSpinner using SDS
- [ ] Replace NEmpty with custom EmptyState using SDS
- [ ] Replace NDescriptions with custom metadata display
- [ ] Replace NTimeline with custom SessionContext component
- [ ] Replace NButton with SDS Button
- [ ] Convert Vue props to React props (TypeScript interfaces)
- [ ] Convert Vue emits to React callbacks
- [ ] Replace Vue refs with React useState
- [ ] Replace Vue computed with useMemo
- [ ] Replace Vue watch with useEffect
- [ ] Migrate responsive breakpoints from @vueuse/core to custom hook or CSS

**Naive UI → SDS Mapping:**
- `NCard` → Custom `<div className="card">` with SDS tokens
- `NSpin` → Custom `<LoadingSpinner>` component
- `NEmpty` → Custom `<EmptyState>` component
- `NDescriptions` → Custom metadata display (div + SDS typography)
- `NTimeline` → Custom `<SessionContext>` component
- `NButton` → SDS `<Button>` (direct mapping)
- `NDivider` → SDS `<Divider>` (direct mapping)

---

### 3.2 AnnotationForm.vue → QuickActions.tsx + FailureForm.tsx

**Complexity:** High
**Priority:** 1 (core functionality)

**Vue Component Analysis:**
- Quick action buttons (Pass & Next, Skip, Mark as Fail)
- Collapsible pass comment section
- Conditional fail form with validation
- Form fields: open_codes, first_failure_note, comments_hypotheses
- Uses NForm validation

**React + SDS Implementation:**

Split into two components for better separation of concerns:

**QuickActions.tsx:**
```tsx
// src/components/QuickActions/QuickActions.tsx
import React, { useState } from 'react';
import { Button, Alert } from '@sendle/sds-ui';
import FailureForm from './FailureForm';
import './QuickActions.scss';

interface QuickActionsProps {
  traceId: string;
  existingAnnotation?: Annotation;
  onSaveSuccess: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  traceId,
  existingAnnotation,
  onSaveSuccess
}) => {
  const [showFailForm, setShowFailForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePassAndNext = async () => {
    setSaving(true);
    try {
      await saveAnnotation({ trace_id: traceId, holistic_pass_fail: 'Pass' });
      onSaveSuccess();
      // Navigate to next unannotated trace
    } catch (error) {
      // Show error alert
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Navigate to next trace without saving
  };

  const handleMarkAsFail = () => {
    setShowFailForm(!showFailForm);
  };

  return (
    <div className="quick-actions">
      <div className="button-group">
        <Button
          variant="primary"
          onClick={handlePassAndNext}
          disabled={saving || showFailForm}
        >
          Pass & Next
        </Button>

        <Button
          variant="secondary"
          onClick={handleSkip}
          disabled={saving || showFailForm}
        >
          Skip
        </Button>

        <Button
          variant="destructive"
          onClick={handleMarkAsFail}
          disabled={saving}
        >
          Mark as Fail
        </Button>
      </div>

      {showFailForm && (
        <FailureForm
          traceId={traceId}
          onSave={onSaveSuccess}
          onCancel={() => setShowFailForm(false)}
        />
      )}
    </div>
  );
};
```

**FailureForm.tsx:**
```tsx
// src/components/QuickActions/FailureForm.tsx
import React, { useState } from 'react';
import { Input, TextArea, Button, Alert } from '@sendle/sds-ui';
import './FailureForm.scss';

interface FailureFormProps {
  traceId: string;
  onSave: () => void;
  onCancel: () => void;
}

export const FailureForm: React.FC<FailureFormProps> = ({
  traceId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    first_failure_note: '',
    open_codes: '',
    comments_hypotheses: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_failure_note.trim()) {
      newErrors.first_failure_note = 'First failure note is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await saveAnnotation({
        trace_id: traceId,
        holistic_pass_fail: 'Fail',
        ...formData
      });
      onSave();
    } catch (error) {
      // Show error
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="failure-form" onSubmit={handleSubmit}>
      <Alert type="error">
        Marking trace as failed. Please provide details below.
      </Alert>

      <div className="form-field">
        <label htmlFor="first_failure_note">
          First Failure Note <span className="required">*</span>
        </label>
        <TextArea
          id="first_failure_note"
          value={formData.first_failure_note}
          onChange={(e) => setFormData({...formData, first_failure_note: e.target.value})}
          placeholder="Describe what went wrong..."
          rows={3}
          aria-required="true"
          aria-invalid={!!errors.first_failure_note}
        />
        {errors.first_failure_note && (
          <span className="error-text">{errors.first_failure_note}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="open_codes">Open Codes (comma-separated)</label>
        <Input
          id="open_codes"
          value={formData.open_codes}
          onChange={(e) => setFormData({...formData, open_codes: e.target.value})}
          placeholder="e.g., tool_failure, incorrect_response"
        />
      </div>

      <div className="form-field">
        <label htmlFor="comments">Comments / Hypotheses</label>
        <TextArea
          id="comments"
          value={formData.comments_hypotheses}
          onChange={(e) => setFormData({...formData, comments_hypotheses: e.target.value})}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save & Next'}
        </Button>
      </div>
    </form>
  );
};
```

**Migration Checklist:**
- [ ] Split AnnotationForm into QuickActions + FailureForm
- [ ] Replace NForm with native form element
- [ ] Replace NFormItem with custom div + label
- [ ] Replace NInput with SDS Input
- [ ] Replace NTextArea with SDS TextArea
- [ ] Replace NButton with SDS Button
- [ ] Replace NCollapse with conditional rendering
- [ ] Replace NAlert with SDS Alert
- [ ] Replace useMessage with SDS Toast/Notification
- [ ] Convert Vue form validation to React validation
- [ ] Convert Vue v-model to React controlled components
- [ ] Replace Vue emits with React callbacks

**Naive UI → SDS Mapping:**
- `NForm` → Native `<form>` element
- `NFormItem` → Custom `<div className="form-field">` with label
- `NInput` → SDS `<Input>`
- `NTextArea` → SDS `<TextArea>`
- `NButton` → SDS `<Button>`
- `NCollapse` → Conditional rendering (`{showForm && <FailureForm />}`)
- `NAlert` → SDS `<Alert>`
- `useMessage()` → SDS Toast system (or custom implementation)

---

### 3.3 TraceList.vue → TraceList.tsx

**Complexity:** Medium
**Priority:** 2

**Vue Component Analysis:**
- NDataTable with remote pagination
- Status column with visual indicators (✓/✗/○)
- Row highlighting based on annotation status
- Columns: Status, Trace ID, Session, Turn, User Message, AI Response, Actions
- Exposed refresh method

**React + SDS Implementation:**

```tsx
// src/components/TraceList/TraceList.tsx
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Table, Button, Badge } from '@sendle/sds-ui';
import { useNavigate } from 'react-router-dom';
import './TraceList.scss';

interface TraceListProps {
  // Props
}

export const TraceList = forwardRef<{ refresh: () => void }, TraceListProps>((props, ref) => {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const navigate = useNavigate();

  const loadTraces = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const data = await getTraces(page, pageSize);
      setTraces(data.traces);
      setPagination(prev => ({ ...prev, total: data.total }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraces(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize]);

  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refresh: () => loadTraces(pagination.page, pagination.pageSize)
  }));

  const columns = [
    {
      key: 'status',
      title: 'Status',
      render: (row) => {
        if (row.annotation?.holistic_pass_fail === 'Pass') {
          return <Badge variant="success">✓ Pass</Badge>;
        } else if (row.annotation?.holistic_pass_fail === 'Fail') {
          return <Badge variant="error">✗ Fail</Badge>;
        }
        return <Badge variant="neutral">○ Unannotated</Badge>;
      }
    },
    { key: 'trace_id', title: 'Trace ID' },
    { key: 'flow_session', title: 'Session' },
    { key: 'turn_number', title: 'Turn' },
    { key: 'user_message', title: 'User Message', truncate: true },
    { key: 'ai_response', title: 'AI Response', truncate: true },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate(`/trace/${row.trace_id}`)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="trace-list">
      <Table
        columns={columns}
        data={traces}
        loading={loading}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
          onPageSizeChange: (pageSize) => setPagination(prev => ({ ...prev, pageSize, page: 1 }))
        }}
        rowClassName={(row) => {
          if (row.annotation?.holistic_pass_fail === 'Pass') return 'row-pass';
          if (row.annotation?.holistic_pass_fail === 'Fail') return 'row-fail';
          return '';
        }}
      />
    </div>
  );
});
```

**Migration Checklist:**
- [ ] Replace NDataTable with SDS Table
- [ ] Replace NTag with SDS Badge
- [ ] Replace NButton with SDS Button
- [ ] Convert Vue ref expose to React forwardRef + useImperativeHandle
- [ ] Convert Vue computed columns to React column configuration
- [ ] Convert Vue row class method to React rowClassName prop
- [ ] Migrate pagination logic from Vue to React state
- [ ] Replace useMessage with SDS Toast

**Naive UI → SDS Mapping:**
- `NDataTable` → SDS `<Table>` (verify SDS has Table component, else use custom with SDS styling)
- `NTag` → SDS `<Badge>`
- `NButton` → SDS `<Button>`

**Note:** If SDS doesn't have a full-featured Table component, create custom table using SDS design tokens.

---

### 3.4 AppHeader.vue → AppHeader.tsx

**Complexity:** Medium
**Priority:** 3

**Vue Component Analysis:**
- NLayoutHeader wrapper
- Responsive menu (horizontal on desktop, collapsed on mobile)
- Clerk auth integration (SignedIn, SignedOut, UserButton)
- User stats display (annotation count)
- Uses @vueuse/core for breakpoints

**React + SDS Implementation:**

```tsx
// src/components/AppHeader/AppHeader.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@sendle/sds-ui';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserStats } from '../../hooks/useUserStats';
import './AppHeader.scss';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const { isLoaded, userId } = useAuth();
  const { stats } = useUserStats(userId);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>Open Coding Web App</h1>

        <nav className={isMobile ? 'mobile-menu' : 'desktop-menu'}>
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          <Link
            to="/traces"
            className={location.pathname === '/traces' ? 'active' : ''}
          >
            Traces
          </Link>
          <Link
            to="/import"
            className={location.pathname === '/import' ? 'active' : ''}
          >
            Import CSV
          </Link>
        </nav>

        <div className="user-section">
          <SignedIn>
            {stats && (
              <span className="user-stats">
                Annotated: {stats.total_annotations}
              </span>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <Button variant="primary" onClick={() => window.location.href = '/sign-in'}>
              Sign In
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};
```

**Migration Checklist:**
- [ ] Replace NLayoutHeader with semantic `<header>` element
- [ ] Replace NMenu with custom nav using SDS styling
- [ ] Replace @vueuse/core breakpoints with window.matchMedia or custom hook
- [ ] Replace Clerk Vue components with Clerk React components
- [ ] Convert Vue router-link to React Router Link
- [ ] Convert Vue useRoute to React useLocation
- [ ] Migrate user stats fetching to custom hook

**Naive UI → SDS Mapping:**
- `NLayoutHeader` → Semantic `<header>` with SDS tokens
- `NMenu` → Custom `<nav>` with SDS Button/Link components
- `NButton` → SDS `<Button>`
- `NTag` → SDS `<Badge>`

---

### 3.5 CsvImporter.vue → CsvImporter.tsx

**Complexity:** Medium
**Priority:** 4

**Vue Component Analysis:**
- NUpload with drag-and-drop
- File validation (extension, size max 10MB)
- Custom SVG icon
- Progress feedback

**React + SDS Implementation:**

```tsx
// src/components/CsvImporter/CsvImporter.tsx
import React, { useState } from 'react';
import { Button, Alert, FileUpload } from '@sendle/sds-ui';
import './CsvImporter.scss';

interface CsvImporterProps {
  onImportComplete: () => void;
}

export const CsvImporter: React.FC<CsvImporterProps> = ({ onImportComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are allowed');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setError(null);
    if (!validateFile(file)) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await importCSV(formData);
      onImportComplete();
      // Show success message
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="csv-importer">
      <h2>Import CSV File</h2>

      {error && <Alert type="error">{error}</Alert>}

      <FileUpload
        accept=".csv"
        maxSize={10 * 1024 * 1024}
        onChange={handleFileChange}
        disabled={uploading}
        dragDrop={true}
      >
        <div className="upload-area">
          <svg className="upload-icon" viewBox="0 0 24 24">
            {/* Upload icon SVG */}
          </svg>
          <p>Drag and drop CSV file here, or click to browse</p>
          <p className="helper-text">Maximum file size: 10MB</p>
        </div>
      </FileUpload>

      {uploading && <p>Uploading and processing CSV...</p>}
    </div>
  );
};
```

**Migration Checklist:**
- [ ] Replace NUpload with SDS FileUpload
- [ ] Replace NUploadDragger with FileUpload dragDrop prop
- [ ] Replace NButton with SDS Button
- [ ] Replace NAlert with SDS Alert
- [ ] Replace useMessage with SDS Toast
- [ ] Convert Vue file validation to React
- [ ] Convert Vue emits to React callbacks

**Naive UI → SDS Mapping:**
- `NUpload` + `NUploadDragger` → SDS `<FileUpload>` with dragDrop prop
- `NButton` → SDS `<Button>`
- `NAlert` → SDS `<Alert>`

---

### 3.6 View Components Migration

**Views are simple wrappers - straightforward migration:**

**HomeView.vue → Dashboard.tsx:**
```tsx
import React from 'react';
import { useUserStats } from '../hooks/useUserStats';
import ProgressTracker from '../components/ProgressTracker';

export const Dashboard: React.FC = () => {
  const { stats, loading } = useUserStats();

  return (
    <div className="dashboard">
      <h1>Evaluation Dashboard</h1>
      {loading ? <LoadingSpinner /> : <ProgressTracker stats={stats} />}
      {/* Display stats using SDS components */}
    </div>
  );
};
```

**TracesView, TraceDetailView, ImportView:** Similar pattern, just wrap the corresponding component.

---

## 4. Migration Phases

### Phase 0: React Scaffold Setup (Day 1 - 0.5 days)

**Goal:** Set up React + Vite + SDS foundation

**Tasks:**
1. Install React dependencies:
   ```bash
   yarn add react react-dom react-router-dom
   yarn add @clerk/clerk-react
   yarn add @sendle/sds-ui
   yarn add -D @types/react @types/react-dom
   yarn add -D @vitejs/plugin-react
   ```

2. Configure Vite for React:
   ```ts
   // vite.config.ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     // ... rest of config
   })
   ```

3. Create React entry point:
   ```tsx
   // src/main.tsx
   import React from 'react'
   import ReactDOM from 'react-dom/client'
   import { ClerkProvider } from '@clerk/clerk-react'
   import App from './App'
   import '@sendle/sds-ui/scss/sds.scss'
   import './styles/globals.scss'

   const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <ClerkProvider publishableKey={clerkPubKey}>
         <App />
       </ClerkProvider>
     </React.StrictMode>,
   )
   ```

4. Create App.tsx root component
5. Set up React Router
6. Verify SDS imports working

**Deliverable:** React app boots, SDS styles load, routing works

---

### Phase 1: API Service Migration (Day 1-2 - 0.5 days)

**Goal:** Migrate Axios API service to fetch with Clerk auth

**Tasks:**
1. Create new `/src/services/api.ts` with fetch-based implementation
2. Implement Clerk token injection wrapper
3. Migrate all API methods (traces, annotations, auth)
4. Create custom hooks for data fetching (`useTraces`, `useAnnotations`, `useAuth`)
5. Optional: Set up SWR or React Query for caching

**Deliverable:** API service works with Clerk auth, custom hooks functional

---

### Phase 2: Core Components Migration (Days 2-6 - 4 days)

**Priority Order:**

**Day 2-3: QuickActions + FailureForm**
- Highest complexity, core user flow
- Migrate AnnotationForm.vue → QuickActions.tsx + FailureForm.tsx
- Implement form validation
- Integrate SDS Button, Input, TextArea, Alert
- Test save functionality

**Day 3-4: TraceViewer**
- Complex component with subcomponents
- Create TraceViewer.tsx
- Create ToolCallCard.tsx subcomponent
- Create SessionContext.tsx subcomponent
- Integrate QuickActions
- Test navigation (prev/next)

**Day 5: TraceList**
- Migrate TraceList.vue → TraceList.tsx
- Implement SDS Table or custom table with SDS styling
- Test pagination, row highlighting
- Integrate with routing

**Day 6: AppHeader + CsvImporter**
- Lower complexity, independent components
- Migrate AppHeader.vue → AppHeader.tsx
- Migrate CsvImporter.vue → CsvImporter.tsx
- Test Clerk auth integration
- Test CSV upload

**Deliverable:** All core components functional in React + SDS

---

### Phase 3: Views and Routing (Day 7 - 1 day)

**Tasks:**
1. Migrate HomeView → Dashboard.tsx
2. Migrate TracesView, TraceDetailView, ImportView
3. Set up React Router routes (/, /traces, /trace/:id, /import)
4. Test navigation between views
5. Ensure layout consistency

**Deliverable:** All views working, routing functional

---

### Phase 4: Integration Testing (Days 8-9 - 2 days)

**Tasks:**
1. End-to-end flow testing:
   - Import CSV
   - View traces
   - Annotate with quick actions
   - Navigate between traces
   - Export data
2. Cross-browser testing (Chrome, Firefox, Safari)
3. Responsive testing (desktop, tablet)
4. Accessibility testing (keyboard nav, screen readers)
5. Fix bugs found during testing

**Deliverable:** Feature parity with Vue version confirmed

---

### Phase 5: Deployment and Cutover (Day 10 - 1 day)

**Tasks:**
1. Build React production bundle
2. Update deployment configuration
3. Deploy to staging environment
4. Smoke test production build
5. Cutover: Point domain to React app
6. Monitor for issues
7. Decommission Vue app (backup first)

**Deliverable:** React app live in production

---

## 5. State Management Strategy

### 5.1 Current State (Vue)

**No Pinia stores** - all state is component-local using Vue 3 Composition API:
- `ref()` for reactive primitives
- `reactive()` for reactive objects
- `computed()` for derived state
- Props drilling for parent-child communication
- Event emitters for child-parent communication

### 5.2 Target State (React)

**Recommendation:** Start simple, add complexity only when needed

**Component-Local State:**
- Use `useState` for simple state
- Use `useReducer` for complex component state

**Shared State (if needed):**
- **Context API** for auth state (Clerk already provides context)
- **Custom Context** for traces/annotations (if multiple components need same data)
- **Zustand** (optional) if global state management becomes complex

**Data Fetching State:**
- Use SWR or React Query for server state management
- Handles caching, refetching, optimistic updates automatically

### 5.3 Implementation Examples

**Component-Local State (useState):**
```tsx
const [showFailForm, setShowFailForm] = useState(false);
const [formData, setFormData] = useState({ first_failure_note: '' });
```

**Complex State (useReducer):**
```tsx
const [state, dispatch] = useReducer(tracesReducer, initialState);

function tracesReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: true };
    case 'SET_TRACES': return { ...state, traces: action.payload, loading: false };
    default: return state;
  }
}
```

**Context API (for shared auth state):**
```tsx
// Clerk already provides <ClerkProvider> context
import { useAuth, useUser } from '@clerk/clerk-react';

function MyComponent() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  // ...
}
```

**Custom Hook for API Data:**
```tsx
// src/hooks/useTraces.ts
import useSWR from 'swr';

export function useTraces(page: number, pageSize: number) {
  const { data, error, mutate } = useSWR(
    `/api/traces?page=${page}&pageSize=${pageSize}`,
    fetcher
  );

  return {
    traces: data?.traces || [],
    total: data?.total || 0,
    loading: !error && !data,
    error,
    refresh: mutate
  };
}
```

**Recommendation:** Start with component-local state + custom hooks for API data. Only introduce Context/Zustand if you find yourself prop-drilling excessively or need to share state across distant components.

---

## 6. API Integration Migration

### 6.1 Current Implementation (Vue + Axios)

**File:** `/src/services/api.ts`

**Axios Instance with Clerk Interceptor:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
});

api.interceptors.request.use(async (config) => {
  const token = await window.Clerk.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 6.2 Target Implementation (React + Fetch)

**Option A: Custom Fetch Wrapper (Simple)**

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function getAuthToken(): Promise<string | null> {
  return window.Clerk?.session?.getToken() || null;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// API methods
export const api = {
  auth: {
    getCurrentUser: () => fetchWithAuth('/api/auth/me'),
  },
  traces: {
    importCSV: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchWithAuth('/api/traces/import-csv', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
    getTraces: (page: number, pageSize: number) =>
      fetchWithAuth(`/api/traces?page=${page}&pageSize=${pageSize}`),
    getTrace: (traceId: string) => fetchWithAuth(`/api/traces/${traceId}`),
    getAdjacentTraces: (traceId: string) =>
      fetchWithAuth(`/api/traces/${traceId}/adjacent`),
    getNextUnannotated: () => fetchWithAuth('/api/traces/next/unannotated'),
  },
  annotations: {
    save: (annotation: Annotation) =>
      fetchWithAuth('/api/annotations', {
        method: 'POST',
        body: JSON.stringify(annotation),
      }),
    getForTrace: (traceId: string) =>
      fetchWithAuth(`/api/annotations/trace/${traceId}`),
    getUserStats: () => fetchWithAuth('/api/annotations/user/stats'),
  },
};
```

**Option B: SWR (Recommended for Production)**

```typescript
// src/hooks/useTraces.ts
import useSWR from 'swr';
import { api } from '../services/api';

export function useTraces(page: number, pageSize: number) {
  const { data, error, mutate } = useSWR(
    ['traces', page, pageSize],
    () => api.traces.getTraces(page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    traces: data?.traces || [],
    total: data?.total || 0,
    loading: !error && !data,
    error,
    refresh: mutate,
  };
}

export function useTrace(traceId: string) {
  const { data, error, mutate } = useSWR(
    traceId ? ['trace', traceId] : null,
    () => api.traces.getTrace(traceId)
  );

  return {
    trace: data,
    loading: !error && !data,
    error,
    refresh: mutate,
  };
}
```

**Usage in Components:**
```tsx
import { useTraces } from '../hooks/useTraces';

function TraceList() {
  const { traces, total, loading, error, refresh } = useTraces(1, 20);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <Table data={traces} total={total} onRefresh={refresh} />;
}
```

**Recommendation:** Use Option B (SWR) for production. It provides caching, auto-refetching, optimistic updates, and better UX out of the box.

---

## 7. Testing Strategy

### 7.1 Feature Parity Checklist

**Critical User Flows:**

- [ ] **Import CSV**
  - [ ] Drag-and-drop file upload works
  - [ ] File validation (extension, size) works
  - [ ] Import progress feedback shown
  - [ ] Success/error messages displayed
  - [ ] Traces populated in database

- [ ] **View Traces**
  - [ ] Trace list loads with pagination
  - [ ] Status indicators correct (Pass/Fail/Unannotated)
  - [ ] Row highlighting works
  - [ ] Pagination controls functional
  - [ ] "View" button navigates to trace detail

- [ ] **Annotate Trace**
  - [ ] Trace detail view loads correctly
  - [ ] User input, tool calls, AI response displayed
  - [ ] Session context shown for multi-turn conversations
  - [ ] "Pass & Next" saves annotation and advances
  - [ ] "Skip" moves to next trace without saving
  - [ ] "Mark as Fail" shows inline form
  - [ ] Fail form validation works (required fields)
  - [ ] Fail form saves and advances
  - [ ] Previous/Next navigation works

- [ ] **Progress Tracking**
  - [ ] User stats displayed in header
  - [ ] Dashboard shows progress metrics
  - [ ] Annotation counts accurate

- [ ] **Authentication**
  - [ ] Clerk sign-in flow works
  - [ ] User button shows user info
  - [ ] Sign-out works
  - [ ] Auth token injected in API calls
  - [ ] Unauthorized requests redirected to sign-in

### 7.2 Component Testing

**Unit Tests (Vitest + React Testing Library):**

```tsx
// Example: QuickActions.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActions } from './QuickActions';

describe('QuickActions', () => {
  it('renders all three action buttons', () => {
    render(<QuickActions traceId="123" onSaveSuccess={jest.fn()} />);
    expect(screen.getByText('Pass & Next')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.getByText('Mark as Fail')).toBeInTheDocument();
  });

  it('shows failure form when "Mark as Fail" clicked', () => {
    render(<QuickActions traceId="123" onSaveSuccess={jest.fn()} />);
    fireEvent.click(screen.getByText('Mark as Fail'));
    expect(screen.getByLabelText(/First Failure Note/i)).toBeInTheDocument();
  });

  // ... more tests
});
```

**Priority Components for Unit Testing:**
- QuickActions + FailureForm (complex logic)
- TraceViewer (complex rendering)
- TraceList (table rendering, pagination)
- CsvImporter (file validation)

### 7.3 E2E Testing (Playwright)

**Migrate existing Playwright tests from Vue to React:**

```typescript
// tests/e2e/annotation-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete annotation flow', async ({ page }) => {
  // Sign in
  await page.goto('/sign-in');
  await page.fill('[name="identifier"]', 'test@example.com');
  // ... complete sign-in

  // Import CSV
  await page.goto('/import');
  await page.setInputFiles('input[type="file"]', 'test-data/traces.csv');
  await expect(page.locator('text=Import successful')).toBeVisible();

  // Navigate to traces
  await page.goto('/traces');
  await page.click('text=View >> first');

  // Annotate with "Pass & Next"
  await page.click('text=Pass & Next');
  await expect(page.locator('text=Annotation saved')).toBeVisible();

  // Verify navigation to next trace
  await expect(page.url()).toContain('/trace/');

  // Annotate with "Mark as Fail"
  await page.click('text=Mark as Fail');
  await page.fill('[name="first_failure_note"]', 'Tool failed to return results');
  await page.click('text=Save & Next');
  await expect(page.locator('text=Annotation saved')).toBeVisible();
});
```

**Test Coverage:**
- [ ] Sign-in flow
- [ ] Import CSV flow
- [ ] View traces and navigate
- [ ] Annotate with Pass & Next
- [ ] Annotate with Mark as Fail
- [ ] Skip trace
- [ ] Manual navigation (Prev/Next)
- [ ] View dashboard stats
- [ ] Sign-out flow

### 7.4 Manual Testing Plan

**Cross-Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Responsive Testing:**
- [ ] Desktop (1920x1080, 1440x900)
- [ ] Tablet (1024x768, 768x1024)
- [ ] Mobile (deferred to Phase 2, but verify no critical breaks)

**Accessibility Testing:**
- [ ] Keyboard navigation (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader (VoiceOver on macOS, NVDA on Windows)
- [ ] Color contrast (Lighthouse audit, axe DevTools)
- [ ] Focus indicators visible
- [ ] ARIA labels present

**Performance Testing:**
- [ ] Large CSV import (100+ traces)
- [ ] Trace list pagination with 100+ traces
- [ ] Page load times < 2 seconds
- [ ] No memory leaks on prolonged usage

---

## 8. Rollout Plan

### 8.1 Deployment Strategy

**Option A: Parallel Deployment (Recommended)**

1. **Phase 1: Deploy React to Staging**
   - Deploy React app to staging environment (`staging.evals-app.com`)
   - Run full test suite on staging
   - Invite team members to test and provide feedback

2. **Phase 2: Feature Flag (Optional)**
   - If production deployment needs to be gradual:
     - Deploy React app to production under new path (`/react`)
     - Use feature flag or URL parameter to toggle between Vue and React
     - Allow select users to opt-in to React version

3. **Phase 3: Full Cutover**
   - After validation, switch primary deployment to React
   - Keep Vue version as backup for 1-2 weeks
   - Monitor error logs and user feedback
   - Decommission Vue app after confidence period

**Option B: Direct Cutover (Faster)**

1. Deploy React app to production
2. Monitor closely for first 24-48 hours
3. Have Vue backup ready for rollback if critical issues found

**Recommended Approach:** Option A (Parallel Deployment) for safer migration.

### 8.2 Rollback Plan

**If critical issues found post-deployment:**

1. **Immediate Rollback:**
   - Revert deployment to previous Vue version (backup in `src-vue-backup/`)
   - Notify team of rollback
   - Document issues found

2. **Fix and Re-deploy:**
   - Fix issues in React version on staging
   - Re-test thoroughly
   - Re-deploy when issues resolved

3. **Backup Strategy:**
   - Keep Vue codebase in `src-vue-backup/` for at least 1 month post-cutover
   - Tag Vue version in git: `git tag vue-final-version`
   - Document rollback procedure in README

### 8.3 Monitoring Plan

**Post-Deployment Monitoring:**

- [ ] Error tracking (Sentry or similar)
- [ ] API error rate monitoring
- [ ] Page load performance (Lighthouse CI)
- [ ] User feedback collection
- [ ] Browser error logs (check for runtime errors)

**Success Metrics:**

- [ ] Zero critical bugs in first 48 hours
- [ ] Page load times < 2 seconds (same as Vue)
- [ ] No auth-related issues
- [ ] All core flows functional (import, annotate, export)
- [ ] Positive user feedback

### 8.4 Communication Plan

**Stakeholders to Notify:**

- [ ] Product team (before deployment)
- [ ] QA team (for testing)
- [ ] End users (if applicable - release notes)
- [ ] Support team (if applicable - what changed)

**Release Notes Template:**

```
# Evals App v2.0 - React + SDS Migration

**Release Date:** [Date]

## What Changed

We've migrated the Evals App frontend from Vue to React with the Sendle Design System (SDS) to ensure long-term maintainability and consistency with Sendle's core products.

## What Stayed the Same

- All features work exactly the same
- CSV import/export functionality unchanged
- Annotation workflow identical
- Authentication via Clerk unchanged

## What's Better

- Faster page loads (React + SDS optimizations)
- Improved accessibility (WCAG 2.1 AA compliant)
- Consistent design with Sendle products
- Better long-term maintainability

## Known Issues

[None expected, but list any minor issues here]

## Support

If you encounter any issues, please contact [support email/channel]
```

---

## 9. Risks & Mitigation

### 9.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **SDS Component Gaps** - SDS may not have all needed components (e.g., DataTable, Timeline) | Medium | Medium | Identify gaps early in Phase 0. Build custom components using SDS tokens for missing pieces. Document in UX spec. |
| **Auth Integration Complexity** - Clerk React integration behaves differently than Vue | Low | High | Test Clerk auth integration thoroughly in Phase 1. Reference Clerk React docs. Have Clerk support contact ready. |
| **State Management Complexity** - React hooks may not handle complex state as easily as Vue | Low | Medium | Start simple (useState). Only add complexity (Context, Zustand) if needed. Review Vue state patterns before migrating. |
| **Performance Regression** - React app slower than Vue | Low | Medium | Profile both Vue and React apps. Optimize React rendering (useMemo, useCallback). Lazy load routes. |
| **Browser Compatibility** - SDS components don't work in older browsers | Low | Low | Test in target browsers early. SDS likely supports modern browsers (same as Vue app). |

### 9.2 Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Underestimated Complexity** - Components take longer than estimated | Medium | Medium | Add 20% buffer to estimates. Prioritize core components. Phase 5 can slip if needed. |
| **Team Unfamiliarity with React** - Engineer hasn't used React recently | Low | Low | Provide React + SDS onboarding. Pair programming for complex components. Reference React docs liberally. |
| **Testing Takes Longer** - Feature parity testing uncovers many issues | Medium | Medium | Start testing early (Phase 2). Fix bugs as they're found. Don't defer to Phase 4. |

### 9.3 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **User Confusion** - UI looks/behaves different | Low | Low | SDS is similar to Naive UI. UX spec documents consistent patterns. Provide release notes. |
| **Critical Bug Post-Deployment** - Production issue after cutover | Low | High | Have rollback plan ready. Monitor closely for 48 hours. Keep Vue backup for 1 month. |
| **Delayed Deployment Blocks Other Work** - Migration takes too long | Low | Medium | Scope is clear. Phases are independent. Can deploy partial migration if needed. |

### 9.4 Mitigation Summary

**Pre-Migration:**
- [ ] Review SDS component library thoroughly
- [ ] Identify component gaps early
- [ ] Set up React + SDS starter project to validate approach
- [ ] Get team buy-in on migration plan

**During Migration:**
- [ ] Test components individually as they're built
- [ ] Don't defer bug fixes to later phases
- [ ] Pair program on complex components
- [ ] Keep Vue app running in parallel (don't break it)

**Post-Migration:**
- [ ] Monitor error logs closely
- [ ] Have rollback plan ready
- [ ] Collect user feedback
- [ ] Keep Vue backup for safety

---

## 10. Appendices

### 10.1 Naive UI → SDS Component Reference

| Naive UI Component | SDS Equivalent | Notes |
|--------------------|----------------|-------|
| `<NButton>` | `<Button>` | Direct mapping. SDS has variants: primary, secondary, destructive |
| `<NInput>` | `<Input>` | Direct mapping |
| `<NTextArea>` | `<TextArea>` | Direct mapping |
| `<NSelect>` | `<Select>` | Direct mapping |
| `<NCheckbox>` | `<Checkbox>` | Direct mapping |
| `<NRadio>` / `<NRadioGroup>` | `<Radio>` / `<RadioGroup>` | Direct mapping |
| `<NAlert>` | `<Alert>` | Direct mapping. SDS has types: success, error, warning, info |
| `<NCard>` | Custom `<div>` with SDS tokens | No direct SDS Card. Use divs + SDS spacing/borders |
| `<NDataTable>` | `<Table>` or Custom | Check if SDS has Table. Else build custom with SDS styling |
| `<NTag>` | `<Badge>` | SDS Badge replaces Tag. Similar visual treatment |
| `<NUpload>` / `<NUploadDragger>` | `<FileUpload>` | SDS FileUpload should support drag-drop |
| `<NForm>` / `<NFormItem>` | Native `<form>` + custom layout | No SDS Form wrapper. Use semantic HTML + SDS inputs |
| `<NDivider>` | `<Divider>` | Direct mapping |
| `<NSpace>` | Custom `<div>` with SDS spacing | Use SDS spacing tokens (margin/padding) |
| `<NGrid>` / `<NGridItem>` | CSS Grid or Flexbox | Use CSS layout with SDS breakpoints |
| `<NLayout>` / `<NLayoutHeader>` | Semantic HTML (`<div>`, `<header>`) | No SDS layout components. Use semantic HTML |
| `<NMenu>` | Custom `<nav>` + SDS Buttons/Links | Build custom navigation with SDS components |
| `<NCollapse>` / `<NCollapseItem>` | Custom collapsible or SDS Accordion | Check if SDS has Accordion. Else build custom |
| `<NDescriptions>` / `<NDescriptionsItem>` | Custom layout | No direct equivalent. Use divs + SDS typography |
| `<NTimeline>` / `<NTimelineItem>` | Custom component | No direct equivalent. Build SessionContext component |
| `<NSpin>` | Custom LoadingSpinner | Build simple spinner with SDS colors |
| `<NEmpty>` | Custom EmptyState | Build with SDS typography + icons |
| `useMessage()` | SDS Toast/Notification | Check SDS for toast system. Else build custom |

**Note:** If SDS lacks a component, build custom using SDS design tokens for visual consistency.

---

### 10.2 Vue Composition API → React Hooks Cheatsheet

| Vue Composition API | React Hooks | Example |
|---------------------|-------------|---------|
| `ref(value)` | `useState(value)` | `const [count, setCount] = useState(0)` |
| `reactive(obj)` | `useState(obj)` | `const [user, setUser] = useState({ name: '' })` |
| `computed(() => ...)` | `useMemo(() => ..., [deps])` | `const fullName = useMemo(() => first + last, [first, last])` |
| `watch(source, cb)` | `useEffect(() => { ... }, [deps])` | `useEffect(() => { fetchData() }, [userId])` |
| `onMounted(cb)` | `useEffect(() => { cb() }, [])` | `useEffect(() => { init() }, [])` |
| `onUnmounted(cb)` | `useEffect(() => { return cb }, [])` | `useEffect(() => { return () => cleanup() }, [])` |
| `provide(key, value)` | `<Context.Provider value={...}>` | `<AuthContext.Provider value={auth}>` |
| `inject(key)` | `useContext(Context)` | `const auth = useContext(AuthContext)` |
| `defineProps` | `interface Props { ... }` | `interface Props { name: string }` |
| `defineEmits` | Callback props | `onSave: () => void` |
| `expose()` | `forwardRef` + `useImperativeHandle` | `useImperativeHandle(ref, () => ({ refresh }))` |

**Key Differences:**
- Vue `ref()` auto-unwraps in templates. React `useState` requires explicit state variable.
- Vue `computed()` caches until dependencies change. React `useMemo()` does the same.
- Vue `watch()` is declarative. React `useEffect()` is imperative (runs every render unless deps specified).
- Vue emits are strongly typed. React callbacks are just function props.

---

### 10.3 File Structure Comparison

**Vue (Current):**
```
src/
├── App.vue
├── main.ts
├── components/
│   └── ComponentName.vue
├── views/
│   └── ViewName.vue
├── router/index.ts
├── stores/
└── services/api.ts
```

**React (Target):**
```
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.scss
│   │   └── index.ts
│   └── ...
├── views/
│   └── ViewName.tsx
├── routes/index.tsx
├── hooks/
│   └── useHookName.ts
├── context/
│   └── ContextName.tsx
└── services/api.ts
```

**Key Changes:**
- Components moved to folders (one folder per component)
- Styles colocated with components (.scss files)
- `router/` → `routes/`
- No `stores/` (using hooks + context instead)
- Added `hooks/` for custom hooks
- Added `context/` for React Context providers

---

### 10.4 Code Transformation Examples

**Example 1: Component-Local State**

**Vue:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value++;
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
```

**React:**
```tsx
import React, { useState } from 'react';

export const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);

  return <button onClick={increment}>Count: {count}</button>;
};
```

---

**Example 2: Props and Emits**

**Vue:**
```vue
<script setup lang="ts">
defineProps<{ name: string }>();
const emit = defineEmits<{ (e: 'save'): void }>();

const handleSave = () => emit('save');
</script>

<template>
  <button @click="handleSave">Save {{ name }}</button>
</template>
```

**React:**
```tsx
import React from 'react';

interface Props {
  name: string;
  onSave: () => void;
}

export const SaveButton: React.FC<Props> = ({ name, onSave }) => {
  return <button onClick={onSave}>Save {name}</button>;
};
```

---

**Example 3: Computed Values**

**Vue:**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const firstName = ref('John');
const lastName = ref('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);
</script>
```

**React:**
```tsx
import React, { useState, useMemo } from 'react';

export const NameDisplay: React.FC = () => {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);

  return <div>{fullName}</div>;
};
```

---

**Example 4: Side Effects (Data Fetching)**

**Vue:**
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const data = ref(null);

onMounted(async () => {
  data.value = await fetchData();
});
</script>
```

**React:**
```tsx
import React, { useState, useEffect } from 'react';

export const DataDisplay: React.FC = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []); // Empty deps = run once on mount

  return <div>{data}</div>;
};
```

---

### 10.5 SDS Setup Reference

**Installation:**
```bash
yarn add @sendle/sds-ui
```

**Import SCSS:**
```scss
// src/styles/globals.scss
@import '~@sendle/sds-ui/scss/sds.scss';
```

**Import Components:**
```tsx
import { Button, Input, TextArea, Alert, Badge } from '@sendle/sds-ui';
```

**Import Tokens:**
```ts
import { ColorBrandPrimary, SizeSpacingLarge } from '@sendle/sds-ui/tokens';
```

**Use in SCSS:**
```scss
// src/components/TraceViewer/TraceViewer.scss
@import '~@sendle/sds-ui/tokens';

.trace-viewer {
  padding: $size-spacing-large; // 24px from SDS tokens
  background: $color-background-base;
  color: $color-font-base;
}
```

---

### 10.6 Resources

**Documentation:**
- Sendle Design System Storybook: https://sendle.github.io/sendle-design-system/
- React Docs: https://react.dev/
- React Router: https://reactrouter.com/
- Clerk React: https://clerk.com/docs/references/react/overview
- SWR: https://swr.vercel.app/
- Vite React Plugin: https://vitejs.dev/guide/#scaffolding-your-first-vite-project

**Migration References:**
- Vue to React Migration Guide: https://react.dev/learn/you-might-not-need-an-effect#migrating-from-lifecycle-methods
- React Hooks Reference: https://react.dev/reference/react

**Internal Docs:**
- Course Correction Proposal: `docs/Course-correction-SDS.md`
- UX Design Specification: `docs/ux-design-specification.md`
- Tech Spec: `docs/tech-spec.md`

---

## Conclusion

This Migration Implementation Guide provides a comprehensive roadmap for migrating the Open Coding Web Application from Vue 3 + Naive UI to React + Sendle Design System. The guide includes:

✅ **Complete current state analysis** - 5 core components inventoried
✅ **Target architecture** - React + SDS stack defined
✅ **Component-by-component mapping** - Vue → React transformations documented
✅ **6-phase implementation plan** - Day-by-day breakdown (7-10 days)
✅ **State management strategy** - React hooks + custom hooks for API data
✅ **API migration guide** - Axios → Fetch with Clerk auth
✅ **Testing strategy** - Unit, E2E, manual testing plans
✅ **Rollout plan** - Parallel deployment with rollback strategy
✅ **Risk mitigation** - Technical, timeline, and business risks addressed
✅ **Comprehensive appendices** - Component mappings, code examples, resources

**Next Steps for Architect:**

1. Review this guide thoroughly
2. Validate SDS component availability (especially Table, Timeline)
3. Set up React + SDS starter project to validate approach
4. Allocate team resources (1 FE engineer, 1 QA, 1 UX designer)
5. Begin Phase 0: React scaffold setup

**Estimated Timeline:** 7-10 working days for migration + 3-5 days for testing = **2-3 weeks total**

This migration ensures long-term alignment with Sendle's design and engineering standards while maintaining feature parity with the existing Vue application.

---

_Document Version: 1.0_
_Last Updated: November 23, 2025_
_Author: BMad Architecture Team_

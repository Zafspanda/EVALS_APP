# Open Coding Web Application - UX Design Specification

_Created on November 23, 2025 by BMad_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

The **Open Coding Web Application** (Evals App) is a systematic evaluation tool for analyzing AI chatbot conversation traces using qualitative open coding methodology. The application enables researchers and evaluators to import conversation data, systematically annotate turn-by-turn interactions (including tool calls), and export enriched datasets for analysis.

**Design System:** Sendle Design System (SDS) - React components with established brand identity
**Framework:** React + Vite + TypeScript
**Platform:** Desktop-first web application
**Core UX Goal:** Efficient, productive evaluation workflow with confidence in data accuracy

---

## 1. Design System Foundation

### 1.1 Design System Choice: Sendle Design System (SDS)

**Decision:** Use Sendle Design System (`@sendle/sds-ui`) for all UI components

**Rationale:**
- **Alignment with Sendle ecosystem** - Maintains consistency with core Sendle products
- **Prevents technical debt** - Eliminates need to manually rebuild components
- **Long-term maintainability** - Inherits SDS updates and improvements automatically
- **Established brand identity** - Leverages Sendle's trusted visual language
- **React-native** - Built specifically for React applications
- **Comprehensive component library** - Covers majority of evaluation interface needs

**What SDS Provides:**
- Complete React component library (inputs, buttons, tables, alerts, etc.)
- Design tokens (colors, typography, spacing, borders)
- Accessibility built-in (WCAG compliance)
- Responsive patterns
- Icon library
- SCSS utilities

**Migration Context:**
This app is migrating from Vue + Naive UI → React + SDS as documented in the course correction proposal (Course-correction-SDS.md). The React migration ensures full compatibility with Sendle's design and engineering standards.

---

## 2. Core User Experience

### 2.1 Target Users

**Primary Users:** Researchers, evaluators, and engineers conducting qualitative analysis of AI chatbot performance

**User Characteristics:**
- Comfortable with structured evaluation methodologies
- Need to process variable quantities of conversation traces (not fixed at 100)
- Value accuracy and data integrity over speed
- Work independently but need audit trails for collaboration
- May evaluate same datasets multiple times as coding schemes evolve

### 2.2 Desired Emotional Response

Users should feel:

1. **Efficient & Productive**
   - "I'm systematically working through evaluations without unnecessary friction"
   - Quick actions (Pass & Next, Skip, Mark as Fail) minimize clicks
   - Clear progress indicators show accomplishment

2. **Confident & Accurate**
   - "I trust that my annotations are being captured correctly"
   - Visual confirmation of saves
   - Audit trail provides accountability
   - Traces displayed in correct session order (first input → multi-turn → last response)
   - Tool calls clearly visible and attributable within trace flow

3. **Focused & In Control**
   - Minimal cognitive load - one trace at a time
   - Context available (previous turns in multi-turn sessions) but not overwhelming
   - Can navigate manually (Previous/Next) or let auto-advance handle flow

### 2.3 Defining Experience

**The ONE thing users will do most:** Evaluate a conversation trace and annotate it

**Core interaction flow:**
1. View trace (user input + AI response + tool calls in between)
2. Assess quality (holistic judgment: pass or fail)
3. Quick action decision:
   - **Pass & Next** → Instant advance to next unannotated trace (30-50% faster)
   - **Skip** → Defer evaluation, move to next
   - **Mark as Fail** → Inline form appears for failure details
4. Add context (codes, notes, flags) as needed
5. Confidence that annotation saved correctly

**What makes this unique:**
- **Turn-level coding** - Each turn in a conversation is independently evaluable
- **Tool call visibility** - AI → Tool → Response flow clearly displayed within turns
- **Quick actions replace traditional forms** - Reduces evaluation time by minimizing required inputs
- **Session context preserved** - Multi-turn conversations shown with full history for informed judgment

---

## 3. Visual Foundation (Sendle Design System)

### 3.1 Color System

**Primary Brand Colors (from SDS tokens):**

```
Primary (Orange):
- Lighter: #FFC299 (tint60)
- Light: #FFA466 (tint40)
- Base: #FF6800 (Sendle primary orange)
- Dark: #C85200 (shade20)
- Darker: #993E00 (shade40)

Secondary (Midnight/Neutrals):
- Midnight: #33424F (base text)
- Midnight Dark: #1F282F (shade40)
- Asphalt: #6D7883 (secondary text)
- Concrete: #B4BFC9 (borders, dividers)
- Overcast: #E9EDF0 (light backgrounds)
- Silver: #F7F8FA (subtle backgrounds)
```

**Semantic Colors:**

```
Success (Green):
- Base: #3DB147
- Light background: #E5F6EE (tint90)

Error (Red):
- Base: #E93D45
- Light background: #FCEBEC (tint90)

Warning (Yellow):
- Base: #FFBE37
- Light background: #FFF8EB (tint90)

Info (Blue):
- Base: #009DE3
- Light background: #E6F7FF (tint90)

Accent (Teal):
- Base: #62CCCC
```

**Color Usage in Evals App:**
- **Primary Orange** - Call-to-action buttons (Pass & Next), active states, progress indicators
- **Midnight** - Primary text, headers, trace content
- **Asphalt** - Secondary text, metadata, timestamps
- **Concrete** - Borders, dividers between traces
- **Silver/Overcast** - Card backgrounds, alternating table rows
- **Green** - Success states, "Pass" annotations, progress completion
- **Red** - Failure annotations, error states, required field indicators
- **Blue** - Info alerts, tool call indicators, contextual help
- **Teal** - Tool success states, active trace highlighting

### 3.2 Typography System

**Font Families (from SDS tokens):**

```
Base/Body: Open Sans, 'Helvetica Neue', Helvetica, Arial, sans-serif
Headings: Open Sans, 'Helvetica Neue', Helvetica, Arial, sans-serif
Code/Technical: Roboto, monospace
```

**Type Scale (SDS defaults):**
- H1: Headings for page titles ("Import CSV", "Evaluation Dashboard")
- H2: Section headers ("Trace Details", "Annotation")
- H3: Sub-sections ("User Input", "AI Response", "Tool Calls")
- Body: Default text for trace content, annotations
- Small: Metadata, timestamps, helper text
- Code: Tool call parameters, JSON outputs, technical data

**Typography Decisions:**
- **Trace content** - Body size for readability (Open Sans)
- **Tool call details** - Code font (Roboto mono) for technical clarity
- **Timestamps/metadata** - Small size, Asphalt color (#6D7883)
- **Headers** - Midnight color (#33424F), medium weight
- **Emphasis** - Bold weight for key information (user intent, failure notes)

### 3.3 Spacing System

**SDS Spacing Tokens (rem-based, 16px base):**

```
tiny:   0.0625rem (1px)   - Hairline borders
xxs:    0.125rem  (2px)   - Tight spacing
xs:     0.25rem   (4px)   - Minimal padding
small:  0.5rem    (8px)   - Compact layouts
medium: 1rem      (16px)  - Base spacing (default)
large:  1.5rem    (24px)  - Comfortable sections
xl:     2rem      (32px)  - Major sections
xxl:    3rem      (48px)  - Page-level spacing
```

**Spacing Application:**
- **Card padding** - `large` (24px) for comfortable reading of trace content
- **Form field spacing** - `medium` (16px) between fields in annotation forms
- **Button groups** - `small` (8px) between quick action buttons
- **Section breaks** - `xl` (32px) between trace viewer and annotation panel
- **Page margins** - `xxl` (48px) for outer page boundaries
- **List items** - `medium` (16px) vertical spacing in trace lists

### 3.4 Layout Grid & Breakpoints

**SDS provides responsive utilities. For Evals App:**

**Breakpoints:**
- Desktop: ≥1024px (primary target)
- Tablet: 768px - 1023px (review/read-only mode)
- Mobile: <768px (deferred to Phase 2)

**Layout Structure:**
- **Desktop:** Two-column layout
  - Left: Trace viewer (60% width) - displays conversation, tool calls
  - Right: Annotation panel (40% width) - quick actions, forms, metadata
- **Tablet:** Single column, collapsible annotation drawer
- **Mobile:** Deferred (desktop-first approach)

---

## 4. Defining Experience: Turn-Level Evaluation with Tool Call Visibility

### 4.1 Core Experience Principles

**Principle 1: Speed Through Simplification**
- One-click "Pass & Next" for successful traces
- Auto-advance to next unannotated trace
- Inline failure form (only when needed)
- Minimal required fields

**Principle 2: Context-Aware Display**
- Session grouping preserves conversation flow
- Turn order maintained (first input → final response)
- Previous turns visible for multi-turn context
- Tool calls integrated within turn display

**Principle 3: Clarity & Confidence**
- Visual confirmation of annotation saves
- Progress indicators show completion state
- Audit trail captures all changes
- Clear distinction between user input, AI response, and tool interactions

**Principle 4: Flexible Navigation**
- Manual Previous/Next controls always available
- Auto-advance respects user agency
- Skip functionality for deferred evaluation
- Direct trace selection from list view

### 4.2 Novel UX Pattern: Integrated Tool Call Visualization

**Challenge:** Display complex turn structure with embedded tool calls

**Pattern Design:**

**Turn Anatomy:**
```
┌─────────────────────────────────────────────────────────┐
│ Turn 1 of 3                                             │
├─────────────────────────────────────────────────────────┤
│ 👤 User Input                                           │
│ "Where is my parcel with tracking ABC123?"             │
├─────────────────────────────────────────────────────────┤
│ 🔧 Tool Call: tracking_lookup                          │
│    Input: { tracking_number: "ABC123" }                │
│    Status: ✓ Success                                    │
│    Output: { status: "In transit", eta: "Tomorrow" }   │
│    [Mark Tool as: Pass | Fail]                         │
├─────────────────────────────────────────────────────────┤
│ 🤖 AI Response                                          │
│ "Your parcel ABC123 is in transit and will arrive      │
│  tomorrow."                                             │
└─────────────────────────────────────────────────────────┘
```

**Visual Hierarchy:**
1. **User Input** (top) - Light blue background (#E6F7FF), user icon
2. **Tool Call** (middle) - Teal accent border (#62CCCC), monospace font for params
   - Tool name as header
   - Input/Output in code blocks
   - Success/Fail indicator
   - Optional: Mini Pass/Fail buttons for tool-level annotation
3. **AI Response** (bottom) - Light orange background (#FFF8EB), bot icon

**Interaction:**
- Tool call sections are collapsible (show summary by default, expand for details)
- Tool-level pass/fail optional (some evaluations focus only on turn-level quality)
- Hovering tool call shows tooltip with timing/duration metadata

---

## 5. User Journey Flows

### 5.1 Primary Journey: Import → Evaluate → Export

**Journey Goal:** Complete evaluation of a dataset from import to export

**Flow Steps:**

```
1. Import CSV
   ├─ User action: Select CSV file
   ├─ System: Validate schema (28 columns)
   ├─ System: Parse traces and group into sessions
   ├─ System: Display import summary
   └─ User: Confirm import

2. Dashboard View
   ├─ System: Show progress stats
   ├─ User: See unannotated count
   └─ User: Click "Start Evaluating" or select specific trace

3. Evaluation Loop (Repeat for each trace)
   ├─ System: Display trace with context
   │   ├─ Turn number (X of Y)
   │   ├─ Session context (previous turns if multi-turn)
   │   ├─ User input
   │   ├─ Tool calls (if any) with success/fail status
   │   └─ AI response
   ├─ User: Assess trace quality
   └─ User: Quick action decision:
       ├─ Pass & Next → Save, advance to next unannotated
       ├─ Skip → Move to next without annotating
       └─ Mark as Fail → Inline form appears
           ├─ User: Enter first failure note (required)
           ├─ User: Add open codes (optional)
           ├─ User: Add comments (optional)
           └─ User: Click Save → Advance to next

4. Progress Tracking
   ├─ System: Update progress indicator
   ├─ System: Show % complete
   └─ User: Monitor completion

5. Export Annotated Data
   ├─ User: Click "Export"
   ├─ User: Select format (CSV or JSONL)
   ├─ System: Generate enriched dataset (28 original + annotation columns)
   └─ System: Download file
```

**Decision Points:**
- **After "Pass & Next"** → Auto-advance to next unannotated trace
- **After "Skip"** → Move to next trace in sequence (may be annotated or unannotated)
- **After "Mark as Fail" + Save** → Auto-advance to next unannotated trace
- **Manual Previous/Next** → Always available in header, overrides auto-advance

**Error Recovery:**
- **Save fails** → Alert shown, annotation preserved in form, retry button
- **Import fails** → Detailed error message with row/column info, return to import screen
- **Session closed accidentally** → Annotations auto-saved, resume from last evaluated trace

### 5.2 Secondary Journey: Review & Edit Existing Annotations

**Journey Goal:** Revisit previously annotated trace to update coding

**Flow:**
```
1. Dashboard → Filter by "Annotated"
2. Select trace from list
3. System loads trace with existing annotation pre-filled
4. User edits annotation fields
5. User clicks "Update"
6. System saves with audit trail (who changed what when)
7. User navigates to next trace or returns to dashboard
```

### 5.3 Tertiary Journey: Bulk Skip / Filter Workflow

**Journey Goal:** Quickly skip irrelevant traces or focus on specific subset

**Flow:**
```
1. Dashboard → Apply filters
   - Session ID
   - Turn number range
   - Has tool calls (yes/no)
   - Annotation status (unannotated/pass/fail/skipped)
2. System shows filtered list
3. User enters evaluation mode with filtered set
4. User evaluates only filtered traces
5. Progress indicator reflects filtered subset
```

---

## 6. Component Library Strategy

### 6.1 SDS Components - Direct Usage

**Components provided by SDS that map directly to Evals App needs:**

**Inputs:**
- `<Button>` - Quick action buttons (Pass & Next, Skip, Mark as Fail), navigation, save
- `<Input>` - Text fields for codes, failure notes
- `<TextArea>` - Long-form comments, hypotheses
- `<Checkbox>` - Boolean flags (needs_clarification, is_golden_set)
- `<Radio>` / `<RadioGroup>` - Alternative to quick actions (if needed for accessibility)
- `<Select>` - Dropdown for taxonomy categories
- `<FileUpload>` - CSV import

**Data Display:**
- `<Table>` - Trace list view, session summaries
- `<Badge>` - Status indicators (Pass, Fail, Skipped, Unannotated)
- `<Status>` - Tool call success/failure indicators
- `<Divider>` - Section separators in trace viewer
- `<List>` / `<ListItem>` - Tool call details, open codes list

**Feedback:**
- `<Alert>` - Success confirmations, error messages, import warnings
- `<Notice>` - Info messages, helper text, onboarding guidance

**Layout:**
- SDS provides grid and spacing utilities via SCSS

**Icons:**
- SDS icon library for user/bot avatars, tool indicators, navigation arrows

### 6.2 Custom Components (Built with SDS Styling)

**Components NOT provided by SDS that need custom implementation:**

#### 1. `<TraceViewer>`
**Purpose:** Display turn-by-turn conversation with tool call integration

**Anatomy:**
- Turn header (turn X of Y, timestamp)
- User input section (text, icon, background color)
- Tool call section(s) (collapsible, monospace, teal accent)
  - Tool name
  - Input params (code block)
  - Output (code block)
  - Success/fail indicator
  - Optional tool-level pass/fail buttons
- AI response section (text, icon, background color)
- Navigation controls (previous/next)

**States:**
- Default: All sections visible, tool calls collapsed
- Tool expanded: Tool call details visible
- Loading: Skeleton/spinner while fetching trace
- Error: Error message if trace fails to load

**SDS Components Used:**
- `<Badge>` for turn number
- `<Button>` for prev/next navigation
- `<Status>` for tool success/fail
- SDS color tokens for backgrounds
- SDS spacing tokens for padding

---

#### 2. `<QuickActions>`
**Purpose:** Primary annotation mechanism - one-click evaluation

**Anatomy:**
- Three button group (horizontal layout)
  - **Pass & Next** (primary, orange, SDS Button)
  - **Skip** (secondary, neutral, SDS Button)
  - **Mark as Fail** (destructive, red accent, SDS Button)

**Behavior:**
- **Pass & Next:**
  - Saves annotation with pass=true
  - Auto-advances to next unannotated trace
  - Shows brief success toast
- **Skip:**
  - Marks trace as skipped (no annotation saved)
  - Moves to next trace in sequence
- **Mark as Fail:**
  - Toggles inline failure form below buttons
  - Disables other buttons while form open
  - Form includes:
    - Required: First failure note (SDS TextArea)
    - Optional: Open codes (SDS Input, comma-separated)
    - Optional: Comments (SDS TextArea)
  - Save button in form saves + auto-advances

**States:**
- Default: All buttons enabled
- Form open: Pass & Skip disabled, Mark as Fail active
- Saving: All buttons disabled, loading spinner
- Saved: Brief success state, then auto-advance

**SDS Components Used:**
- `<Button>` (primary, secondary, variants)
- `<Input>` for text fields
- `<TextArea>` for long-form notes
- `<Alert>` for success confirmation

---

#### 3. `<SessionContext>`
**Purpose:** Show previous turns in multi-turn conversations

**Anatomy:**
- Collapsible panel above current trace
- Header: "Previous turns in this session (X)"
- Content: Condensed view of previous turns
  - Turn number
  - User input (truncated)
  - AI response (truncated)
  - Tool calls (count only, no details)
- Expand button to show full previous turn details

**States:**
- Collapsed (default): Header only
- Expanded: Previous turns visible
- Single-turn session: Component hidden entirely

**SDS Components Used:**
- `<Button>` for expand/collapse
- `<Divider>` between previous turns
- `<Badge>` for turn numbers
- SDS color tokens for muted backgrounds

---

#### 4. `<ProgressTracker>`
**Purpose:** Visual indicator of evaluation progress

**Anatomy:**
- Progress bar (SDS-styled or custom with SDS tokens)
- Stats:
  - Total traces
  - Annotated (pass + fail)
  - Skipped
  - Remaining
- Percentage complete

**States:**
- In progress: Orange fill for completed portion
- Complete: Green fill when 100%

**SDS Components Used:**
- `<Badge>` for stats
- SDS color tokens (orange for active, green for complete)
- SDS spacing for layout

---

#### 5. `<ToolCallCard>`
**Purpose:** Display individual tool call within a turn

**Anatomy:**
- Header: Tool name + success/fail status
- Collapsible body:
  - Input params (JSON, code-formatted)
  - Output (JSON, code-formatted)
  - Duration (metadata)
- Optional: Tool-level pass/fail buttons

**States:**
- Collapsed: Header only (tool name + status)
- Expanded: Full details visible
- Success: Green accent border
- Failure: Red accent border

**SDS Components Used:**
- `<Status>` for success/fail indicator
- `<Button>` for expand/collapse
- SDS font tokens (code family for JSON)
- SDS color tokens (green/red accents)

---

### 6.3 Component Mapping Summary

| App Need | SDS Component | Notes |
|----------|---------------|-------|
| Quick action buttons | `<Button>` | Direct usage, variants |
| Text inputs (codes, notes) | `<Input>`, `<TextArea>` | Direct usage |
| Checkboxes (flags) | `<Checkbox>` | Direct usage |
| Dropdowns (taxonomy) | `<Select>` | Direct usage |
| Trace list table | `<Table>` | Direct usage |
| Status badges | `<Badge>`, `<Status>` | Direct usage |
| Alerts/confirmations | `<Alert>`, `<Notice>` | Direct usage |
| CSV upload | `<FileUpload>` | Direct usage |
| Trace viewer | Custom `<TraceViewer>` | Built with SDS tokens |
| Quick actions panel | Custom `<QuickActions>` | SDS buttons + custom layout |
| Session context | Custom `<SessionContext>` | SDS components + custom logic |
| Progress bar | Custom `<ProgressTracker>` | SDS tokens for styling |
| Tool call display | Custom `<ToolCallCard>` | SDS tokens + code formatting |

**Custom Component Count:** 5 (TraceViewer, QuickActions, SessionContext, ProgressTracker, ToolCallCard)
**SDS Component Usage:** 15+ components used directly

---

## 7. UX Pattern Decisions

### 7.1 Button Hierarchy

**Primary Actions (SDS Primary Button - Orange):**
- "Pass & Next" - Most common action, deserves primary prominence
- "Import CSV" - Entry point to workflow
- "Export Data" - Final step in workflow
- "Save" (in failure form) - Commit annotation

**Secondary Actions (SDS Secondary Button - Neutral):**
- "Skip" - Defer decision
- "Previous" / "Next" (manual navigation)
- "Cancel" (in modals/forms)

**Destructive Actions (SDS variant with red accent):**
- "Mark as Fail" - Negative judgment, warrants visual weight
- "Delete Annotation" (if implemented)

**Tertiary Actions (SDS IconButton or text link):**
- "Expand/Collapse" tool calls
- "Show previous turns"
- Filter controls

### 7.2 Feedback Patterns

**Success States:**
- **Pattern:** Green `<Alert>` (top-right toast) + brief auto-dismiss (3s)
- **When:** Annotation saved, CSV imported, export complete
- **Example:** "✓ Annotation saved. Advancing to next trace..."

**Error States:**
- **Pattern:** Red `<Alert>` (persistent) + actionable error message
- **When:** Save fails, import validation error, network issue
- **Example:** "⚠ Failed to save annotation. [Retry] or [Contact Support]"

**Loading States:**
- **Pattern:** SDS spinner + descriptive text
- **When:** Importing CSV, loading trace, saving annotation, generating export
- **Example:** Spinner in button: "Saving..." (replaces button text)

**Info States:**
- **Pattern:** Blue `<Notice>` (inline, dismissible)
- **When:** Onboarding tips, helper text, feature announcements
- **Example:** "💡 Tip: Use 'Pass & Next' for traces that meet quality standards"

### 7.3 Form Patterns

**Label Position:** Above field (SDS default)

**Required Field Indicator:** Red asterisk (*) + aria-required

**Validation Timing:**
- **onBlur** for individual fields (show error after user leaves field)
- **onSubmit** for form-level validation (catch missing required fields)

**Error Display:**
- **Inline errors** - Red text below field with icon
- **Form summary** - Red `<Alert>` at top of form listing all errors

**Help Text:**
- **Caption below field** - Gray text for hints (SDS small size)
- **Tooltip** - For complex fields (e.g., open codes format)

**Example - Failure Note Field:**
```
First Failure Note *
[TextArea component - SDS]
"Describe what went wrong in this turn"
[Error: "This field is required when marking as fail"]
```

### 7.4 Modal Patterns

**Size Variants:**
- Small: Confirmation dialogs ("Delete annotation?")
- Medium: Import CSV preview, export options
- Large: Not used (prefer inline editing)

**Dismiss Behavior:**
- Click outside modal: NO (requires explicit Cancel)
- Escape key: YES (same as Cancel button)
- X button: YES (top-right corner)

**Focus Management:**
- Auto-focus primary action or first input field
- Tab traps within modal
- Return focus to trigger element on close

### 7.5 Navigation Patterns

**Active State Indication:**
- **Current trace** - Orange left border (4px) + light orange background
- **Current page** - Bold text in navigation menu

**Previous/Next Buttons:**
- Always visible in trace viewer header
- Disabled states when at beginning/end of list
- Keyboard shortcuts: Arrow keys (left/right)

**Auto-Advance Behavior:**
- After "Pass & Next" → Auto-advance to next unannotated
- After "Mark as Fail" + Save → Auto-advance to next unannotated
- After "Skip" → Move to next in sequence (may be annotated)
- Manual navigation overrides auto-advance

### 7.6 Empty State Patterns

**No Traces Imported:**
```
┌─────────────────────────────────────────┐
│  📄 No traces yet                       │
│                                         │
│  Import a CSV file to begin evaluation │
│                                         │
│  [Import CSV]                           │
└─────────────────────────────────────────┘
```

**All Traces Evaluated:**
```
┌─────────────────────────────────────────┐
│  ✓ All traces evaluated!                │
│                                         │
│  100 of 100 traces annotated            │
│                                         │
│  [Export Data] [Review Annotations]     │
└─────────────────────────────────────────┘
```

**No Results (Filtered View):**
```
┌─────────────────────────────────────────┐
│  No traces match your filters           │
│                                         │
│  Try adjusting filter criteria          │
│                                         │
│  [Clear Filters]                        │
└─────────────────────────────────────────┘
```

### 7.7 Confirmation Patterns

**Delete Annotation:**
- **Confirmation level:** Modal dialog (destructive action)
- **Message:** "Delete this annotation? This cannot be undone."
- **Actions:** [Cancel] [Delete] (red)

**Leave Unsaved:**
- **Confirmation level:** Modal dialog (data loss risk)
- **Message:** "You have unsaved changes. Leave anyway?"
- **Actions:** [Cancel] [Leave] (secondary)

**Irreversible Actions:**
- All require explicit confirmation
- No "Don't show again" checkbox (maintain safety)

### 7.8 Notification Patterns

**Placement:** Top-right corner (toast notifications)

**Duration:**
- Success: 3 seconds auto-dismiss
- Info: 5 seconds auto-dismiss
- Warning: 10 seconds or manual dismiss
- Error: Manual dismiss only

**Stacking:** Max 3 notifications, oldest dismissed first

**Priority Levels:**
- Critical (red) - Errors, failures
- Important (orange) - Warnings
- Info (blue) - General notifications
- Success (green) - Confirmations

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Target Devices:**
- **Primary:** Desktop (≥1024px) - Full two-column layout
- **Secondary:** Tablet (768-1023px) - Single column, annotation drawer
- **Deferred:** Mobile (<768px) - Phase 2 scope

**Breakpoint Adaptations:**

**Desktop (≥1024px):**
- Two-column layout:
  - Left: Trace viewer (60% width, fixed)
  - Right: Annotation panel (40% width, fixed)
- Table view shows all columns
- Quick actions horizontal button group

**Tablet (768-1023px):**
- Single column layout
- Trace viewer full width
- Annotation panel becomes bottom drawer (collapsible)
- Table view hides less critical columns (tool duration, metadata)
- Quick actions remain horizontal

**Adaptation Patterns:**
- **Navigation:** Desktop sidebar → Tablet hamburger menu
- **Tables:** Desktop full → Tablet horizontal scroll or card view
- **Forms:** Desktop side-by-side labels → Tablet stacked labels
- **Modals:** Desktop centered → Tablet full-screen on small sizes

### 8.2 Accessibility Strategy

**WCAG Compliance Target:** WCAG 2.1 Level AA

**Why Level AA:**
- Standard for professional web applications
- Required for government/education use cases (if applicable)
- Ensures broad usability without excessive implementation burden

**Key Requirements:**

**Color Contrast:**
- Text vs background: Minimum 4.5:1 (body text), 3:1 (large text/UI components)
- SDS color tokens meet WCAG AA by default
- Custom components verified with contrast checker

**Keyboard Navigation:**
- All interactive elements accessible via Tab/Shift+Tab
- Skip links to main content ("Skip to trace viewer")
- Arrow keys for previous/next navigation
- Enter/Space for button activation
- Escape to close modals/drawers

**Focus Indicators:**
- Visible focus ring on all interactive elements (SDS default: blue outline)
- Custom focus styles consistent with SDS patterns
- Never `outline: none` without replacement

**ARIA Labels:**
- Meaningful labels for screen readers:
  - `<Button aria-label="Pass and advance to next trace">`
  - `<Input aria-describedby="codes-help">`
  - `<Table aria-label="Conversation trace list">`
- ARIA live regions for dynamic content (progress updates, save confirmations)

**Alt Text:**
- Descriptive alt text for icons:
  - User icon: "User message"
  - Bot icon: "AI response"
  - Tool icon: "Tool call"
- Decorative images: `alt=""`

**Form Labels:**
- All form fields have associated `<label>` elements
- Required fields: `aria-required="true"`
- Error messages: `aria-invalid="true"` + `aria-describedby="error-id"`

**Error Identification:**
- Clear, descriptive error messages
- Errors announced to screen readers
- Errors associated with fields via ARIA

**Touch Target Size:**
- Minimum 44x44px for mobile/tablet (SDS buttons meet this)
- Adequate spacing between touch targets (8px minimum)

**Testing Strategy:**
- **Automated:** Lighthouse accessibility audit, axe DevTools
- **Manual:** Keyboard-only navigation testing
- **Screen Reader:** VoiceOver (macOS) / NVDA (Windows) testing

---

## 9. Implementation Guidance

### 9.1 SDS Integration Setup

**Installation:**
```bash
yarn add @sendle/sds-ui
```

**Import Styles:**
```jsx
// src/index.js or App.js
import '@sendle/sds-ui/scss/sds.scss';
```

**Import Components:**
```jsx
import { Button, Input, TextArea, Table, Alert } from '@sendle/sds-ui';
```

**Import Tokens (for custom components):**
```js
import * as tokens from '@sendle/sds-ui/tokens';
// or specific tokens
import { ColorBrandPrimary, SizeSpacingMedium } from '@sendle/sds-ui/tokens';
```

### 9.2 Component Usage Examples

**Quick Actions (Custom component using SDS):**
```jsx
import { Button } from '@sendle/sds-ui';

function QuickActions({ onPass, onSkip, onFail, disabled }) {
  const [showFailForm, setShowFailForm] = useState(false);

  return (
    <div className="quick-actions">
      <Button
        variant="primary"
        onClick={onPass}
        disabled={disabled || showFailForm}
      >
        Pass & Next
      </Button>

      <Button
        variant="secondary"
        onClick={onSkip}
        disabled={disabled || showFailForm}
      >
        Skip
      </Button>

      <Button
        variant="destructive"
        onClick={() => setShowFailForm(!showFailForm)}
        disabled={disabled}
      >
        Mark as Fail
      </Button>

      {showFailForm && (
        <FailureForm onSave={onFail} onCancel={() => setShowFailForm(false)} />
      )}
    </div>
  );
}
```

**Trace Viewer (Custom component with SDS styling):**
```jsx
import { Badge, Status, Divider } from '@sendle/sds-ui';
import { ColorBrandPrimary, SizeSpacingLarge } from '@sendle/sds-ui/tokens';

function TraceViewer({ trace, sessionContext }) {
  return (
    <div className="trace-viewer" style={{ padding: SizeSpacingLarge }}>
      <div className="trace-header">
        <Badge variant="info">Turn {trace.turnNumber} of {trace.totalTurns}</Badge>
        <span className="timestamp">{formatTimestamp(trace.timestamp)}</span>
      </div>

      <Divider />

      {/* User Input */}
      <div className="user-input">
        <h3>👤 User Input</h3>
        <p>{trace.userMessage}</p>
      </div>

      {/* Tool Calls */}
      {trace.toolCalls?.map(tool => (
        <ToolCallCard key={tool.id} tool={tool} />
      ))}

      {/* AI Response */}
      <div className="ai-response">
        <h3>🤖 AI Response</h3>
        <p>{trace.aiResponse}</p>
      </div>
    </div>
  );
}
```

### 9.3 File Structure Recommendation

```
frontend/
├── src/
│   ├── components/
│   │   ├── TraceViewer/
│   │   │   ├── TraceViewer.jsx
│   │   │   ├── TraceViewer.scss (SDS tokens)
│   │   │   └── index.js
│   │   ├── QuickActions/
│   │   │   ├── QuickActions.jsx
│   │   │   ├── FailureForm.jsx
│   │   │   └── index.js
│   │   ├── ToolCallCard/
│   │   ├── SessionContext/
│   │   ├── ProgressTracker/
│   │   └── ...
│   ├── views/
│   │   ├── Dashboard.jsx
│   │   ├── EvaluationView.jsx
│   │   ├── ImportView.jsx
│   │   └── ExportView.jsx
│   ├── styles/
│   │   ├── _variables.scss (SDS token overrides if needed)
│   │   └── global.scss
│   └── App.jsx
```

---

## 10. Completion Summary

### 10.1 What We Created

This UX Design Specification provides:

1. **Design System Foundation** - Sendle Design System (SDS) integration strategy
2. **Visual Foundation** - Complete color, typography, and spacing system from SDS tokens
3. **Core UX Principles** - Efficient, confident, focused evaluation experience
4. **Defining Experience** - Turn-level coding with integrated tool call visualization
5. **User Journeys** - Import → Evaluate → Export flow with decision points
6. **Component Strategy** - 15+ SDS components + 5 custom components
7. **UX Patterns** - Consistent decisions for buttons, feedback, forms, navigation, etc.
8. **Responsive Strategy** - Desktop-first with tablet support
9. **Accessibility** - WCAG 2.1 Level AA compliance
10. **Implementation Guidance** - Setup instructions and code examples

### 10.2 Key Decisions Documented

**Strategic:**
- ✅ Sendle Design System (SDS) as single source of truth for UI
- ✅ React + Vite migration justified for SDS compatibility
- ✅ Desktop-first, tablet-secondary, mobile-deferred scope

**Experience:**
- ✅ Dual emotional goal: Efficient & Productive + Confident & Accurate
- ✅ Quick actions reduce evaluation time by 30-50%
- ✅ Turn-level coding with embedded tool call visualization
- ✅ Session context preserves multi-turn conversation flow
- ✅ Auto-advance for passes/fails, manual navigation always available

**Visual:**
- ✅ SDS color palette: Orange primary, Midnight text, semantic colors for states
- ✅ Open Sans typography throughout
- ✅ 16px base spacing with SDS rem-based scale
- ✅ Two-column desktop layout (60/40 split)

**Technical:**
- ✅ 15+ SDS components used directly
- ✅ 5 custom components (TraceViewer, QuickActions, SessionContext, ProgressTracker, ToolCallCard)
- ✅ WCAG 2.1 Level AA accessibility target
- ✅ Keyboard navigation, screen reader support, color contrast validated

### 10.3 What Developers Will Build

Armed with this UX specification, developers can:

1. **Install SDS** and import components directly
2. **Build 5 custom components** using SDS tokens for styling consistency
3. **Implement user journeys** with clear decision points and states
4. **Apply UX patterns** consistently (buttons, feedback, forms, navigation)
5. **Ensure accessibility** with WCAG AA compliance
6. **Create responsive layouts** for desktop and tablet

### 10.4 Next Steps

**For UX/Design:**
- ✅ Specification complete
- Optional: Create high-fidelity mockups in Figma using SDS components
- Optional: Build interactive prototype for user testing

**For Engineering:**
- ✅ Specification provides implementation blueprint
- Scaffold React + Vite + SDS project
- Build custom components per specifications
- Integrate SDS components per component mapping
- Implement user journeys per flow diagrams

**For QA:**
- ✅ Specification defines expected behavior
- Test user flows (import → evaluate → export)
- Validate accessibility (keyboard nav, screen readers, contrast)
- Verify responsive behavior (desktop, tablet)

---

## Appendix

### Related Documents

- **Product Requirements:** `/docs/_brief_evals_app.md` (Product Brief)
- **Technical Specification:** `/docs/tech-spec.md`
- **Course Correction:** `/docs/Course-correction-SDS.md` (Vue → React migration rationale)
- **Sendle Design System:** `/Users/zaf-imac2021/Documents/Documents - Mac Mini/GitHub/Sendle/SDS/sendle-design-system-main`
- **Architecture Documentation:** `/docs/architecture/`
- **Sprint Planning:** `/docs/sprint-artifacts/`

### SDS Resources

- **Storybook (Live Documentation):** https://sendle.github.io/sendle-design-system/
- **GitHub Repository:** https://github.com/sendle/sendle-design-system
- **Package:** `@sendle/sds-ui` (GitHub Package Registry)

### Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| November 23, 2025 | 1.0 | Initial UX Design Specification | BMad |

---

_This UX Design Specification was created through collaborative design facilitation, incorporating user input, technical constraints, and the Sendle Design System. All decisions are documented with rationale for future reference._

# Product Brief: Open Coding Web Application

**Document Type:** Product Brief
**Created:** 13 November 2025
**Updated:** 13 November 2025 (v1.2 - Added CI Integration Requirements)
**Status:** For Review and Decision-Making
**Primary Audience:** Product Managers, Engineering Leadership, Stakeholders

---

## 1. Executive Summary

### What is the product?

An interactive web application that enables systematic manual evaluation of AI chatbot conversation traces using the **open coding methodology**. The application will import trace data (100 traces from 39 sessions, including 27 multi-turn and 12 single-turn conversations), provide an intuitive interface for human evaluators to apply qualitative coding, and export enriched datasets with standardised open coding categories and annotations.

### Why is it needed?

Current manual evaluation of chatbot traces is a fragmented, disconnected process:
- Evaluators work in isolated spreadsheets (Google Sheets, Excel)
- No real-time collaboration or conflict resolution
- Manual data entry is error-prone and difficult to track
- Audit trails and evaluation history are not captured
- Integration between trace data and coding categories requires manual data wrangling
- Scaling to larger datasets (beyond 100 traces) becomes operationally complex

The Open Coding Web Application will centralise and streamline this workflow, enabling teams to systematically and collaboratively evaluate chatbot performance at scale while supporting the **AI Evals course's "Analyse → Measure → Improve" lifecycle**.

---

## 2. Background & Context

### AI Evals Course Context

This product supports the *Application-Centric AI Evals for Engineers & TPMs* course, which teaches a structured lifecycle for improving AI systems:

- **Analyse**: Understand what the system is doing (qualitative evaluation)
- **Measure**: Quantify performance against defined criteria
- **Improve**: Implement changes based on insights

The Open Coding Web Application is a tool for the **Analyse phase**, where teams conduct qualitative evaluation of system behaviour to identify patterns, failure modes, and opportunities for improvement.

### Open Coding Methodology

Open coding is a qualitative research technique where:
1. Evaluators systematically review conversation traces
2. For each trace, they assign codes (labels/categories) that represent observed phenomena
3. Codes emerge from the data itself (inductive rather than predetermined)
4. Over time, codes are refined, consolidated, and organised into categories

### BotDojo Traces: Data Context

The application will work with BotDojo conversation traces, enriched with performance metrics:

- **Dataset Size**: 100 conversation traces from 39 distinct chat sessions
  - 27 multi-turn sessions (conversations with multiple back-and-forth exchanges)
  - 12 single-turn sessions (brief queries with single response)
  - Longest conversation: 9 turns
  - Average turns in multi-turn conversations: 3.3

- **Data Source**: Sendle's production customer support chatbot (November 13, 2025, 07:34–08:55 UTC)

- **Current Data Schema**: 28 enriched columns including:
  - Session metadata (conversation ID, flow ID, turn number, total turns)
  - Timing information (start time, end time, duration)
  - Conversational data (user message, AI response)
  - Tool performance metrics (tools called, success rate, reliability score)
  - Feature flags (has escalation, has RAG retrieval, has tracking lookup)
  - CI filter metadata (persona, feature)
  - Internal metadata (status, AI message details, header, ID)

### Trace Granularity Decision ✨ NEW

**Critical Design Decision: Trace = Individual Turn (Turn-Level Coding)**

- **Definition**: Each of the 100 rows in the CSV represents a single message exchange (one turn)
- **Coding Approach**: Evaluators code each turn independently
- **Context Handling**: For multi-turn conversations, the UI displays previous turns for context, but annotations apply to the current turn only
- **Rationale**:
  - Turn-level coding provides finer granularity for identifying where failures occur in a conversation
  - Aligns with the CSV structure (100 rows = 100 individual turns)
  - Enables more precise correlation between user input, bot response, and failure modes
  - Supports turn-by-turn analysis in multi-turn conversations

**Example**: A 3-turn conversation results in 3 separate coded traces:
- Trace 1: Turn 1 of 3 (greeting + initial query)
- Trace 2: Turn 2 of 3 (clarification question)
- Trace 3: Turn 3 of 3 (final response + resolution)

Each turn is coded independently, with previous turns visible for context.

---

## 3. Problem Statement

### Current Pain Points with Manual Open Coding

#### 3.1 Fragmented Workflow
- **Current State**: Evaluators manually copy trace data from CSV files into Google Sheets or local spreadsheets
- **Pain**: Manual copy-paste is error-prone; risks data integrity and consistency
- **Impact**: Evaluators lose confidence in data quality; time spent on data entry rather than evaluation

#### 3.2 No Centralised Evaluation Interface
- **Current State**: Evaluation is decoupled from the source data; evaluators view traces in one system and record codes in another
- **Pain**: Context switching between systems; difficult to maintain consistency across multiple evaluators
- **Impact**: Inconsistent coding; reduced inter-rater reliability

#### 3.3 Inability to Collaborate in Real-Time
- **Current State**: One evaluator per spreadsheet; asynchronous updates via file sharing
- **Pain**: Difficult to resolve coding conflicts; no way to flag disagreements or ask clarifying questions in-context
- **Impact**: Bottlenecks in evaluation; potential for uncaught errors

#### 3.4 Missing Audit Trail & Version Control
- **Current State**: When evaluators update codes, there is no record of who changed what or when
- **Pain**: Cannot trace the reasoning behind decisions; difficult to understand evolution of coding scheme
- **Impact**: Reduced accountability; harder to defend evaluation results

#### 3.5 Manual Data Wrangling for Export
- **Current State**: To prepare data for analysis, evaluators must manually merge open coding columns back into the enriched trace dataset
- **Pain**: Tedious, error-prone; requires SQL knowledge or Python scripting
- **Impact**: Delays progress through the evaluation cycle

#### 3.6 No Support for Iteration & Refinement
- **Current State**: If evaluators need to revise codes or refine the coding scheme, they manually edit entries
- **Pain**: Difficult to track which traces were updated; easy to accidentally lose historical codes
- **Impact**: Discourages iterative refinement; locks team into initial coding decisions

#### 3.7 Scaling Challenges
- **Current State**: 100 traces fit in a spreadsheet; 1000 traces do not
- **Pain**: Spreadsheet tools slow down; no built-in pagination, filtering, or search
- **Impact**: Limits scalability; cannot efficiently evaluate larger datasets

---

## 4. Product Goals & Objectives

### Primary Goal

Enable teams to systematically apply open coding to AI chatbot conversation traces in a centralised, collaborative web application that maintains data integrity, captures audit trails, and integrates seamlessly with the "Analyse → Measure → Improve" evaluation lifecycle.

### Success Objectives

#### 4.1 Usability & Efficiency
- Evaluators can code a trace in < 2 minutes (vs. ~5 minutes in current spreadsheet workflow)
- Reduce manual data entry by 100% (automated import/export)
- Single click to export clean, merge-ready CSV/JSONL with original 28 columns + dynamic annotation columns

#### 4.2 Collaboration & Consistency
- Support multiple evaluators working simultaneously on the same dataset
- Implement flagging mechanism to highlight disagreements between evaluators
- Provide per-evaluator consistency reports (e.g., "You coded 'escalation' in 15% of traces; team average is 12%")

#### 4.3 Data Integrity & Traceability
- Capture full audit trail: who coded what, when, and what changes were made
- Support reverting to previous coding states
- Implement validation rules to prevent invalid codes

#### 4.4 Iterative Refinement
- Support updating the open coding schema without losing existing codes
- Allow re-coding of traces as the schema evolves
- Track code evolution (e.g., "this code was previously called 'system_error'; now 'tool_failure'")

#### 4.5 Integration with AI Evals Workflow
- Export results in formats compatible with downstream analysis tools (Python, SQL, CI pipeline)
- Support the "Measure" phase by providing quantitative summaries (distribution of codes, inter-rater reliability metrics)
- Enable traceability from qualitative codes → quantitative metrics → improvements

---

## 5. Technical Requirements

### 5.1 Data Schema & Storage

#### Input Data Format (Import)
The application will accept enriched BotDojo traces in CSV format with the following **28 columns**:

```
1. Turn_Number                      (int)           Current turn in session
2. Total_Turns_in_Session           (int)           Total turns in this session
3. Flow Session                     (UUID)          Session identifier
4. zendesk_conversation_id          (string)        Conversation ID
5. Start Time                       (timestamp)     Turn start time (ISO 8601)
6. End Time                         (timestamp)     Turn end time (ISO 8601)
7. Duration                         (int)           Duration in milliseconds
8. Status                           (string)        Conversation status
9. body.user_message                (text)          User's input text
10. response.text_output            (text)          AI response text
11. tools_called                    (string)        List of tools invoked (comma-separated)
12. tool_count                      (int)           Number of tools used
13. tools_succeeded                 (int)           Number of successful tools
14. tools_failed                    (int)           Number of failed tools
15. tools_uncertain                 (int)           Number of tools with uncertain status
16. tool_success_rate               (float)         % of tools that succeeded
17. tool_reliability_score          (float)         Aggregate reliability metric
18. has_escalation                  (boolean)       If escalation occurred
19. has_rag_retrieval               (boolean)       If RAG was used
20. has_tracking_lookup             (boolean)       If tracking lookup was used
21. total_tool_duration_ms          (int)           Total tool execution time
22. success_determination_methods   (string)        How tool success was determined
23. AI Message                      (JSON text)     Full AI response object
24. Header                          (JSON text)     Metadata headers
25. id                              (UUID)          Trace ID
26. tools_with_uncertain_status     (string)        List of uncertain tools
27. persona                         (string)        User persona (enterprise, vip, standard) ✨ NEW
28. feature                         (string)        Feature category (scheduling, tracking, support) ✨ NEW
```

#### Trace Identification Schema ✨ NEW

**Primary Key for Annotations:**
- **Composite ID**: `{Flow Session}_{Turn_Number}`
- **Format**: UUID string + underscore + integer (e.g., `"abc-123-def_1"`, `"abc-123-def_2"`)
- **Purpose**: Uniquely identify each turn for linking annotations to CI pipeline traces
- **Export Behavior**: Include composite ID as `trace_id` column in all exports
- **Uniqueness Guarantee**: One-to-one mapping between coded rows and pipeline traces

**Why Composite ID?**
- `id` column alone may not be unique across datasets
- `Flow Session` groups conversation turns; `Turn_Number` identifies position
- CI pipeline (scripts/run_ci.py) can link annotations to golden set traces via this ID

#### Output Data Format (Export)

The application will export CSV/JSONL with all **28 input columns** plus **6 base annotation columns** plus **dynamic per-failure-mode label columns**:

| Column | Type | Values/Range | Description |
|--------|------|--------------|-------------|
| `trace_id` | String | `{Flow Session}_{Turn_Number}` | Composite unique identifier ✨ NEW |
| `first_failure_note` | Text (256 char max) | Free-form | Notes on the first identified failure or issue in the trace |
| `holistic_pass_fail` | Categorical | {Pass, Fail} | **Binary** overall evaluation (no "Partial" option) |
| `open_codes` | Text (500 char max) | **Free-form, comma-separated** | Codes assigned to this trace (e.g., "tool_failure, escalation, late_parcel_misresponse") ✨ UPDATED |
| `taxonomy_category` | Categorical | {Task Success, Escalation, Tool Failure, Knowledge Gap, Ambiguity, Other} | Higher-level category for grouping codes |
| `comments_hypotheses` | Text (1000 char max) | Free-form | Evaluator observations, hypotheses, or notes for downstream analysis |
| `needs_support_clarification` | Boolean | {true, false} | Flag indicating trace needs team discussion or is ambiguous |
| `is_golden_set` | Boolean | {true, false} | Flag: Include in CI golden set for validation ✨ NEW |

**Dynamic Per-Failure-Mode Label Columns** ✨ NEW

The application will **dynamically generate** one boolean label column for each failure mode in the living rubric:

| Column Pattern | Type | Values | Description |
|----------------|------|--------|-------------|
| `label_{failure_mode}` | Boolean | {true, false, N/A} | Binary label for this failure mode |

**Examples** (based on living_rubric.csv):
- `label_constraint_violation` - Does trace violate user constraints?
- `label_hallucination` - Does model hallucinate facts?
- `label_tone_mismatch` - Does tone violate persona rules?
- `label_structured_output_error` - Does output violate schema?
- `label_policy_hallucination` - Does response cite non-existent policy? (custom code from actual usage)
- `label_late_parcel_misresponse` - Does response fail to act on late delivery? (custom code)
- `label_no_escalation` - Did bot fail to escalate when appropriate? (custom code)

**Dynamic Schema Behavior:**
- On import, application loads `living_rubric.csv` (or equivalent rubric definition)
- Generates one `label_{failure_mode}` column per rubric row
- As rubric evolves (new failure modes added), schema expands automatically
- Evaluators see all label columns in UI; can mark true/false/N/A for each
- Export includes all label columns (even if N/A for some traces)

**Design Rationale (Living Rubric + Free-Form Open Codes):**
- **`open_codes`**: Free-form text allows discovery of new patterns inductively (course methodology)
- **`label_{failure_mode}`**: Structured binary labels enable TPR/TNR calculation for LLM judges
- **Workflow**: Evaluators discover patterns → add to open codes → during alignment, promote codes to rubric failure modes → system generates new label columns
- **Living Document**: Rubric is not fixed; evolves based on observed failure patterns in data

**Total Export Columns:** 28 (input) + 7 (base annotations) + N (dynamic labels) = **35+ columns**

### 5.2 User Roles & Permissions

#### Role: Evaluator
- View assigned traces
- Apply open codes and annotations
- Flag traces for clarification
- View own coding history and consistency metrics
- Cannot modify other evaluators' codes directly

#### Role: Lead Evaluator / Project Manager
- All Evaluator permissions
- View aggregated inter-rater agreement (IAA) metrics
- Facilitate alignment sessions (see Section 5.3)
- Update coding schema and rubric
- Manage living rubric (add/edit/delete failure modes)
- Trigger re-annotation workflows
- Export final datasets

#### Role: Admin
- All permissions
- Manage user access
- Configure coding taxonomies
- Access full audit logs
- Manage rubric versioning

### 5.3 Core Features

#### 5.3.1 Import & Dataset Management
- **CSV Upload**: Drag-and-drop or file picker for enriched trace CSV
- **Validation**: Check for required 28 columns before import
- **Rubric Loading**: Import or sync `living_rubric.csv` to generate label columns ✨ NEW
- **Versioning**: Track dataset versions (e.g., "Sendle_Nov13_v1", "Sendle_Nov13_v2_re-annotated")
- **Preview**: Show first 10 rows before confirming import

#### 5.3.2 Trace Evaluation Interface

**Single-Trace View:**
- **Left Panel: Trace Context**
  - Session metadata: Flow Session ID, Turn N of M, Conversation ID
  - Timing: Start time, duration
  - Tool performance: Tools called, success rate
  - Feature flags: Escalation, RAG retrieval, tracking lookup
  - Persona & Feature (for CI filtering) ✨ NEW

- **Center Panel: Trace Content**
  - **Conversation Context Panel** ✨ NEW (for multi-turn sessions):
    - Collapsible thread showing previous turns
    - Format:
      ```
      [Turn 1] User: "Where is my parcel?"
              Bot: "Let me check that for you..."
      [Turn 2] User: "It's been 4 days late"
              Bot: "Sometimes parcels get held up..."
      [Turn 3 - CURRENT] User: "What should I do?"
              Bot: [Current response being coded]
      ```
    - Visual indicators: Dimmed previous turns, highlighted current turn
    - Toggle: Show/hide context to focus on current turn

  - **Current Turn Display**:
    - User message (highlighted, distinct color)
    - AI response (highlighted, distinct color)
    - Tool calls (if any, with success/failure indicators)

- **Right Panel: Coding Form**
  - **Holistic Judgement**:
    - Radio buttons: Pass / Fail (binary, required)
    - Text field: `first_failure_note` (if Fail)

  - **Open Codes** (Free-Form):
    - Multi-tag input with autocomplete (suggests previously used codes)
    - Comma-separated values
    - Examples displayed: "tool_failure, escalation, policy_hallucination"

  - **Per-Failure-Mode Labels** ✨ NEW (Dynamic):
    - Section header: "Failure Mode Labels (from Living Rubric)"
    - One checkbox per failure mode:
      ```
      ☐ constraint_violation
      ☐ hallucination
      ☐ tone_mismatch
      ☐ structured_output_error
      ☐ policy_hallucination (custom)
      ☐ late_parcel_misresponse (custom)
      ... (expands as rubric evolves)
      ```
    - Tri-state: true / false / N/A (default)
    - Tooltip: Shows failure mode definition from rubric

  - **Taxonomy & Metadata**:
    - Dropdown: `taxonomy_category`
    - Text area: `comments_hypotheses`
    - Checkbox: `needs_support_clarification`
    - Checkbox: `is_golden_set` (Include in CI golden set) ✨ NEW

  - **Actions**:
    - Button: Save & Next
    - Button: Save & Previous
    - Link: Flag for Discussion (creates alignment session thread)

**Navigation:**
- Previous / Next trace buttons
- Jump to specific trace by ID
- Filter/search: by conversation ID, date range, tool usage, codes already assigned, persona, feature ✨ NEW
- Progress indicator: "47 of 100 completed (12 flagged, 23 in golden set)"

**Keyboard Shortcuts:**
- `P` - Mark Pass
- `F` - Mark Fail
- `Ctrl+S` - Save
- `Ctrl+→` - Next trace
- `Ctrl+←` - Previous trace
- `Ctrl+Shift+F` - Flag for discussion

**Auto-Save:**
- Save annotations every 30 seconds
- Save on navigation (Next/Previous)
- Visual indicator: "Saved" / "Saving..." / "Unsaved changes"

#### 5.3.3 Collaborative Annotation Workflow (Course-Aligned)

**Phase 1: Independent Annotation with Overlap for IAA**

The application will implement the AI Evals course methodology for measuring and improving inter-rater reliability:

**Step 1: Shared Annotation Set (30% Overlap)**
- **Purpose**: Measure inter-annotator agreement (IAA) and identify rubric ambiguities
- **Implementation**:
  - Admin designates 30 traces (30% of 100) as "Shared Set" for all evaluators
  - All evaluators independently code these same 30 traces
  - System enforces no communication between evaluators during this phase
  - **No discussion or collaboration allowed until IAA is measured**

**Step 2: Calculate Inter-Annotator Agreement**
- **Metrics**:
  - **Cohen's Kappa** (for 2 evaluators)
  - **Fleiss' Kappa** (for 3+ evaluators)
- **Threshold**: Target κ ≥ 0.65 (minimum acceptable), κ ≥ 0.75 (high confidence)
- **Interpretation** (Landis & Koch 1977):
  - κ < 0.40: Fair or below → Rubric needs significant refinement
  - κ = 0.41-0.60: Moderate → Rubric needs refinement
  - κ = 0.61-0.80: Substantial → Acceptable
  - κ = 0.81-1.00: Almost perfect → High confidence
- **Display**: Dashboard showing:
  - Overall Kappa score
  - Per-category agreement (for each failure mode)
  - Per-label-column agreement (for binary labels) ✨ NEW
  - List of specific traces with disagreements

**Step 3: Alignment Sessions**

The application will support structured alignment sessions to resolve disagreements and improve the rubric:

**Features for Alignment Sessions:**
1. **Disagreement View**:
   - Side-by-side comparison of annotations for traces where evaluators disagreed
   - Highlight specific fields where disagreement occurred
   - Show evaluator reasoning (from comments field)

2. **Discussion Interface**:
   - Per-trace comment threads for evaluators to explain their reasoning
   - Moderator (Lead Evaluator) can guide discussion
   - Focus question displayed: "What changes would make future annotators agree on this case?"

3. **Rubric Refinement**:
   - Inline editing of rubric definitions
   - Add new failure modes (automatically generates new label columns) ✨ NEW
   - Version control for rubric changes (track what changed and why)
   - Document reasoning behind each rubric update

4. **Resolution Workflow**:
   - **Primary goal**: Improve rubric for future consistency, not just resolve individual labels
   - **Techniques supported**:
     - Clarify wording in definitions
     - Add concrete Pass/Fail examples for edge cases
     - Add decision rules for tricky situations
     - Split criteria if one rubric covers multiple concepts
     - Promote open codes to formal failure modes ✨ NEW
   - **NOT a voting mechanism**: System discourages simple majority vote
   - **Escalation path**: Flag unresolved disagreements for project lead decision

**Step 4: Re-Annotation After Rubric Updates**
- **Trigger**: After rubric is refined, evaluators re-code traces with low agreement
- **Schema Update**: If new failure modes added, system generates new label columns ✨ NEW
- **Tracking**: System shows which traces were re-coded and why
- **Iteration**: Repeat IAA measurement to confirm improvement

**Phase 2: Distributed Annotation (70% Non-Overlapping)**
- **After IAA ≥ 0.65 is achieved**, distribute remaining 70 traces across evaluators
- Each evaluator codes disjoint subsets for efficiency
- **Spot-check**: 10% of distributed traces randomly assigned to multiple evaluators for ongoing quality control

**Key Design Principle (Course-Aligned):**
"Alignment sessions are key to improving the annotation rubric by resolving differences between annotators... The goal of the session is not to force agreement on past labels, but to understand why annotators interpreted things differently."

#### 5.3.4 Consistency & Quality Metrics
- **Per-Evaluator Metrics**:
  - Traces coded per day
  - Distribution of Pass/Fail judgements
  - Frequency of each open code applied
  - Comparison to team averages

- **Inter-Rater Agreement (IAA)**:
  - Cohen's Kappa (2 evaluators) or Fleiss' Kappa (3+ evaluators)
  - Per-category agreement scores
  - Per-label-column agreement (for binary failure mode labels) ✨ NEW
  - Flagged traces with low agreement

- **Dataset Health**:
  - % of traces coded by at least one evaluator
  - % of traces with conflicting codes
  - % of traces marked as golden set
  - Average time per trace

#### 5.3.5 Audit Trail & Version Control
- **Change Tracking**: Every annotation change logged with:
  - Timestamp
  - Evaluator ID
  - Field changed
  - Old value → New value
  - Optional reason for change

- **History View**: Per-trace timeline showing all edits
- **Revert Capability**: Roll back to previous annotation state
- **Export Audit Logs**: CSV export of full change history

#### 5.3.6 Coding Schema Management (Living Rubric Integration) ✨ UPDATED

**Living Rubric Synchronization:**
- **Import Rubric**: Upload `living_rubric.csv` or connect to rubric source
- **Schema Format**:
  ```csv
  failure_mode,definition,pass_criteria,fail_criteria,notes,examples_pass,examples_fail,owner,last_updated
  constraint_violation,"Output ignores explicit user constraints","All stated constraints are respected","Any stated constraint is missing or contradicted","Check earliest failure in trace","ex: proposes times within availability","ex: proposes meeting when calendar shows busy",Principal Reviewer,2025-10-09
  ```
- **Dynamic Column Generation**:
  - System reads `failure_mode` column from rubric
  - Generates `label_{failure_mode}` columns in annotation schema
  - Updates UI with new checkboxes for evaluators
  - Updates export schema to include new columns

**Rubric Evolution Workflow:**
1. **Discovery**: Evaluators use free-form `open_codes` to tag observed patterns
2. **Clustering**: Lead reviews frequency of open codes (e.g., "no_escalation" appears 8 times)
3. **Promotion**: Lead adds "no_escalation" to living rubric as formal failure mode
4. **Schema Update**: System automatically generates `label_no_escalation` column
5. **Re-Annotation**: System flags traces with "no_escalation" in open codes for evaluators to mark binary label
6. **Version Control**: Rubric update logged with timestamp and justification

**Rubric Versioning:**
- Track rubric version with each export (e.g., "Rubric v1.2, updated 2025-11-14")
- Link rubric changes to judge configuration updates (judges.yaml) ✨ NEW
- Historical view: "What was the rubric when this trace was coded?"

**Define Taxonomy (Top-Level Categories):**
- Admin creates hierarchical coding schema
  - Top-level categories (e.g., "Tool Failure", "Escalation Issues")
  - Sub-codes (e.g., "Tool Failure → timeout, auth_error")

- **Schema Versioning**: Track evolution of coding schema over time
- **Code Mapping**: When codes are renamed, map old → new codes automatically
- **Re-Coding Workflow**: Trigger re-annotation when schema changes significantly

#### 5.3.7 Export & Integration ✨ UPDATED

**Export Formats:**

1. **CSV Export** (Default):
   - All 28 input columns
   - 7 base annotation columns (including `trace_id`, `is_golden_set`)
   - N dynamic `label_{failure_mode}` columns
   - Total: 35+ columns (depending on rubric size)
   - Filename: `{dataset_name}_coded_{timestamp}.csv`

2. **JSONL Export** ✨ NEW (For CI Pipeline):
   - Line-delimited JSON format (one trace per line)
   - Structure per line:
     ```json
     {
       "trace_id": "abc-123-def_1",
       "Flow Session": "abc-123-def",
       "Turn_Number": 1,
       "body.user_message": "Where is my parcel?",
       "response.text_output": "Let me check that for you...",
       "open_codes": "tracking_lookup, successful_resolution",
       "holistic_pass_fail": "Pass",
       "label_constraint_violation": false,
       "label_hallucination": false,
       "label_tone_mismatch": false,
       "is_golden_set": true,
       ... (all 35+ fields as JSON key-value pairs)
     }
     ```
   - Compatible with `scripts/run_ci.py` (expects `traces/golden/golden.jsonl`)
   - Filename: `{dataset_name}_coded_{timestamp}.jsonl`

3. **Excel Export** (Optional):
   - Multi-sheet workbook:
     - Sheet 1: All coded traces (35+ columns)
     - Sheet 2: Metadata (rubric version, IAA scores, evaluator stats)
     - Sheet 3: Code frequency distribution
   - Filename: `{dataset_name}_coded_{timestamp}.xlsx`

**Export Options:**

- **Filtered Exports**:
  - "Export all coded traces" (default)
  - "Export golden set only" (where `is_golden_set = true`) ✨ NEW
    - Automatically formats as JSONL for CI pipeline
    - Saved to `traces/golden/golden.jsonl` (if integrated with homework repo)
  - "Export flagged traces only" (where `needs_support_clarification = true`)
  - "Export by persona" (filter by persona column)
  - "Export by feature" (filter by feature column)

- **Metadata Included in Export**:
  - Dataset version
  - Rubric version used for coding
  - Evaluator IDs (who coded each trace)
  - IAA scores (Cohen's/Fleiss' Kappa)
  - Timestamp of export
  - Golden set statistics (N traces, coverage of failure modes)

**Judge Validation Metadata** ✨ NEW:
- Track which traces were used to calculate judge TPR/TNR metrics
- Optional export column: `judge_validation_set` (boolean)
- Link to judges.yaml: Document which judge version was validated with which coded traces
- Export format includes judge version timestamp for traceability

**Validation Before Export:**
- Warn if some traces are incomplete (missing required fields)
- Show summary stats:
  - Traces per code frequency
  - Code distribution
  - Golden set coverage (does golden set include examples of all failure modes?)
  - IAA score (if multiple evaluators)

**Analysis-Ready Format:**
- Ensure exported CSV/JSONL is compatible with Python/pandas, SQL, R
- No special characters in column names (use underscores, not spaces)
- Consistent null handling (empty strings vs "N/A" vs null)

### 5.4 Non-Functional Requirements

#### Performance
- Load 100-trace dataset in < 5 seconds
- Display single trace in < 500ms
- Support 10 concurrent users without performance degradation
- Auto-save latency < 1 second
- Dynamic schema update (new rubric columns) in < 2 seconds

#### Reliability
- 99.5% uptime during business hours
- Automatic backups every 6 hours
- Zero data loss on server failure (via persistent storage)

#### Security
- Role-based access control (RBAC)
- Encrypted data at rest and in transit (TLS 1.3)
- Audit logs retained for 12 months
- User authentication via SSO (Google Workspace / Okta)

#### Scalability
- Support datasets up to 1000 traces in Phase 2
- Handle 20+ concurrent users in Phase 2
- Horizontal scaling via containerisation (Docker/Kubernetes)
- Dynamic schema scales to 50+ failure modes without performance degradation

---

## 6. User Experience (UX) Requirements

### 6.1 Design Principles
- **Clarity over cleverness**: Prioritise ease of understanding over novel UI patterns
- **Minimise cognitive load**: Show only relevant information for current task
- **Progressive disclosure**: Advanced features accessible but not prominent
- **Consistency**: Use standard UI patterns (buttons, forms, tables)

### 6.2 Key User Flows

#### Flow 1: Evaluator Codes a Trace (Turn-Level) ✨ UPDATED
1. Evaluator logs in → sees dashboard with assigned traces
2. Clicks "Start Coding" → system loads first un-coded trace
3. **Views conversation context** (if multi-turn):
   - Sees previous turns in collapsible panel
   - Understands conversation flow
4. Reads **current turn** content:
   - User message
   - AI response
   - Tool calls
5. Applies annotations:
   - Selects Pass/Fail for holistic judgement (binary, required)
   - Enters first failure note (if Fail)
   - **Adds open codes** (free-form, comma-separated, with autocomplete)
   - **Checks failure mode labels** (dynamic checkboxes, tri-state)
   - Selects taxonomy category
   - Adds comments/hypotheses
   - Flags if needs clarification (checkbox)
   - Checks "Include in golden set" if high-quality example
6. Clicks "Save & Next" → system saves, loads next trace
7. Repeat until all assigned traces coded

**Time Target**: < 2 minutes per trace (vs. 5 minutes in spreadsheet)

#### Flow 2: Lead Evaluator Reviews IAA & Facilitates Alignment
1. Lead logs in → sees IAA dashboard
2. Views Cohen's Kappa score (e.g., κ = 0.52, "Moderate Agreement")
3. Clicks "View Disagreements" → sees list of 12 traces where evaluators disagreed
4. Selects a trace → sees side-by-side comparison:
   - Evaluator A: Fail, codes: "tool_failure, escalation", label_constraint_violation=true
   - Evaluator B: Pass, codes: "successful_resolution", label_constraint_violation=false
5. Clicks "Start Discussion" → opens comment thread
6. Evaluators explain reasoning in comments
7. Lead identifies rubric issue: "We need clearer definition of 'successful escalation'"
8. Clicks "Update Rubric" → edits definition, adds example
9. **Promotes "successful_escalation" to formal failure mode** ✨ NEW
10. System automatically generates `label_successful_escalation` column
11. System logs rubric change
12. Lead triggers re-annotation for affected traces
13. Evaluators re-code with updated rubric and new label column
14. IAA recalculated → κ = 0.71 (Substantial Agreement)

#### Flow 3: Export Final Dataset (Golden Set for CI) ✨ UPDATED
1. Lead logs in → sees dashboard
2. Verifies all traces coded (100/100, IAA = 0.75)
3. Clicks "Export Dataset" → modal appears
4. Selects format: **"JSONL (Golden Set Only)"** ✨ NEW
5. System filters traces where `is_golden_set = true` (e.g., 30 traces)
6. Validates golden set coverage:
   - "✓ All 8 failure modes represented in golden set"
   - "✓ Golden set includes 5 Pass and 25 Fail examples"
7. Clicks "Download" → receives file: `sendle_nov13_golden_v1.jsonl`
8. File contains 30 traces with all 35+ columns in JSONL format
9. **Lead copies file to homework repository**: `traces/golden/golden.jsonl`
10. **Runs CI pipeline**: `python scripts/run_ci.py --golden traces/golden/golden.jsonl --judges configs/judges.yaml`
11. CI uses binary labels (`label_constraint_violation`, etc.) to calculate judge TPR/TNR

### 6.3 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all features
- Screen reader support
- High-contrast mode
- Adjustable font sizes

---

## 7. Open Questions & Decisions (RESOLVED - COURSE-ALIGNED)

This section documents key design decisions resolved using AI Evals course methodology:

### 7.1 How many evaluators should participate? ✅ RESOLVED

**Decision**: Start with **1 Principal Domain Expert** for Phase 1 pilot, with option to add 2nd evaluator if needed in Phase 2.

**Rationale (Course-Aligned)**:
- AI Evals course explicitly supports the "benevolent dictator" model for smaller teams/pilots
- Quote from course: "In smaller companies, the Principal Domain Expert might be the CEO or founder. If you are an independent developer, you should be the domain expert"
- For Sendle's 100-trace pilot, a single domain expert (someone with deep customer service knowledge) can maintain quality without collaboration overhead
- Multiple annotators are most valuable when criteria are subjective or require cross-functional perspectives
- **If** IAA becomes a concern during Phase 2 scaling, add a second evaluator and measure Cohen's Kappa

**Implementation**:
- Phase 1: 1 principal domain expert codes all 100 traces
- Phase 2: Optionally add 2nd evaluator; use Cohen's Kappa to validate consistency
- Application must support both single-evaluator and multi-evaluator modes

### 7.2 Should all evaluators code all traces, or should traces be distributed? ✅ RESOLVED

**Decision**: **Hybrid approach** — All evaluators code same 30% (for IAA), then distribute remaining 70%.

**Rationale (Course-Aligned)**:
- Course workflow explicitly requires shared annotation set to measure inter-rater agreement
- Quote: "Select a Shared Annotation Set: Curate a common set of 20–50 representative traces that all annotators will label... Each annotator labels all examples on their own"
- You **cannot measure Cohen's Kappa** without overlap
- After IAA is validated (κ ≥ 0.6), distributing traces is efficient and scales better

**Implementation**:
- **Phase 1a: Overlap** (Traces 1-30)
  - All evaluators code same 30 traces independently
  - Calculate IAA (Cohen's/Fleiss' Kappa)
  - Hold alignment sessions if κ < 0.65
  - Refine rubric and re-code until κ ≥ 0.65

- **Phase 1b: Distribution** (Traces 31-100)
  - Distribute remaining 70 traces across evaluators
  - Spot-check 10% for ongoing quality control

- **Application Feature**: Admin can designate "Shared Set" vs "Distributed Set" per trace

### 7.3 What is the target inter-rater reliability threshold (Cohen's Kappa)? ✅ RESOLVED

**Decision**: **κ ≥ 0.65 minimum**, **κ ≥ 0.75 target** for high confidence.

**Rationale (Course-Aligned)**:
- Course states: "In practice, we aim for κ ≥ 0.6 to ensure labelling reliability"
- Landis & Koch interpretation:
  - κ < 0.40: Fair or below → Rubric needs significant refinement
  - κ = 0.41-0.60: Moderate → Rubric needs refinement
  - κ = 0.61-0.80: Substantial → Acceptable
  - κ = 0.81-1.00: Almost perfect → High confidence
- Your Phase 1 exit criteria already specifies κ > 0.65, which aligns with course guidance
- Targeting κ ≥ 0.75 provides extra buffer for high-confidence labels that will feed automated evaluators

**Implementation**:
- Display Kappa score prominently in dashboard
- Flag when κ < 0.65 and suggest alignment session
- Provide interpretation guide (Landis & Koch) in help documentation

**Important Note (Course Caveat)**:
Cohen's Kappa is for measuring agreement between human annotators who are peers. It is **NOT** used to evaluate LLM-as-Judge performance against human labels. For that, use TPR/TNR (True Positive Rate / True Negative Rate) as per Chapter 5 of the course.

### 7.4 Should we use binary (Pass/Fail) or multi-level scales for holistic evaluation? ✅ RESOLVED

**Decision**: **Binary Pass/Fail only** (no "Partial" option).

**Rationale (Course-Aligned)**:
- Course strongly advocates for binary judgements over Likert scales
- Quote: "Likert scales introduce substantial noise when applied without a detailed rubric... In contrast, forcing binary decisions about specific failure modes produces more reproducible annotations"
- Quote: "Making a clear yes or no decision forces sharper thinking than vague scores (e.g., 3 out of 5)"
- Binary labels are cleaner inputs for automated LLM-as-Judge development
- Easier to calculate TPR/TNR for measuring judge performance

**Handling Ambiguous Cases**:
- Use `needs_support_clarification` Boolean flag instead of "Partial" label
- Flagged traces become discussion topics in alignment sessions
- Forces evaluator to make a decision (Pass or Fail) even for borderline cases, improving rubric clarity

**Implementation**:
- `holistic_pass_fail` field: Dropdown with only two options {Pass, Fail}
- `needs_support_clarification` field: Checkbox (default: false)
- UI guidance: "If unsure, pick Pass or Fail and check 'Needs Clarification' for team discussion"

### 7.5 How do we handle disagreements between evaluators? ✅ RESOLVED

**Decision**: **Structured alignment sessions** focused on improving rubric, not voting on labels.

**Rationale (Course-Aligned)**:
- Course provides detailed process in Chapter 4.4: "Facilitating Alignment Sessions and Resolving Disagreements"
- Key principle: "The goal of the session is not to force agreement on past labels, but to understand why annotators interpreted things differently"
- Techniques:
  1. Clarify wording in rubric definitions
  2. Add concrete Pass/Fail examples for edge cases
  3. Add decision rules for tricky situations
  4. Split criteria if one rubric covers multiple concepts
  5. Avoid majority vote (except as last resort)
  6. Escalation path for persistent disagreements

**What NOT to Do (Course Warnings)**:
- ❌ Don't use majority vote as primary resolution (course explicitly cautions)
- ❌ Don't force consensus without understanding root cause
- ❌ Don't skip independent annotation by discussing examples beforehand

**Implementation**:
See Section 5.3.3 "Collaborative Annotation Workflow" for detailed feature requirements:
- Disagreement detection and side-by-side view
- Discussion interface with comment threads
- Rubric versioning and inline editing
- Re-annotation workflow after rubric updates
- Escalation path to project lead

### 7.6 Should open codes be free-form or controlled vocabulary? ✅ RESOLVED

**Decision**: **Free-form with living rubric integration**.

**Rationale**:
- Open coding methodology is **inductive** (codes emerge from data, not predetermined)
- Course emphasizes theoretical saturation: continue until no new failure modes emerge
- Controlled vocabulary would constrain discovery of new patterns
- Living rubric evolves based on observed open codes

**Workflow**:
1. Evaluators use free-form `open_codes` to discover patterns
2. During alignment sessions, frequently used codes are discussed
3. Lead evaluator promotes stable codes to living rubric as formal failure modes
4. System generates binary label columns for formal failure modes
5. Rubric and schema co-evolve throughout evaluation process

**Implementation**:
- `open_codes` field: Multi-tag input with autocomplete (suggests previously used codes, but allows new entries)
- Living rubric management: Admin can add new failure modes, triggering schema updates
- Rubric versioning: Track when codes were promoted from open codes to formal failure modes

### 7.7 Turn-level vs session-level coding? ✅ RESOLVED

**Decision**: **Turn-level coding** (each turn coded independently).

**Rationale**:
- Aligns with CSV structure (100 rows = 100 turns)
- Provides finer granularity for identifying where failures occur
- Enables turn-by-turn analysis in multi-turn conversations
- Supports correlation between specific user input, bot response, and failure mode

**Implementation**:
- UI displays previous turns for context (collapsible panel)
- Annotations apply to current turn only
- Export includes turn-level annotations
- Turn-level granularity documented in Section 2 "Trace Granularity Decision"

---

## 8. Success Metrics & KPIs

### 8.1 Adoption Metrics

| Metric | Target | Why |
|--------|--------|-----|
| **Active evaluators using application** | 100% of evaluation team | Indicates tool adoption vs. spreadsheets |
| **Traces coded per evaluator per day** | 20-30 traces | Validates efficiency improvement |
| **Application sessions per week** | 3-5 sessions per evaluator | Shows sustained engagement |

### 8.2 Quality Metrics

| Metric | Target | Why |
|--------|--------|-----|
| **Inter-rater reliability (Cohen's Kappa)** | **κ ≥ 0.65** (minimum), **κ ≥ 0.75** (target) | **Course-aligned threshold** for rubric quality |
| **% of traces flagged for clarification** | 5-10% | Indicates manageable ambiguity |
| **Rubric iterations before stability** | 1-2 major revisions | Indicates efficient schema refinement |
| **% of traces requiring re-coding** | < 20% | Indicates initial rubric quality |
| **Export validation errors** | 0 (clean CSV/JSONL on first attempt) | Indicates data integrity |
| **Golden set coverage** | 100% (all failure modes represented) | Ensures CI pipeline can validate all judge criteria |

### 8.3 Operational Metrics

| Metric | Target | Why |
|--------|--------|-----|
| **Time from import to first export** | < 5 days for 100 traces | Validates complete workflow timing |
| **Number of code iterations required** | 1-2 (before settling on final schema) | Indicates efficient refinement process |
| **Audit trail completeness** | 100% (all edits captured) | Ensures traceability |
| **Data loss incidents** | 0 | Validates reliability |
| **Golden set export success rate** | 100% (no format errors) | Validates CI pipeline integration |

### 8.4 Business Impact Metrics

| Metric | Target | Why |
|--------|--------|-----|
| **Cost per trace coded** | < $5 (labour cost) | Validates ROI |
| **Traces evaluated in one sprint** | 200+ (vs. 100 in baseline) | Indicates scaling capability |
| **Improvement iterations per cycle** | 2+ (Analyse → Measure → Improve cycles per quarter) | Validates "Analyse → Measure → Improve" workflow acceleration |
| **Team velocity (time to insights)** | 40% faster than spreadsheet workflow | Validates strategic value |

### 8.5 Technical Metrics

| Metric | Target | Why |
|--------|--------|-----|
| **Application uptime** | 99.5%+ | Ensures reliability for team workflow |
| **API response time** | < 500ms (p99) | Ensures responsive UX |
| **Database query time** | < 100ms (p99) for single-trace load | Ensures fast navigation |
| **Concurrent users supported** | 10+ without performance degradation | Ensures team collaboration at scale |
| **Dynamic schema update time** | < 2 seconds (adding new failure mode) | Ensures living rubric responsiveness |

---

## 9. Success Criteria Definition

### Phase 1: Pilot (Sendle Dataset, 100 traces)

**Timeline**: 2-4 weeks

**Entry Criteria**:
- MVP deployed with core functionality (import, evaluate, export CSV/JSONL)
- Living rubric integration functional (dynamic label columns)
- 1-3 evaluators ready to participate (1 principal domain expert minimum)
- Initial draft rubric defined

**Exit Criteria** (Course-Aligned):
- All 100 traces coded (turn-level)
- **Inter-rater reliability (Kappa) ≥ 0.65** (if multiple evaluators) or principal domain expert validation complete
- < 5% data validation errors on export
- Successful JSONL export of golden set (30 traces, all failure modes represented)
- Team lead satisfaction > 7/10 NPS
- Audit trail completeness 100%
- Rubric stabilised (< 20% schema changes after initial definition)
- **Theoretical saturation approached** (no fundamentally new failure modes emerging in final 20 traces)
- Golden set successfully imported into `traces/golden/golden.jsonl` and validated by CI pipeline

**Go/No-Go Decision**:
- If exit criteria met: Move to Phase 2 (scale to new datasets)
- If exit criteria not met: Iterate on product based on feedback (e.g., UX improvements, schema refinement) and re-test

### Phase 2: Scale (New Datasets, 500-1000 traces)

**Timeline**: 4-8 weeks

**Entry Criteria**:
- Phase 1 successful
- Additional features implemented (e.g., bulk operations, advanced filtering)
- Infrastructure scaled for larger dataset
- Living rubric proven stable (< 10% changes per 100 traces)

**Exit Criteria**:
- 500+ traces coded with same quality metrics as Phase 1 (κ ≥ 0.65 if multiple evaluators)
- Performance metrics (response time, uptime) maintained
- Team velocity 40% faster than spreadsheet workflow
- Cost per trace < $5
- Golden set exports used in production CI pipeline with 0 format errors

**Go/No-Go Decision**:
- If exit criteria met: Move to Phase 3 (public release or integration into standard workflow)
- If exit criteria not met: Optimise performance/UX and re-test

---

## Appendix A: Sendle Dataset Summary

**Dataset**: 100 conversation traces from Sendle's production chatbot
**Collection Date**: November 13, 2025 (07:34–08:55 UTC)
**Sessions**: 39 unique sessions
- Multi-turn: 27 sessions
- Single-turn: 12 sessions

**Conversation Length**:
- Longest: 9 turns
- Average (multi-turn): 3.3 turns
- Median: 2 turns

**Tool Usage**:
- 57 traces with tool calls (57%)
- 43 traces without tool calls (43%)
- Tools used: escalateToAgent, searchDocuments, tracking_lookup, update_ticket_metadata
- Aggregate tool reliability: 100% (after Sendle-specific enrichment logic)

**Trace Granularity**: Turn-level (100 traces = 100 individual message exchanges)

---

## Appendix B: Data Schema Details

### Existing Columns (28)

See Section 5.1 for full schema definition.

### New Columns to be Added (7 base + N dynamic)

| Column | Type | Values/Range | Description |
|--------|------|--------------|-------------|
| `trace_id` | String | `{Flow Session}_{Turn_Number}` | Composite unique identifier |
| `first_failure_note` | Text (256 char max) | Free-form | Notes on the first identified failure or issue in the trace |
| `holistic_pass_fail` | Categorical | **{Pass, Fail}** | **Binary** overall evaluation (**no "Partial"** — course-aligned) |
| `open_codes` | Text (500 char max) | **Free-form, comma-separated** | Codes assigned from inductive analysis |
| `taxonomy_category` | Categorical | {Task Success, Escalation, Tool Failure, Knowledge Gap, Ambiguity, Other} | Higher-level category for grouping codes |
| `comments_hypotheses` | Text (1000 char max) | Free-form | Evaluator observations, hypotheses, or notes for downstream analysis |
| `needs_support_clarification` | Boolean | {true, false} | Flag indicating trace needs team discussion (replaces "Partial" option) |
| `is_golden_set` | Boolean | {true, false} | Flag: Include in CI golden set for validation |

**Dynamic Label Columns** (N columns, where N = number of failure modes in living rubric):
| Column Pattern | Type | Values | Description |
|----------------|------|--------|-------------|
| `label_{failure_mode}` | Boolean | {true, false, N/A} | Binary label for this failure mode (e.g., `label_constraint_violation`, `label_hallucination`) |

**Total Export Columns**: 28 (input) + 7 (base) + N (dynamic) = **35+ columns**

---

## Appendix C: Organisational Alignment

### AI Evals Course Lifecycle Integration

```
[Analyse Phase]
    └─ Open Coding Web App
       ├─ Import traces (BotDojo CSV)
       ├─ Evaluate & code (turn-level, human-in-the-loop)
       ├─ Measure IAA (Cohen's/Fleiss' Kappa)
       ├─ Facilitate alignment sessions
       ├─ Refine living rubric (iterative, add failure modes)
       ├─ Apply per-failure-mode binary labels
       ├─ Curate golden set (flag high-quality examples)
       └─ Export enriched data (CSV + JSONL for CI)

[Measure Phase]
    └─ Quantitative Analysis & CI Pipeline
       ├─ Load golden set JSONL (scripts/run_ci.py)
       ├─ Run LLM judges against human labels
       ├─ Compute judge TPR/TNR per failure mode
       ├─ Calculate corrected success rates
       ├─ Create dashboards
       └─ Report findings

[Improve Phase]
    └─ Implementation
       ├─ Identify root causes (from codes + metrics)
       ├─ Design improvements (prompts, tools, data)
       ├─ Deploy changes
       └─ Collect new traces (loop back to Analyse)
```

### Stakeholder Alignment

| Stakeholder | Interest | How Product Serves |
|-------------|----------|-------------------|
| **Evaluation Team** | Efficient, high-quality coding | Streamlined UI, multi-turn context, collaboration tools, consistency metrics |
| **Data Scientists** | Clean, exportable data | CSV/JSONL export, validated schema, audit trail, golden set curation |
| **Team Lead** | Oversight, traceability | Dashboard, audit log, consistency reports, IAA metrics, rubric management |
| **ML Engineers** | Judge validation data | Per-failure-mode binary labels, golden set exports, TPR/TNR tracking metadata |
| **Course Instructors** | Teaching AI Evals methodology | Product exemplifies best practices in Analyse phase |
| **Executives** | ROI, scalability | Faster time-to-insight, cost per trace, scale capability |

---

## Appendix D: AI Evals Course Methodology Integration

### Key Course Principles Applied

This product brief integrates the following principles from *Application-Centric AI Evals for Engineers & TPMs* (Hamel Husain & Shreya Shankar, 2025):

1. **Binary Pass/Fail Judgements** (Chapter 3.7)
   - "Making a clear yes or no decision forces sharper thinking than vague scores"
   - Avoids noise from Likert scales without detailed rubrics

2. **Inter-Annotator Agreement via Cohen's Kappa** (Chapter 4.3)
   - "In practice, we aim for κ ≥ 0.6 to ensure labelling reliability"
   - Accounts for chance agreement, unlike simple percent agreement

3. **Structured Alignment Sessions** (Chapter 4.4)
   - "The goal is not to force agreement on past labels, but to understand why annotators interpreted things differently"
   - Focus on improving rubric for future consistency

4. **Principal Domain Expert Model** (Chapter 4.1)
   - "In smaller companies, the Principal Domain Expert might be the CEO or founder"
   - Supports single-evaluator workflows for efficient pilots

5. **Theoretical Saturation** (Chapter 3.3)
   - "Proceed until at least 20 bad traces are labelled and no fundamentally new failure modes are appearing"
   - 100 traces is a heuristic, not a strict requirement

6. **Open Coding → Axial Coding Workflow** (Chapter 3.3-3.4)
   - Start with unstructured observations (free-form open codes)
   - Cluster into coherent failure modes iteratively (promote to living rubric)
   - Avoid pre-defining categories before seeing data

7. **Turn-Level Granularity** (Inferred from Course Examples)
   - Coding individual turns enables precise failure identification
   - Multi-turn context helps understand conversation flow

### Course References

- Husain, H. & Shankar, S. (2025). *Application-Centric AI Evals for Engineers & TPMs*. Parlance Labs.
- Cohen, J. (1960). A coefficient of agreement for nominal scales. *Educational and Psychological Measurement*, 20(1), 37-46.
- Landis, J.R. & Koch, G.G. (1977). The measurement of observer agreement for categorical data. *Biometrics*, 33(1), 159-174.
- Glaser, B.G. & Strauss, A.L. (2017). *Discovery of Grounded Theory: Strategies for Qualitative Research*. Routledge.

---

## Appendix E: Integration with AI Evals Homework Repository ✨ NEW

This appendix documents how the Open Coding Web App integrates with the AI Evals course homework repository structure.

### File Format Mappings

**Import (from repository to app):**
- Source: `traces/sample/enriched_traces_sendle.csv` (28 columns)
- Action: Upload CSV to app
- Validation: Check for required 28 columns (including `persona`, `feature`)

**Export (from app to repository):**
- Destination: `traces/golden/golden.jsonl` (for CI pipeline)
- Format: JSONL (line-delimited JSON)
- Filter: Export only traces where `is_golden_set = true`
- Columns: All 35+ columns (28 input + 7 base + N dynamic labels)

### Trace ID Linking

**Composite ID Generation:**
```python
trace_id = f"{row['Flow Session']}_{row['Turn_Number']}"
# Example: "abc-123-def-456_1", "abc-123-def-456_2"
```

**Usage in CI Pipeline:**
- `scripts/run_ci.py` reads `traces/golden/golden.jsonl`
- Each JSON object has `trace_id` field
- Judge evaluations can be linked back to human labels via `trace_id`
- TPR/TNR calculation: Compare judge output to `label_{failure_mode}` fields

### Golden Set Export Workflow

**Step-by-step:**
1. Evaluator codes traces in app
2. Evaluator checks `is_golden_set` for high-quality, representative examples
3. Lead validates golden set coverage:
   - All failure modes represented? (check frequency table)
   - Mix of Pass/Fail examples? (check holistic_pass_fail distribution)
   - Diverse personas and features? (check persona/feature columns)
4. Lead clicks "Export Golden Set Only (JSONL)"
5. App generates `sendle_nov13_golden_v1.jsonl`
6. Lead copies file to homework repository: `traces/golden/golden.jsonl`
7. Run CI: `python scripts/run_ci.py --golden traces/golden/golden.jsonl --judges configs/judges.yaml --ci configs/ci_suite.yaml`

### Living Rubric Synchronization

**Rubric File Location:**
- Repository: `rubrics/living_rubric.csv`
- Format:
  ```csv
  failure_mode,definition,pass_criteria,fail_criteria,notes,examples_pass,examples_fail,owner,last_updated
  constraint_violation,"Output ignores explicit user constraints","All stated constraints are respected","Any stated constraint is missing or contradicted","Check earliest failure in trace","ex: proposes times within availability","ex: proposes meeting when calendar shows busy",Principal Reviewer,2025-10-09
  ```

**Synchronization Workflow:**
1. App imports `living_rubric.csv` on dataset load
2. Generates `label_{failure_mode}` columns from `failure_mode` column
3. Evaluators code traces (including binary labels)
4. During alignment sessions, new failure modes discovered
5. Lead updates `living_rubric.csv` in repository (adds row)
6. Lead re-imports rubric into app
7. App generates new label column(s)
8. App flags previously coded traces for re-annotation (to add new labels)
9. Export includes updated schema

**Rubric Versioning:**
- Repository: Track rubric changes via git commits
- App: Store rubric version metadata with each export (e.g., "Rubric SHA: abc123")
- Link: Exported traces include rubric version for reproducibility

### Judge Configuration Integration

**Mapping Failure Modes to Judges:**
- Repository: `configs/judges.yaml`
- Structure:
  ```yaml
  judges:
    - id: tone_match_v1
      criterion: tone_mismatch  # Must match failure_mode in living_rubric.csv
      model: gpt-5-mini
      prompt_file: evaluators/llm_judges/judge_prompt.md
      tpr: 0.86   # True Positive Rate (measured against human gold)
      tnr: 0.91   # True Negative Rate
  ```

**Integration Logic:**
- `criterion` field in judges.yaml must match `failure_mode` in living_rubric.csv
- Coded traces include `label_{criterion}` (e.g., `label_tone_mismatch`)
- CI pipeline compares judge output to human label for TPR/TNR validation

**Updating Judge TPR/TNR:**
1. Export golden set with human labels
2. Run judges on golden set: `scripts/run_ci.py`
3. Compute confusion matrix per judge:
   - True Positives: Judge says true, human says true
   - False Positives: Judge says true, human says false
   - True Negatives: Judge says false, human says false
   - False Negatives: Judge says false, human says true
4. Calculate TPR = TP / (TP + FN), TNR = TN / (TN + FP)
5. Update `judges.yaml` with new TPR/TNR values
6. Commit changes to repository

### CI Suite Filter Support

**Filter Expressions:**
- Repository: `configs/ci_suite.yaml`
- Example:
  ```yaml
  checks:
    - name: tone_match_on_persona_examples
      judge_id: tone_match_v1
      filter: "persona in ['enterprise','vip']"
      min_pass_rate: 0.95
  ```

**App Support:**
- Input columns include `persona` and `feature` (columns 27-28)
- Evaluators see persona/feature values during coding
- Export includes persona/feature for filtering
- CI pipeline applies filter before running judge

**Usage:**
```python
# In scripts/run_ci.py (pseudocode)
golden_traces = load_jsonl("traces/golden/golden.jsonl")
filtered_traces = [t for t in golden_traces if eval(check['filter'], t)]
# Example: eval("persona in ['enterprise','vip']", trace) → True/False
judge_results = run_judge(filtered_traces, judge_id)
pass_rate = sum(judge_results) / len(judge_results)
assert pass_rate >= check['min_pass_rate'], f"Failed: {check['name']}"
```

### Monitoring Integration (Future)

**Placeholder for Phase 2:**
- `scripts/monitor.py` samples production traces for offline evaluation
- Coded traces could be used to:
  - Validate sampling strategy (are sampled traces representative?)
  - Provide ground truth for monitoring dashboards
  - Track drift in failure mode distribution over time

**Out of Scope for Phase 1:**
- Real-time monitoring integration
- Automatic sampling based on coded trace statistics

---

## Document Approval & Ownership

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Product Manager** | [To be assigned] | | |
| **Engineering Lead** | [To be assigned] | | |
| **Stakeholder Lead** | [To be assigned] | | |

---

**End of Document**

---

**Document Change Log**:

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v1.0 | 13 Nov 2025 | Initial draft | Zaf |
| v1.1 | 13 Nov 2025 | Integrated AI Evals course methodology; resolved open questions in Section 7; updated Section 5.1 (binary Pass/Fail), Section 5.3.3 (collaborative workflow), Section 8.2 (Kappa thresholds), Section 9 (exit criteria); added Appendix D | Zaf |
| v1.2 | 13 Nov 2025 | **CI Integration Update**: Added trace granularity decision (turn-level), updated data schema (28 input columns, dynamic label columns), added JSONL export, multi-turn context display, golden set curation, living rubric synchronization, judge integration hooks, TPR/TNR tracking, persona/feature filtering; added Appendix E (homework repository integration) | Zaf |

---

**How to Use This Brief**:
1. **For Decision-Making**: Use Sections 1-4 to understand the product vision and business case
2. **For Design**: Use Sections 5-6 for functional and technical requirements
3. **For Engineering**: Use Section 5 and Appendices for detailed specifications
4. **For QA**: Use Section 8 for success metrics and acceptance criteria
5. **For Course Alignment Validation**: Review Appendix D and resolved questions in Section 7
6. **For CI Integration**: Review Appendix E for file formats, golden set workflow, and rubric synchronization

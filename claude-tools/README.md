# BotDojo Trace Enrichment Skill

> **Transform BotDojo conversation traces with accurate tool success metrics through contextual interpretation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)
[![Python 3.7+](https://img.shields.io/badge/python-3.7+-blue.svg)](https://www.python.org/downloads/)

## Overview

The BotDojo Trace Enrichment skill solves a critical problem in LLM agent evaluation: **systematic under-reporting of tool success rates** caused by non-standard response formats. By applying contextual interpretation to tool responses, this skill transforms misleading metrics into accurate performance data.

### The Problem

When you export conversation traces from BotDojo and analyse tool performance, you might see something like this:

```
Overall tool health: 50% (2/4 tools working) ❌
├─ searchDocuments: 0% success ❌ FALSE NEGATIVE
├─ update_ticket_metadata: 0% success ❌ FALSE NEGATIVE  
├─ escalateToAgent: 100% success ✅
└─ tracking_lookup: 80% success ✅
```

This happens because:
1. **searchDocuments** returns `{results: "..."}` without a `success` field
2. **update_ticket_metadata** returns `success: false` when "no updates needed" (actually a success)
3. Naive parsing treats both as failures

### The Solution

After enrichment with contextual interpretation:

```
Overall tool health: 90% (4/4 tools working) ✅
├─ searchDocuments: 100% success ✅ CORRECTED
├─ update_ticket_metadata: 78% success ✅ CORRECTED
├─ escalateToAgent: 100% success ✅
└─ tracking_lookup: 80% success ✅
```

## Quick Start

```bash
# Install dependencies
pip install pandas --break-system-packages

# Enrich your BotDojo export
python scripts/enrich_traces.py input.csv output.csv

# Compare before/after metrics
python scripts/compare_enrichments.py input.csv output.csv
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BotDojo Trace Enrichment                      │
│                         Data Pipeline                            │
└─────────────────────────────────────────────────────────────────┘

INPUT: BotDojo CSV Export
│
├─ Flow Session
├─ Start Time / End Time
├─ User Message
├─ AI Message (JSON with tool calls)
└─ Status
│
▼
┌─────────────────────────────────────────────────────────────────┐
│                     ENRICHMENT PROCESS                           │
└─────────────────────────────────────────────────────────────────┘
│
│  Step 1: Parse AI Message JSON
│  ├─ Extract tool steps
│  └─ Filter out thinking/output steps
│
│  Step 2: Contextual Tool Success Determination
│  ├─ searchDocuments → Check 'results' field
│  ├─ update_ticket_metadata → Check for "no updates needed"
│  └─ Standard tools → Trust 'success' field
│
│  Step 3: Calculate Metrics
│  ├─ tool_success_rate = succeeded / (succeeded + failed)
│  ├─ tool_reliability_score = (succeeded + uncertain) / total
│  └─ Track determination methods
│
│  Step 4: Add Session Context
│  ├─ Turn numbers
│  ├─ Session length
│  └─ Sort by longest sessions first
│
▼
OUTPUT: Enriched CSV
│
├─ All original columns
├─ tools_called, tools_succeeded, tools_failed, tools_uncertain
├─ tool_success_rate, tool_reliability_score
├─ has_escalation, has_rag_retrieval, has_tracking_lookup
├─ total_tool_duration_ms
├─ success_determination_methods
├─ Turn_Number, Total_Turns_in_Session
└─ zendesk_conversation_id
```

## Core Functions

### 1. `extract_tool_name(step: dict) -> Optional[str]`

**Purpose**: Normalise tool names across BotDojo's inconsistent naming conventions.

**How it works**:
```python
# BotDojo uses different names in different contexts
TOOL_NAME_MAP = {
    'Update ticket information': 'update_ticket_metadata',
    'Search Documents Tool': 'searchDocuments',
}
```

**Flow**:
```
┌──────────────┐
│  Step Object │
└──────┬───────┘
       │
       ▼
  ┌─────────────────┐
  │ Extract stepLabel│
  └────────┬─────────┘
           │
           ▼
    ┌──────────────┐      Yes    ┌──────────────────┐
    │ In name map? ├─────────────►│ Return canonical │
    └──────┬───────┘              │      name        │
           │ No                    └──────────────────┘
           ▼
    ┌──────────────┐
    │Return as-is  │
    └──────────────┘
```

**Use case**: Ensures consistent tool tracking regardless of how BotDojo names them internally vs display.

---

### 2. `determine_tool_success(tool_name: str, content: any) -> Tuple[bool, bool, str]`

**Purpose**: Apply tool-specific logic to determine if a tool call succeeded, failed, or is uncertain.

**Returns**: `(succeeded: bool, failed: bool, method: str)`

**Decision Flow**:
```
┌─────────────────────────────────────────────────────────────────┐
│              Tool Success Determination Logic                    │
└─────────────────────────────────────────────────────────────────┘

Content is string?
│
├─ Yes → Try parse as JSON
│        ├─ Success → Continue to tool logic
│        └─ Fail → Is text present?
│                  ├─ Yes → SUCCESS (inferred_from_text)
│                  └─ No → FAILED (empty_response)
│
└─ No → Use as object
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                    Tool-Specific Logic                         │
└───────────────────────────────────────────────────────────────┘

Is tool "searchDocuments"?
│
├─ Yes → Has 'results' field?
│        ├─ Yes → Is results non-empty?
│        │        ├─ Yes → SUCCESS (contextual_searchDocuments)
│        │        └─ No → FAILED
│        └─ No → FAILED
│
├─ Is tool "update_ticket_metadata"?
│  │
│  └─ Yes → Message contains "no update needed" phrases?
│           ├─ Yes → SUCCESS (contextual_update_ticket)
│           └─ No → Has success=true field?
│                   ├─ Yes → SUCCESS
│                   └─ No → FAILED
│
└─ Standard tool → Has 'success' field?
                   ├─ Yes → success=true?
                   │        ├─ Yes → SUCCESS (standard_success_field)
                   │        └─ No → FAILED
                   │
                   └─ No → Has substantial content?
                           ├─ Yes → SUCCESS (inferred_from_content)
                           └─ No → UNCERTAIN
```

**Example - searchDocuments**:
```python
# Input
{
  "results": "Retrieved 3 documents about shipping policies..."
}

# Determination
if 'results' in content_obj:
    results = content_obj['results']
    if isinstance(results, str):
        succeeded = bool(results.strip())  # Non-empty = success
        
# Output: (succeeded=True, failed=False, method="contextual_searchDocuments")
```

**Example - update_ticket_metadata**:
```python
# Input (false negative case)
{
  "success": false,
  "message": "No updates required - ticket information is already current"
}

# Determination
message = str(content_obj.get('message', '')).lower()
no_update_phrases = ['no update', 'already current', 'not required']

if any(phrase in message for phrase in no_update_phrases):
    succeeded = True  # "No updates needed" = SUCCESS!
    
# Output: (succeeded=True, failed=False, method="contextual_update_ticket")
```

---

### 3. `extract_tool_calls(ai_message_str: str) -> Dict`

**Purpose**: Parse the entire AI Message JSON, extract all tool calls, and apply contextual success determination.

**Returns**:
```python
{
    'tools_called': ['searchDocuments', 'update_ticket_metadata'],
    'tools_succeeded': ['searchDocuments', 'update_ticket_metadata'],
    'tools_failed': [],
    'tools_uncertain': [],
    'tool_count': 2,
    'has_escalation': False,
    'has_rag_retrieval': True,
    'has_tracking_lookup': False,
    'total_tool_duration_ms': 1250,
    'tool_steps': [...],  # Detailed step info
    'determination_methods': [
        'searchDocuments:contextual_searchDocuments',
        'update_ticket_metadata:contextual_update_ticket'
    ]
}
```

**Flow**:
```
┌────────────────┐
│ AI Message JSON│
└───────┬────────┘
        │
        ▼
┌───────────────────┐
│ Parse JSON steps  │
└────────┬──────────┘
         │
         ▼
    ┌─────────────────────┐
    │ For each step       │
    └──────┬──────────────┘
           │
           ├─► Is thinking/output? → Skip
           │
           ├─► Is tool step? → Continue
           │                   │
           │                   ▼
           │            ┌──────────────────┐
           │            │ Extract tool name│
           │            └────────┬─────────┘
           │                     │
           │                     ▼
           │            ┌──────────────────────────┐
           │            │ determine_tool_success() │
           │            └────────┬─────────────────┘
           │                     │
           │                     ▼
           │            ┌──────────────────────┐
           │            │ Add to succeeded/    │
           │            │ failed/uncertain     │
           │            └──────────────────────┘
           │                     │
           │                     ▼
           │            ┌──────────────────────┐
           │            │ Calculate duration   │
           │            └──────────────────────┘
           │                     │
           │                     ▼
           │            ┌──────────────────────┐
           │            │ Track tool type flags│
           │            │ (escalation, RAG, etc)│
           │            └──────────────────────┘
           │
           └─► Next step
```

---

### 4. `calculate_tool_metrics(tool_data: Dict) -> Dict`

**Purpose**: Calculate aggregated success metrics from tool call results.

**Formulas**:

```
tool_success_rate = succeeded / (succeeded + failed)
                    [Excludes uncertain tools]

tool_reliability_score = (succeeded + uncertain) / total
                         [Assumes uncertain tools probably worked]
```

**Example**:
```python
# Input
tool_data = {
    'tools_succeeded': ['searchDocuments', 'escalateToAgent'],
    'tools_failed': ['tracking_lookup'],
    'tools_uncertain': ['custom_tool']
}

# Calculation
succeeded = 2
failed = 1
uncertain = 1
total = 4

tool_success_rate = 2 / (2 + 1) = 0.667 (66.7%)
tool_reliability_score = (2 + 1) / 4 = 0.750 (75.0%)

# Output
{
    'tool_success_rate': 0.667,
    'tool_reliability_score': 0.750,
    'tools_with_uncertain_status': 1
}
```

**When to use each metric**:
- **tool_success_rate**: Strict evaluation - only count definite successes
- **tool_reliability_score**: Forgiving evaluation - assume uncertain tools worked

---

### 5. `enrich_trace(row: pd.Series) -> pd.Series`

**Purpose**: Enrich a single trace row with all tool data and metrics.

**Process**:
```
┌──────────────┐
│  Trace Row   │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│Extract AI Message  │
└────────┬───────────┘
         │
         ▼
┌─────────────────────────┐
│ extract_tool_calls()    │
│ (gets all tool data)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│Add columns:             │
│├─ tools_called          │
│├─ tools_succeeded       │
│├─ tools_failed          │
│├─ tools_uncertain       │
│├─ tool_count            │
│├─ has_escalation        │
│├─ has_rag_retrieval     │
│├─ has_tracking_lookup   │
│└─ total_tool_duration_ms│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│calculate_tool_metrics() │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│Add metric columns:      │
│├─ tool_success_rate     │
│├─ tool_reliability_score│
│└─ success_determination_│
│   methods               │
└────────┬────────────────┘
         │
         ▼
┌──────────────┐
│Enriched Row  │
└──────────────┘
```

---

### 6. `group_and_enrich(input_file: str, output_file: str)`

**Purpose**: Main orchestration function - processes entire CSV with session grouping and statistics.

**Complete Flow**:
```
┌──────────────────────────────────────────────────────────────────┐
│                    Main Enrichment Pipeline                       │
└──────────────────────────────────────────────────────────────────┘

1. Load CSV
   ├─ Read input file with pandas
   └─ Validate 'Flow Session' column exists

2. Sort & Group
   ├─ Convert 'Start Time' to datetime
   ├─ Sort by ['Flow Session', 'Start Time']
   └─ Add turn numbers per session
       └─ Turn_Number = cumcount() + 1
       └─ Total_Turns_in_Session = session size

3. Enrich Each Row
   ├─ Apply enrich_trace() to all rows
   └─ Extract Zendesk conversation ID from Header

4. Sort by Session Length
   ├─ Calculate session lengths
   ├─ Sort: longest sessions first
   └─ Purpose: Prioritise complex conversations for analysis

5. Reorder Columns
   ├─ Priority columns first (Turn, Session, Tools, etc)
   └─ Original columns after

6. Write Output
   └─ Save enriched CSV

7. Generate Statistics
   ├─ Overall counts (traces, sessions, tool usage)
   ├─ Average success rates
   └─ Per-tool statistics
       └─ For each tool: success rate, call count
```

**Output Statistics Example**:
```
=== Enrichment Statistics ===
Total traces: 150
Total sessions: 45
Traces with tools: 142
Traces with escalation: 12
Traces with RAG: 89
Traces with tracking lookup: 54

=== Tool Success Statistics ===
Average tool success rate: 85.2%
Average tool reliability score: 91.3%

=== Per-Tool Statistics ===
searchDocuments: 100% success (89/89 calls)
update_ticket_metadata: 78% success (70/89 calls)
escalateToAgent: 100% success (12/12 calls)
tracking_lookup: 80% success (43/54 calls)
```

## Output Columns

### New Columns Added

| Column | Type | Description |
|--------|------|-------------|
| `Turn_Number` | int | Turn number within the session (1, 2, 3...) |
| `Total_Turns_in_Session` | int | Total turns in this session |
| `tools_called` | string | Comma-separated list of tools called |
| `tool_count` | int | Number of tools called in this trace |
| `tools_succeeded` | string | Comma-separated list of successful tools |
| `tools_failed` | string | Comma-separated list of failed tools |
| `tools_uncertain` | string | Comma-separated list of uncertain tools |
| `tool_success_rate` | float | Success rate 0-1 (excludes uncertain) |
| `tool_reliability_score` | float | Reliability score 0-1 (includes uncertain as success) |
| `tools_with_uncertain_status` | int | Count of uncertain tools |
| `has_escalation` | boolean | TRUE if escalateToAgent was called |
| `has_rag_retrieval` | boolean | TRUE if searchDocuments was called |
| `has_tracking_lookup` | boolean | TRUE if tracking_lookup was called |
| `total_tool_duration_ms` | int | Total milliseconds spent in tool calls |
| `success_determination_methods` | string | Semicolon-separated tool:method pairs |
| `zendesk_conversation_id` | string | Extracted from Header JSON |

## Use Cases

### 1. Research & Evaluation

**Scenario**: Building evaluators for LLM agent performance (Chapter 5 research)

```python
import pandas as pd

df = pd.read_csv('enriched_traces.csv')

# Evaluator: Did RAG retrieval work?
def eval_rag_success(trace):
    if 'searchDocuments' not in trace['tools_called']:
        return None  # Not applicable
    
    return 1.0 if 'searchDocuments' in trace['tools_succeeded'] else 0.0

# Apply to all traces
df['rag_success'] = df.apply(eval_rag_success, axis=1)

# Calculate performance
rag_performance = df['rag_success'].mean()
print(f"RAG Success Rate: {rag_performance:.1%}")
```

### 2. Quality Analysis

**Scenario**: Finding conversations where tools genuinely failed

```python
# Find real failures (not false negatives)
genuine_failures = df[
    (df['tools_failed'] != '') & 
    (df['tool_success_rate'] < 0.5)
].sort_values('tool_success_rate')

# Export for manual review
genuine_failures.to_csv('failures_to_investigate.csv', index=False)
```

### 3. Multi-Turn Analysis

**Scenario**: Track tool reliability across conversation turns

```python
# Group by session
sessions = df.groupby('Flow Session')

for session_id, traces in sessions:
    success_rates = traces['tool_success_rate'].dropna()
    
    if len(success_rates) > 1:
        # Check if reliability degraded
        if success_rates.iloc[-1] < success_rates.iloc[0] - 0.3:
            print(f"Session {session_id}: Tool reliability degraded 30%+")
```

### 4. Tool Performance Dashboard

**Scenario**: Create aggregated metrics for visualisation

```python
# Calculate per-tool statistics
tools = ['searchDocuments', 'update_ticket_metadata', 'escalateToAgent']

tool_stats = []
for tool in tools:
    tool_traces = df[df['tools_called'].str.contains(tool, na=False)]
    
    stats = {
        'tool': tool,
        'total_calls': len(tool_traces),
        'avg_success_rate': tool_traces['tool_success_rate'].mean(),
        'avg_duration_ms': tool_traces['total_tool_duration_ms'].mean() / tool_traces['tool_count'].mean()
    }
    tool_stats.append(stats)

# Export for Tableau/PowerBI
pd.DataFrame(tool_stats).to_csv('tool_dashboard.csv', index=False)
```

## Extending the Skill

### Adding Support for Custom Tools

If your BotDojo instance has custom tools with non-standard formats:

**Step 1**: Document the format in `references/tool-formats.md`

```markdown
### my_custom_tool

**Observed format:**
```json
{
  "data": {"result": "success"},
  "status": "ok"
}
```

**Success indicators:**
- `status` = "ok"
- `data` field present and non-empty
```

**Step 2**: Add detection logic to `scripts/enrich_traces.py`

```python
# In determine_tool_success() function (around line 114)

elif tool_name == 'my_custom_tool':
    method = "contextual_my_custom_tool"
    
    status = content_obj.get('status')
    has_data = 'data' in content_obj and content_obj['data']
    
    if status == 'ok' and has_data:
        succeeded = True
    else:
        failed = True
```

**Step 3**: Add name mapping if needed

```python
# In extract_tool_name() function (around line 27)

TOOL_NAME_MAP = {
    'My Custom Tool Display Name': 'my_custom_tool',
    # ... existing mappings
}
```

**Step 4**: Test on sample traces

```bash
python scripts/enrich_traces.py sample.csv test_output.csv
# Check the success_determination_methods column
```

## Troubleshooting

### Issue: Unexpected Success Rates

**Symptom**: Tool showing 0% or 100% when you expect different

**Solution**: Check the `success_determination_methods` column

```python
import pandas as pd
df = pd.read_csv('enriched.csv')

# Find traces with searchDocuments
search_traces = df[df['tools_called'].str.contains('searchDocuments', na=False)]

# Check determination methods
print(search_traces[['tools_called', 'tools_succeeded', 'success_determination_methods']].head())
```

Look for:
- `contextual` - Tool-specific logic used ✅
- `standard` - Used success field (might be wrong for special tools)
- `inferred` - Guessed from content (low confidence)
- `uncertain` - No clear indicator (needs investigation)

### Issue: High Uncertain Count

**Symptom**: Many tools in `tools_uncertain` column

**Solution**: These tools need custom detection logic

```python
# Find uncertain tools
uncertain_tools = df['tools_uncertain'].str.split(',').explode().value_counts()
print(uncertain_tools)

# Output might show:
# custom_api_call    45
# legacy_tool        23
```

Add detection logic for these tools following the "Extending the Skill" guide.

### Issue: Tool Names Not Recognised

**Symptom**: Tool appears in `tools_called` but not properly tracked

**Solution**: Add name mapping

```bash
# Check what names BotDojo is using
python -c "
import pandas as pd
df = pd.read_csv('input.csv')
tools = df['AI Message'].str.extract(r'\"stepLabel\":\"([^\"]+)\"')[0].value_counts()
print(tools)
"
```

Add any unfamiliar names to `TOOL_NAME_MAP` in `extract_tool_name()`.

## Validation

### Sanity Checks

The enrichment script includes built-in validation. You can add custom checks:

```python
import pandas as pd

df = pd.read_csv('enriched.csv')

# Check 1: Success rate should never exceed 1.0
assert (df['tool_success_rate'] <= 1.0).all(), "Invalid success rates found"

# Check 2: If no tools called, success rate should be null
assert df[df['tool_count'] == 0]['tool_success_rate'].isna().all()

# Check 3: Tool counts should match
def verify_counts(row):
    if row['tool_count'] == 0:
        return True
    
    succeeded = len([t for t in str(row['tools_succeeded']).split(',') if t.strip()])
    failed = len([t for t in str(row['tools_failed']).split(',') if t.strip()])
    uncertain = len([t for t in str(row['tools_uncertain']).split(',') if t.strip()])
    
    return succeeded + failed + uncertain == row['tool_count']

assert df.apply(verify_counts, axis=1).all(), "Tool count mismatch found"

print("✅ All validation checks passed")
```

### Comparison Analysis

Use the comparison script to validate enrichment:

```bash
python scripts/compare_enrichments.py before.csv after.csv
```

Expected output shows:
- Tools with major success rate changes (searchDocuments: 0% → 100%)
- Overall metrics improvement
- Determination method distribution
- Uncertain tools requiring attention

## Performance

**Processing Speed**: ~500-1000 traces/second on modern hardware

**Memory Usage**: Approximately 100MB per 10,000 traces

**Recommendations**:
- For >50,000 traces: Process in batches
- For >100,000 traces: Use chunked CSV reading

```python
# Example batch processing
import pandas as pd

chunk_size = 10000
for chunk in pd.read_csv('large_file.csv', chunksize=chunk_size):
    enriched_chunk = chunk.apply(enrich_trace, axis=1)
    # Process or save chunk
```

## Contributing

To contribute improvements:

1. Test on sample BotDojo exports
2. Document new tool formats in `references/tool-formats.md`
3. Add detection logic to `determine_tool_success()`
4. Update this README with examples
5. Validate with comparison script

## License

MIT License - see [LICENSE.txt](LICENSE.txt)

## Author

Created for BotDojo platform analysis and LLM agent evaluation research.

## Citation

If you use this skill in research, please cite:

```bibtex
@software{botdojo_trace_enrichment,
  title={BotDojo Trace Enrichment: Contextual Tool Success Determination},
  author={Your Name},
  year={2025},
  url={https://github.com/yourusername/botdojo-trace-enrichment}
}
```

## Support

For issues or questions:
- Check the Troubleshooting section
- Review `references/` documentation
- Examine sample traces with `success_determination_methods` column

---

**Version**: 2.0  
**Last Updated**: November 2025  
**Python**: 3.7+  
**Dependencies**: pandas

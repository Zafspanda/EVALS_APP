# Sendle Design System - Button Component Analysis

## Current Naive UI Button Usage

Based on codebase analysis, here are the button patterns currently in use:

### Button Types/Variants Used
1. **Success** (`type="success"`) - Green button for positive actions
   - Used in: `AnnotationForm.vue` - "Pass & Next" button
   
2. **Error** (`type="error"`) - Red button for destructive actions
   - Used in: `AnnotationForm.vue` - "Mark as Fail" and "Save & Next" (fail form)
   
3. **Primary** (`type="primary"`) - Default primary action button
   - Used in: `AnnotationForm.vue` - "Save Comment & Next"
   - Used in: `HomeView.vue` - "Start Coding" button
   
4. **Default** (no type specified) - Secondary/neutral actions
   - Used in: `AnnotationForm.vue` - "Skip", "Cancel" buttons
   - Used in: `HomeView.vue` - "Import CSV", "View All Traces"
   - Used in: `AppHeader.vue` - "Sign In" button

### Button Sizes Used
- **Large** (`size="large"`) - Used in `HomeView.vue` for "Start Coding"
- **Small** (`size="small"`) - Used in `TraceList.vue` for table action buttons
- **Default** (no size) - Most buttons use default size

### Button Props Used
- `@click` - Click handler
- `:loading` - Loading state (boolean)
- `type` - Button variant (success, error, primary, default)
- `size` - Button size (small, large, default)

### Button Locations
1. **AnnotationForm.vue** - 7 buttons total
   - Quick actions: Pass & Next (success), Skip (default), Mark as Fail (error)
   - Form actions: Cancel (default), Save Comment & Next (primary)
   - Fail form: Cancel (default), Save & Next (error)

2. **HomeView.vue** - 3 buttons
   - Start Coding (primary, large)
   - Import CSV (default)
   - View All Traces (default)

3. **AppHeader.vue** - 1 button
   - Sign In (default)

4. **TraceList.vue** - Dynamic buttons in table
   - View button (small) for each row

5. **TraceViewer.vue** - Navigation buttons
   - Previous/Next buttons

6. **CsvImporter.vue** - Upload action button

## What to Look For in Sendle Design System

When exploring the Sendle Design System documentation at https://sendle.github.io/sendle-design-system/, document:

### 1. Component Name
- What is the component called? (e.g., `Button`, `SButton`, `SendleButton`)

### 2. Variants/Types
- Primary variant
- Secondary variant
- Success variant (for positive actions)
- Error/Danger variant (for destructive actions)
- Warning variant
- Ghost/Text variant
- Link variant

### 3. Sizes
- Small
- Medium (default)
- Large
- Extra large (if available)

### 4. Props/API
- `variant` or `type` prop name
- `size` prop name
- `disabled` prop
- `loading` prop
- `icon` prop (if supported)
- `fullWidth` or `block` prop
- Any other props

### 5. Installation & Import
```javascript
// Document the import pattern
import { Button } from '@sendle/design-system'
// or
import Button from '@sendle/design-system/Button'
```

### 6. Usage Examples
Document examples for each variant:
```vue
<!-- Primary button -->
<Button variant="primary" @click="handleClick">
  Click me
</Button>

<!-- Success button -->
<Button variant="success" :loading="isLoading">
  Save
</Button>

<!-- Error button -->
<Button variant="error" size="large">
  Delete
</Button>
```

### 7. Styling & Theming
- How to customize colors
- CSS variables/tokens used
- Theme support

### 8. Accessibility
- Keyboard navigation
- ARIA attributes
- Focus states

## Migration Mapping

| Current Naive UI | Location | Sendle Replacement | Priority |
|-----------------|----------|-------------------|----------|
| `n-button type="success"` | AnnotationForm.vue | `Button variant="success"` | High |
| `n-button type="error"` | AnnotationForm.vue | `Button variant="error"` | High |
| `n-button type="primary"` | AnnotationForm.vue, HomeView.vue | `Button variant="primary"` | High |
| `n-button` (default) | Multiple files | `Button variant="secondary"` or default | High |
| `n-button size="large"` | HomeView.vue | `Button size="large"` | Medium |
| `n-button size="small"` | TraceList.vue | `Button size="small"` | Medium |
| `n-button :loading` | Multiple | `Button :loading` | High |

## Next Steps

1. Visit https://sendle.github.io/sendle-design-system/ and navigate to Button component docs
2. Document the exact API, props, and usage patterns
3. Create a proof-of-concept migration in one component (suggest starting with `AppHeader.vue`)
4. Test all button variants and sizes
5. Update this document with actual Sendle API details
6. Create migration plan for all button instances

## Questions to Answer

- [ ] What is the exact component name and import path?
- [ ] What are all available variants?
- [ ] What are all available sizes?
- [ ] Does it support loading states?
- [ ] Does it support icons?
- [ ] What props are required vs optional?
- [ ] Are there any breaking differences from Naive UI?
- [ ] How do we handle button groups/spacing?
- [ ] What CSS classes or tokens are used?


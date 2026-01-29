

## Plan: Add Manual Save Button to Category Management

Transform the Category Manager from a dialog-based editing approach to inline editing with a prominent yellow save button that appears after making changes.

---

### Current Behavior

The Category Manager currently uses a modal dialog for editing:
1. Click "Edit" button on a category row
2. Dialog opens with form fields
3. Make changes and click "Save Changes" in the dialog

---

### New Behavior

Enable inline editing directly in the table with a manual save workflow:
1. Edit Phom translations directly in the table cells (text inputs instead of static text)
2. Changes are tracked locally
3. A yellow "Save All Changes" button appears below the table when there are unsaved changes
4. Click the yellow button to save all pending changes at once

---

### Implementation Details

**1. Add Local State for Edits**
- Track which categories have been modified
- Store pending changes in a local state object
- Compare against original values to detect changes

**2. Convert Table Cells to Editable Inputs**
- Replace static text display with Input components for:
  - Singular Phom Name
  - Plural Phom Name (phom_name)
- Keep Module Name and Audio columns as display-only

**3. Add Yellow Save Button**
- Positioned below the table
- Yellow/amber styling for visibility
- Only visible when there are pending changes
- Shows count of modified categories
- Loading state while saving

**4. Batch Save Logic**
- Save all modified categories in sequence
- Show success/error toast for each
- Clear pending changes on successful save
- Refresh categories list after save

---

### UI Changes

| Element | Before | After |
|---------|--------|-------|
| Singular Phom | Static text | Editable input |
| Plural Phom | Static text | Editable input |
| Save Button | In dialog | Yellow button below table |
| Edit Button | Opens dialog | Removed (inline editing) |

---

### Technical Changes

```text
src/components/admin/CategoryManager.tsx
+--------------------------------------------+
|  Table with editable input cells           |
|  - Input for Singular Phom                 |
|  - Input for Plural Phom                   |
|  - Audio play buttons (unchanged)          |
|  - Remove Edit button from Actions         |
+--------------------------------------------+
|  [Yellow Save Button - appears when        |
|   changes detected]                        |
|  "Save X Changes"                          |
+--------------------------------------------+
```

**State Management:**
- `pendingChanges: Record<string, { singular_phom_name?: string; phom_name?: string }>`
- `hasChanges: boolean` - computed from pendingChanges
- `isSaving: boolean` - loading state

**Save Function:**
- Iterates through pendingChanges
- Calls `ContentService.updateCategory()` for each modified category
- Shows toast notifications for success/failure
- Clears pendingChanges and refreshes data on completion

---

### Result

Admins can quickly edit multiple category Phom translations in one session and save all changes with a single click on the prominent yellow button. This streamlines the workflow for managing module titles.


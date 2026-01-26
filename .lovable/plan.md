

## Plan: Show Only "Bible Books" in Module Header

This plan removes the singular form ("Bible Book") from the Bible Books module header, so only "Bible Books" is displayed.

---

### Database Change

**Update the `categories` table to remove the singular_name:**

```sql
UPDATE public.categories 
SET singular_name = NULL 
WHERE name = 'Bible Books';
```

---

### What Changes

**Before:**
The module header card shows:
- "Bible Book" (singular form with divider)
- "Bible Books" (plural form)

**After:**
The module header card shows:
- "Bible Books" only

---

### No Code Changes Required

The `ModuleTitleWithAudio` component already handles this case - it only displays the singular section when `singular_name` or `singular_phom_name` exists. By setting `singular_name` to NULL, the singular section will automatically hide.

---

### Technical Details

| Field | Current Value | New Value |
|-------|---------------|-----------|
| `singular_name` | "Bible Book" | NULL |

The component logic at line 70-75 checks `hasSingularForm = category?.singular_name || category?.singular_phom_name` - when both are NULL, the singular section is not rendered.



## Plan: Remove Incorrect "Bible Vocabulary" Header from Bible Vocabularies Module

The Bible Vocabularies module header is incorrectly showing "Bible Vocabulary" with the Phom translation "Daülangpü Laihing Shang" (which actually means "Holy Bible," not "Bible Vocabulary"). This appears as a separate flashcard-like section at the top of the page.

---

### What Will Be Removed

The header currently displays:

| Field | Current Value | Issue |
|-------|---------------|-------|
| English (Singular) | Bible Vocabulary | Displayed incorrectly at top |
| Phom (Singular) | Daülangpü Laihing Shang | This means "Holy Bible", not "Bible Vocabulary" |

After the fix, only the plural header "Bible Vocabularies" with "Daülangpü Laihing Shang" will remain, which is the correct module title.

---

### Database Change

A database migration will clear the singular form fields from the "Bible Vocabularies" category:

```sql
UPDATE categories
SET singular_name = NULL,
    singular_phom_name = NULL,
    singular_audio_url = NULL
WHERE name = 'Bible Vocabularies';
```

This removes the incorrect "Bible Vocabulary" / "Daülangpü Laihing Shang" section from the module header, so only the main title "Bible Vocabularies" remains visible.

---

### No Frontend Changes Required

The `ModuleTitleWithAudio` component already handles null singular fields correctly - it only shows the singular section when `singular_name` or `singular_phom_name` exists. By clearing these database values, the UI will automatically stop showing that section.

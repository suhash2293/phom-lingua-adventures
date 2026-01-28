
## Plan: Add "Angel" Flashcard to Bible Vocabularies

Add a new flashcard for "Angel" (singular form) between "Holy Spirit" and "Angels" in the Bible Vocabularies module.

---

### Current Order

| Sort Order | English | Phom |
|------------|---------|------|
| 11 | Holy Spirit | Daülangpü Laangha |
| 12 | Angels | Phongshandhü |

---

### Solution

Since the vocabulary data is stored in the Supabase `content_items` table (not hardcoded), we need to:

1. **Shift existing items**: Update all items with `sort_order >= 12` to increment by 1
2. **Insert new item**: Add "Angel" with `sort_order = 12`

---

### Database Migration

```sql
-- Step 1: Get the Bible Vocabularies category ID
-- Step 2: Shift all items with sort_order >= 12 up by 1
UPDATE content_items
SET sort_order = sort_order + 1
WHERE category_id = (SELECT id FROM categories WHERE name = 'Bible Vocabularies')
  AND sort_order >= 12;

-- Step 3: Insert the new "Angel" vocabulary item
INSERT INTO content_items (category_id, phom_word, english_translation, sort_order)
VALUES (
  (SELECT id FROM categories WHERE name = 'Bible Vocabularies'),
  'Phongshan',
  'Angel',
  12
);
```

---

### Result

| Sort Order | English | Phom |
|------------|---------|------|
| 11 | Holy Spirit | Daülangpü Laangha |
| **12** | **Angel** | **Phongshan** |
| 13 | Angels | Phongshandhü |

---

### Note on Phom Translation

The singular form "Angel" is translated as **"Phongshan"** (derived from the plural "Phongshandhü" which means "Angels"). If you have a different Phom translation for "Angel", please let me know and I can adjust accordingly.

---

### Technical Details

- **Table**: `content_items`
- **Category**: Bible Vocabularies
- **No code changes required** - the `BibleVocabPage.tsx` already fetches and displays all items from the database dynamically

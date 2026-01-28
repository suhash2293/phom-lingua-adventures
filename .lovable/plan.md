

## Plan: Update "Holy Spirit" Phom Translation

Update the Phom translation for "Holy Spirit" from "Daülangpü Laangha" to "Laangha Daülangpü" in the Bible Vocabularies module.

---

### Current Record

| English | Current Phom | Sort Order |
|---------|--------------|------------|
| Holy Spirit | Daülangpü Laangha | 11 |

---

### Updated Record

| English | New Phom | Sort Order |
|---------|----------|------------|
| Holy Spirit | **Laangha Daülangpü** | 11 |

---

### Database Migration

```sql
UPDATE content_items 
SET phom_word = 'Laangha Daülangpü', updated_at = now()
WHERE id = '53846c95-9243-458a-848f-cd7028e98ded';
```

---

### Technical Details

- **Table**: `content_items`
- **Record ID**: `53846c95-9243-458a-848f-cd7028e98ded`
- **Field**: `phom_word`
- **No code changes required** - the flashcard data is fetched dynamically from the database


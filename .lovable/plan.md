

## Plan: Add "Saviour" Flashcard to Bible Vocabularies

### What Will Be Done

Insert a new content item into the `content_items` database table for the Bible Vocabularies category with:

- **English Translation:** Saviour
- **Phom Word:** Yiangbü
- **Sort Order:** 32 (placed after Satan at 31)
- **Audio:** Will show "No Audio" initially; you can upload the MP3 file later via the Admin Dashboard

### Technical Details

**Database Change:** A single SQL INSERT into the `content_items` table:

```sql
INSERT INTO content_items (category_id, english_translation, phom_word, sort_order)
VALUES (
  'd8880536-7d1b-425b-87fc-eaf21c242ae5',
  'Saviour',
  'Yiangbü',
  32
);
```

No code changes are needed -- the `BibleVocabPage.tsx` already renders all content items from this category automatically. Once the record is inserted, the new flashcard will appear at the end of the grid.

### After Implementation

To add audio later:
1. Go to the **Admin Dashboard**
2. Find the "Saviour" entry under Bible Vocabularies
3. Upload the MP3 audio file
4. The flashcard's "Listen" button will then become active


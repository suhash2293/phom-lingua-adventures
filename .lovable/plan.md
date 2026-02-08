

## Plan: Add "Pray" Flashcard to Bible Vocabularies

### What Will Be Done

Insert a new content item into the `content_items` database table for the Bible Vocabularies category with:

- **English Translation:** Pray
- **Phom Word:** Phoppü
- **Sort Order:** 28 (placed after Grace at 27)
- **Audio:** Will show "No Audio" initially; you can upload the MP3 file later via the Admin Dashboard

### Technical Details

**Database Change:** A single SQL INSERT into the `content_items` table:

```sql
INSERT INTO content_items (category_id, english_translation, phom_word, sort_order)
VALUES (
  'd8880536-7d1b-425b-87fc-eaf21c242ae5',
  'Pray',
  'Phoppü',
  28
);
```

No code changes are needed -- the `BibleVocabPage.tsx` already renders all content items from this category automatically. Once the record is inserted, the flashcard will appear at the end of the grid.

### After Implementation

To add the audio file:
1. Go to the **Admin Dashboard**
2. Find the "Pray" entry under Bible Vocabularies
3. Upload the MP3 audio file
4. The flashcard's "Listen" button will then become active


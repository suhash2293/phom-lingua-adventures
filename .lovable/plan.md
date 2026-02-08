

## Plan: Add "Church2" Flashcard to Bible Vocabularies

### What Will Be Done

Insert a new content item into the `content_items` database table for the Bible Vocabularies category with:

- **English Translation:** Church2
- **Phom Word:** Attoi
- **Description (italic):** A formal meaning of "Church" as found in the Bible
- **Sort Order:** 25 (placed after Church1 at 23, and before Glory at 26)

### Technical Details

**Database Change:** A single SQL INSERT into the `content_items` table:

```sql
INSERT INTO content_items (category_id, english_translation, phom_word, example_sentence, sort_order)
VALUES (
  'd8880536-7d1b-425b-87fc-eaf21c242ae5',
  'Church2',
  'Attoi',
  'A formal meaning of "Church" as found in the Bible',
  25
);
```

No code changes are needed -- the `BibleVocabPage.tsx` already renders the `example_sentence` field in italics below the Phom word on each flashcard (this is how Church1's description is displayed too).

### Result

A new flashcard will appear in the Bible Vocabularies module showing:
- **Title:** Church2
- **Phom translation:** Attoi
- **Italic description:** A formal meaning of "Church" as found in the Bible
- Audio will show "No Audio" until an audio file is uploaded via the Admin Dashboard

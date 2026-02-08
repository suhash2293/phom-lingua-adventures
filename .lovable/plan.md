

## Plan: Add "Esther Greetings" Flashcard to Greetings Module

### What Will Be Done

Insert a new content item into the `content_items` database table for the Greetings category with:

- **English Translation:** Esther Greetings
- **Phom Word:** Mohimanpü Esther selam/Mongongpü Esther Selam
- **Description (italic):** Translates for Blessed Esther/Happy Esther
- **Sort Order:** 7 (placed after "Merry Christmas" at sort_order 6)
- **Audio:** Will show "No Audio" initially; you can upload the MP3 file later via the Admin Dashboard

### How the Description Will Appear

The description text will be stored in the `example_sentence` database field, which is already rendered in italics on each Greetings flashcard. No code changes are needed.

### Technical Details

**Database Change:** A single SQL INSERT into the `content_items` table:

```text
INSERT INTO content_items (category_id, english_translation, phom_word, example_sentence, sort_order)
VALUES (
  '4f90edf0-e38d-4edb-8e4a-1eb99131a5bc',
  'Esther Greetings',
  'Mohimanpü Esther selam/Mongongpü Esther Selam',
  'Translates for Blessed Esther/Happy Esther',
  7
);
```

No code changes are needed -- the `GreetingsPage.tsx` already renders all content items from the Greetings category automatically, and the `example_sentence` field is displayed in italics beneath the Phom word.


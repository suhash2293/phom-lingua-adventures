

## Plan: Add "Phom Day/ Monyiu Greetings" Flashcard to Greetings Module

### What Will Be Done

Insert a new content item into the `content_items` database table for the Greetings category with:

- **English Translation:** Phom Day/ Monyiu Greetings
- **Phom Word:** Phom Day selam/Monyiu selam
- **Sort Order:** 8 (placed after "Esther Greetings" at sort_order 7)
- **Audio:** Will show "No Audio" initially; you can upload the MP3 file later via the Admin Dashboard

### Technical Details

**Database Change:** A single SQL INSERT into the `content_items` table:

```text
INSERT INTO content_items (category_id, english_translation, phom_word, sort_order)
VALUES (
  '4f90edf0-e38d-4edb-8e4a-1eb99131a5bc',
  'Phom Day/ Monyiü Greetings',
  'Phom Day selam/Monyiü selam',
  8
);
```

No code changes are needed -- the `GreetingsPage.tsx` already renders all content items from the Greetings category automatically.


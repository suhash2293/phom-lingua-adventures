

## Plan: Add "Merry Christmas" Flashcard to Greetings Module

### What Will Be Done

Insert a new content item into the `content_items` database table for the Greetings category with:

- **English Translation:** Merry Christmas
- **Phom Word:** Kristmas selam/Mongongpü Kristmas selam
- **Description (italic):** Although there are various ways to express greetings for "Merry Christmas", the above-mentioned ones are commonly used by the Phoms
- **Sort Order:** 6 (placed after "New Year Greetings" at sort_order 5)
- **Audio:** Will show "No Audio" initially; you can upload the MP3 file later via the Admin Dashboard

### How the Description Will Appear

The description text will be stored in the `example_sentence` database field, which is already rendered in italics on each Greetings flashcard. No code changes are needed -- the existing card template handles this automatically.

### Technical Details

**Database Change:** A single SQL INSERT into the `content_items` table:

```text
INSERT INTO content_items (category_id, english_translation, phom_word, example_sentence, sort_order)
VALUES (
  '4f90edf0-e38d-4edb-8e4a-1eb99131a5bc',
  'Merry Christmas',
  'Kristmas selam/Mongongpü Kristmas selam',
  'Although there are various ways to express greetings for "Merry Christmas", the above-mentioned ones are commonly used by the Phoms',
  6
);
```

No code changes are needed -- the `GreetingsPage.tsx` already renders all content items from the Greetings category automatically, and the `example_sentence` field is displayed in italics beneath the Phom word.

### After Implementation

To add audio later:
1. Go to the **Admin Dashboard**
2. Find the "Merry Christmas" entry under Greetings
3. Upload the MP3 audio file
4. The flashcard's "Listen" button will then become active


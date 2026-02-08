

## Plan: Add "New Year Greetings" Flashcard to Greetings Module

### What Will Be Done

Insert a new content item into the `content_items` database table for the Greetings category with:

- **English Translation:** New Year Greetings
- **Phom Word:** Bung jaa selam/ Mongongpü bung jaa selam
- **Description (italic):** Although there can be a varied ways of greeting "Happy New Year" the above mentioned ones are common greetings used by the Phom masses
- **Sort Order:** 5 (placed after "Good afternoon/Good evening" at sort_order 4)
- **Audio:** Will show "No Audio" initially; you can upload the MP3 file later via the Admin Dashboard

### How the Description Will Appear

The description text will be stored in the `example_sentence` database field, which is already rendered in italics on each Greetings flashcard. No code changes are needed -- the existing card template handles this automatically.

### Technical Details

**Database Change:** A single SQL INSERT into the `content_items` table:

```text
INSERT INTO content_items (category_id, english_translation, phom_word, example_sentence, sort_order)
VALUES (
  '<greetings-category-id>',
  'New Year Greetings',
  'Bung jaa selam/ Mongongpü bung jaa selam',
  'Although there can be a varied ways of greeting "Happy New Year" the above mentioned ones are common greetings used by the Phom masses',
  5
);
```

No code changes are needed -- the `GreetingsPage.tsx` already renders all content items from the Greetings category automatically, and the `example_sentence` field is displayed in italics beneath the Phom word.

### After Implementation

To add audio later:
1. Go to the **Admin Dashboard**
2. Find the "New Year Greetings" entry under Greetings
3. Upload the MP3 audio file
4. The flashcard's "Listen" button will then become active


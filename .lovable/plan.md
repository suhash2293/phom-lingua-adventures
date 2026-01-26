

## Plan: Add New Greeting Flashcard

This plan adds a new greeting flashcard for "Good afternoon/Good evening" with the Phom translation "Ommei" to the Greetings module.

---

### Database Change

**Insert new content item into `public.content_items`:**

| Field | Value |
|-------|-------|
| `category_id` | `4f90edf0-e38d-4edb-8e4a-1eb99131a5bc` (Greetings) |
| `english_translation` | Good afternoon/Good evening |
| `phom_word` | Ommei |
| `sort_order` | 4 |
| `example_sentence` | NULL |
| `audio_url` | NULL |

**SQL Migration:**
```sql
INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order)
VALUES (
  '4f90edf0-e38d-4edb-8e4a-1eb99131a5bc',
  'Good afternoon/Good evening',
  'Ommei',
  4
);
```

---

### Result

After this change, the Greetings module will display 4 flashcards:

| English | Phom | Order |
|---------|------|-------|
| Good morning | Nepmei | 1 |
| Good day | Nyihmei | 2 |
| Good night | Nyakmei | 3 |
| Good afternoon/Good evening | **Ommei** | 4 |

---

### No Code Changes Required

The existing `GreetingsPage.tsx` component dynamically fetches and displays all content items from the Greetings category. Adding this database entry will automatically show the new flashcard with the "Listen" button (audio can be uploaded later via Admin Dashboard).


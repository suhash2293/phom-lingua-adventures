

## Plan: Add "Shepherd" Flashcard to Bible Vocabularies

Add a new flashcard for "Shepherd" with Phom translation "Miyombü" to the Bible Vocabularies module.

---

### New Flashcard Details

| Field | Value |
|-------|-------|
| English | Shepherd |
| Phom Translation | Miyombü |
| Sort Order | 24 |
| Audio | Ready for upload |

---

### Database Insert

```sql
INSERT INTO content_items (
  category_id,
  english_translation,
  phom_word,
  sort_order,
  audio_url
) VALUES (
  'd8880536-7d1b-425b-87fc-eaf21c242ae5',
  'Shepherd',
  'Miyombü',
  24,
  NULL
);
```

---

### Audio Upload Process

After the flashcard is created:
1. Navigate to Admin Dashboard > Content Management
2. Find the "Shepherd" flashcard
3. Upload the MP3 audio file using the edit form
4. The audio URL will be automatically updated in the database

---

### Technical Details

- **Table**: `content_items`
- **Category**: Bible Vocabularies (`d8880536-7d1b-425b-87fc-eaf21c242ae5`)
- **Position**: After "Church" (sort_order 24)
- **Audio**: Initially NULL, can be uploaded via Admin Dashboard


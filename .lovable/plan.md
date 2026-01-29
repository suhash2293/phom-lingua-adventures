

## Plan: Add "Glory" Flashcard to Bible Vocabularies

Add a new flashcard for "Glory" with Phom translation "Müknyenshekhang" to the Bible Vocabularies module.

---

### Current State

The Bible Vocabularies module currently has 24 flashcards, with the highest `sort_order` being 24 (Shepherd/Miyombü).

---

### Database Insert

| Field | Value |
|-------|-------|
| English Translation | Glory |
| Phom Word | Müknyenshekhang |
| Category ID | d8880536-7d1b-425b-87fc-eaf21c242ae5 |
| Sort Order | 25 |
| Audio URL | NULL (ready for upload) |

```sql
INSERT INTO content_items (
  category_id,
  phom_word,
  english_translation,
  sort_order,
  audio_url
) VALUES (
  'd8880536-7d1b-425b-87fc-eaf21c242ae5',
  'Müknyenshekhang',
  'Glory',
  25,
  NULL
);
```

---

### Audio Upload

After the flashcard is created, you can upload the MP3 audio file via:

**Admin Dashboard → Content Management → Edit the "Glory" flashcard → Upload Audio**

The audio file will be stored in the `audio-files` storage bucket and automatically linked to this flashcard.

---

### Result

The "Glory" flashcard will appear in the Bible Vocabularies module with audio playback capability once the MP3 is uploaded.



## Plan: Add "Grace" Flashcard to Bible Vocabularies

Add a new flashcard for "Grace" with Phom translation "Phahji" to the Bible Vocabularies module.

---

### Current State

The Bible Vocabularies module currently has these highest sort_order items:
- Glory (Müknyenshekhang) - sort_order 26
- Shepherd (Miyombü) - sort_order 24

The "Grace" flashcard will use `sort_order` 27.

---

### Database Insert

| Field | Value |
|-------|-------|
| English Translation | Grace |
| Phom Word | Phahji |
| Category ID | d8880536-7d1b-425b-87fc-eaf21c242ae5 |
| Sort Order | 27 |
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
  'Phahji',
  'Grace',
  27,
  NULL
);
```

---

### Audio Upload

After the flashcard is created, you can upload the MP3 audio file via:

**Admin Dashboard → Content Management → Edit the "Grace" flashcard → Upload Audio**

The audio file will be stored in the `audio-files` storage bucket and automatically linked to this flashcard.

---

### Result

The "Grace" flashcard will appear in the Bible Vocabularies module alongside other vocabulary items, with audio playback capability once the MP3 is uploaded.

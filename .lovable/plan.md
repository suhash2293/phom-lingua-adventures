

## Plan: Add Bible Vocabulary Words to Common Bible Vocabularies Section

This plan adds 17 new vocabulary words to the "Common Bible vocabularies" section in the Bible Books module.

---

### Current State

The existing vocabulary items use these sort_order values:
- Verse (Lüng): -1
- Chapter (Laiphong): -2
- Bible (Laihing): -3
- Holy Bible (Daülangpü Laihing): -4
- Gospel (Shahjangmei): -5

---

### New Vocabulary Items

The following 17 items will be added with sort_order values from -6 to -22:

| Sort Order | English | Phom Translation |
|------------|---------|------------------|
| -6 | God | Kahvang |
| -7 | Jesus | Jisu |
| -8 | Christ | Krista |
| -9 | Jesus Christ | Jisu Krista |
| -10 | Lord | Shembüpa |
| -11 | Holy Spirit | Daülangpü Laangha |
| -12 | Angels | Phongshandhü |
| -13 | Prayer | Phoppü |
| -14 | Fasting | Lakmeilayung ei phoppü |
| -15 | Faith | Hinglempü |
| -16 | Love | Bampü |
| -17 | Sin | Mang |
| -18 | Salvation | Yemleipü |
| -19 | Heaven | Vangsho |
| -20 | Hell | Molo aw |
| -21 | Cross | Shophang |
| -22 | Church | Phopshem/Khümshem |

---

### Database Changes

A database migration will insert all 17 vocabulary items into the `content_items` table linked to the "Bible Books" category. Each item will have:
- `audio_url`: Set to `NULL` initially
- `sort_order`: Sequential from -6 to -22

---

### After Implementation

To enable MP3 audio for each vocabulary word:
1. Go to **Admin Dashboard → Content Items**
2. Filter by "Bible Books" category
3. Upload audio files for each new vocabulary item

The audio buttons will show "Listen" once files are uploaded.

---

### Technical Details

**Database Migration:**
```sql
INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'God', 'Kahvang', -6, NULL FROM categories WHERE name = 'Bible Books';
-- (Repeated for all 17 items)
```

No frontend code changes are needed - the existing `BibleBooksPage.tsx` already displays vocabulary items with sort_order between -1 and -99.




## Plan: Add Description to "Church" Flashcard

Add an explanatory note to the "Church" flashcard explaining that both Phom translations are interchangeable.

---

### Current State

| Field | Current Value |
|-------|---------------|
| English | Church |
| Phom Translation | Phopshem/Khümshem |
| Description | (empty) |

---

### Proposed Changes

| Field | New Value |
|-------|-----------|
| Phom Translation | Phomshem/Khümshem |
| Description | Both vocabularies are used interchangeably as it carries the same meaning |

**Note:** I noticed the current spelling is "Phopshem" but you mentioned "Phomshem" - I'll update this to the correct spelling as well.

---

### Database Update

```sql
UPDATE content_items 
SET 
  phom_word = 'Phomshem/Khümshem',
  example_sentence = 'Both vocabularies are used interchangeably as it carries the same meaning',
  updated_at = now()
WHERE id = '5e518a7f-f99f-41e1-a1b0-91efc25be695';
```

---

### Technical Details

- **Table**: `content_items`
- **Record ID**: `5e518a7f-f99f-41e1-a1b0-91efc25be695`
- **Field Used**: `example_sentence` (repurposed for description/notes)
- The description will appear on the Church flashcard in the Bible Vocabularies module


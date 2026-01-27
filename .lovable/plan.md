

## Plan: Separate "Common Bible Vocabularies" into a Standalone Learning Module

This plan creates a new independent learning module for Bible Vocabularies, moving it out of the Bible Books module.

---

### Overview

Currently, the Bible Books module contains 22 vocabulary items (sort_order -1 to -22) displayed in the "Common Bible vocabularies" section. These will be moved to a new standalone module accessible from the home page.

---

### Database Changes

**1. Create a new category:**

| Field | Value |
|-------|-------|
| name | Bible Vocabularies |
| description | Learn common Bible vocabularies in Phom dialect |
| phom_name | Daülangpü Laihing Shang |
| singular_name | Bible Vocabulary |
| singular_phom_name | Daülangpü Laihing Shang |

**2. Move vocabulary items to the new category:**

Update all content items in "Bible Books" with sort_order between -22 and -1 to point to the new "Bible Vocabularies" category instead. The sort_order values will be updated to positive values (1-22) for proper ordering in the new module.

---

### File Changes

**1. New file: `src/pages/BibleVocabPage.tsx`**

A new learning module page following the existing pattern from GreetingsPage:
- Uses `ModuleTitleWithAudio` component for the header
- Fetches content from the new "Bible Vocabularies" category
- Uses an emerald green color theme (matching the current vocabulary section styling)
- Displays flashcards in a responsive grid layout
- Includes audio playback functionality

**2. Update `src/App.tsx`**

- Import the new `BibleVocabPage` component
- Add route: `/bible-vocab`

**3. Update `src/pages/Index.tsx`**

- Add "Bible Vocabularies" entry to `moduleConfig` with:
  - Icon: `BookOpen` (matching Bible theme)
  - Route: `/bible-vocab`
  - Color theme: Emerald green gradient
  - Description: "Learn common Bible vocabularies in Phom dialect"
- Add "Bible Vocabularies" to `moduleOrder` array (position after "Bible Books")

**4. Update `src/pages/BibleBooksPage.tsx`**

- Remove the "Common Bible vocabularies" section entirely (lines 108-154)
- Remove filtering for vocabulary items (line 82)
- The page will now only display Old Testament and New Testament sections

---

### Technical Details

**Database Migration SQL:**

```text
-- Step 1: Create new category
INSERT INTO categories (name, description, phom_name, singular_name, singular_phom_name)
VALUES ('Bible Vocabularies', 'Learn common Bible vocabularies in Phom dialect', 
        'Daülangpü Laihing Shang', 'Bible Vocabulary', 'Daülangpü Laihing Shang');

-- Step 2: Move content items and update sort_order
UPDATE content_items 
SET category_id = (SELECT id FROM categories WHERE name = 'Bible Vocabularies'),
    sort_order = ABS(sort_order)  -- Convert negative to positive
WHERE category_id = (SELECT id FROM categories WHERE name = 'Bible Books')
AND sort_order < 0 AND sort_order > -100;
```

**New Page Structure (BibleVocabPage.tsx):**

```text
- Container with standard padding
- Back button to home
- ModuleTitleWithAudio header (emerald theme)
- Responsive grid of vocabulary flashcards
- Each card shows: English translation, Phom word, Listen button
```

---

### Visual Changes

| Location | Before | After |
|----------|--------|-------|
| Home page | 8 module cards | 9 module cards (+ Bible Vocabularies) |
| Bible Books page | Vocabularies + OT + NT sections | Only OT + NT sections |
| New route /bible-vocab | N/A | Full vocabulary learning module |

---

### Preserved Data

All 22 vocabulary items and their audio URLs will be preserved during the migration. Only the category assignment and sort_order values change.


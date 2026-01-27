
## Plan: Fix "Church" Flashcard Phom Translation Display

The Phom translation "Phopshem/Khümshem" for the "Church" flashcard is not displaying properly because the text with the slash (`/`) doesn't wrap naturally in the card's constrained width.

---

### Problem Analysis

The current display code:
```tsx
<p className="text-base md:text-lg font-semibold text-center mb-3 text-primary">
  {vocab.phom_word}
</p>
```

The text "Phopshem/Khümshem" (20 characters) is long and contains a `/` which browsers don't automatically treat as a word-break opportunity. This causes the text to overflow or get truncated in the compact grid cards.

---

### Solution

Update the Phom word display paragraph in `src/pages/BibleVocabPage.tsx` to:
1. Add `break-words` class to allow word breaking when needed
2. Add a minimum height to ensure consistent card sizing

**File: `src/pages/BibleVocabPage.tsx` (lines 106-108)**

**Current:**
```tsx
<p className="text-base md:text-lg font-semibold text-center mb-3 text-primary">
  {vocab.phom_word}
</p>
```

**Updated:**
```tsx
<p className="text-base md:text-lg font-semibold text-center mb-3 text-primary break-words min-h-[2.5rem] flex items-center justify-center">
  {vocab.phom_word}
</p>
```

---

### Summary

| Change | Purpose |
|--------|---------|
| Add `break-words` | Allows long text like "Phopshem/Khümshem" to wrap to the next line |
| Add `min-h-[2.5rem]` | Ensures consistent card height across all vocabulary items |
| Add `flex items-center justify-center` | Centers text vertically within the reserved space |

This ensures the full translation "Phopshem/Khümshem" is visible and properly formatted within the flashcard.

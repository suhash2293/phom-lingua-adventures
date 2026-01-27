
## Plan: Enlarge Bible Vocabularies Flashcards

The current grid layout shows up to 6 columns on large screens, making each flashcard too narrow to properly display longer Phom translations like "Phomshem/Khümshem".

---

### Solution

Reduce the maximum number of columns and increase the minimum card width to give each flashcard more space.

**File: `src/pages/BibleVocabPage.tsx`**

---

### Changes

#### 1. Update Grid Layout (line 80)

**Current:**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8">
```

**Updated:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-8">
```

This reduces the number of columns:
- Mobile: 1 column (was 2)
- Small screens: 2 columns (was 3)
- Medium screens: 3 columns (was 4)
- Large screens: 4 columns (was 5-6)

#### 2. Increase Text Size in Phom Translation (line 106)

**Current:**
```tsx
<p className="text-base md:text-lg font-semibold text-center mb-3 text-primary break-words min-h-[2.5rem] flex items-center justify-center">
```

**Updated:**
```tsx
<p className="text-lg md:text-xl font-semibold text-center mb-3 text-primary break-words min-h-[3rem] flex items-center justify-center px-2">
```

#### 3. Increase English Title Size (line 101)

**Current:**
```tsx
<CardTitle className="text-sm md:text-base text-center font-medium">
```

**Updated:**
```tsx
<CardTitle className="text-base md:text-lg text-center font-medium">
```

---

### Summary

| Change | Before | After |
|--------|--------|-------|
| Max columns | 6 | 4 |
| Mobile columns | 2 | 1 |
| Gap between cards | 4 (1rem) | 5 (1.25rem) |
| English title size | sm/base | base/lg |
| Phom text size | base/lg | lg/xl |
| Phom min-height | 2.5rem | 3rem |

This ensures "Phomshem/Khümshem" and other longer translations display fully and clearly on all screen sizes.

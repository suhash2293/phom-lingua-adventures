
## Plan: Update Bible Vocabularies Subheading Text

Change the subtitle/description text for the Bible Vocabularies module from "Learn common Bible vocabularies in Phom dialect" to "Learn foundational Bible vocabularies in Phom dialect".

---

### Files to Update

#### 1. `src/pages/BibleVocabPage.tsx`
Update the `subtitle` prop passed to the `ModuleTitleWithAudio` component:

**Current:**
```tsx
subtitle="Learn common Bible vocabularies in Phom dialect"
```

**Updated:**
```tsx
subtitle="Learn foundational Bible vocabularies in Phom dialect"
```

---

#### 2. `src/pages/Index.tsx`
Update the `description` field in the `moduleConfig` object for 'Bible Vocabularies':

**Current:**
```tsx
'Bible Vocabularies': {
  ...
  description: 'Learn common Bible vocabularies in Phom dialect'
}
```

**Updated:**
```tsx
'Bible Vocabularies': {
  ...
  description: 'Learn foundational Bible vocabularies in Phom dialect'
}
```

---

### Summary

| Location | Change |
|----------|--------|
| Bible Vocabularies page header | "common" → "foundational" |
| Home page module card | "common" → "foundational" |

This ensures consistency between the home page card description and the module's internal header.

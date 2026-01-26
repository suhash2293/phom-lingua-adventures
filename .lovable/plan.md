

## Plan: Update Bible Books Module Subheading

This plan updates the subheading text in the Bible Books learning module.

---

### Text Change

| Current Text | New Text |
|--------------|----------|
| "Learn the names of Bible books in Phom dialect" | "Learn the name of the Books in the Bible in Phom dialect" |

---

### File to Modify

**`src/pages/BibleBooksPage.tsx`** - Line 88

Update the fallback description text from:
```jsx
{category?.description || 'Learn the names of Bible books in Phom dialect'}
```

To:
```jsx
{category?.description || 'Learn the name of the Books in the Bible in Phom dialect'}
```

---

### Technical Note

This text serves as a fallback when the category description from the database is empty. If you want this text to persist even when a category description exists in the database, you may also want to update the `description` field in the `categories` table for "Bible Books" via the Admin Dashboard.


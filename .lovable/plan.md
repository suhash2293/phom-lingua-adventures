

## Plan: Add Subheading to "Good afternoon/Good evening" Greeting Card

This plan adds an explanatory subheading to the specific greeting card for "Good afternoon/Good evening" to clarify that this greeting applies to both time periods.

---

### What Will Change

| Location | Change |
|----------|--------|
| "Good afternoon/Good evening" card | New subheading: "This greeting is applicable for both afternoon and evening" |

---

### File to Modify

**`src/pages/GreetingsPage.tsx`**

Add conditional logic after the CardTitle (around line 94) to display the subheading only for the "Good afternoon/Good evening" greeting:

```jsx
<CardHeader className="pb-2 bg-gradient-to-r from-rose-100/30 to-rose-50/10 dark:from-rose-900/30 dark:to-rose-800/10">
  <CardTitle className="text-lg text-center">
    {greeting.english_translation}
  </CardTitle>
  {greeting.english_translation === 'Good afternoon/Good evening' && (
    <p className="text-xs text-muted-foreground text-center mt-1">
      This greeting is applicable for both afternoon and evening
    </p>
  )}
</CardHeader>
```

---

### Technical Details

- The subheading is conditionally rendered only when `english_translation` matches "Good afternoon/Good evening"
- Styled with `text-xs` for small text and `text-muted-foreground` to appear as secondary text
- Placed directly below the CardTitle within the CardHeader for proper visual hierarchy
- Added `mt-1` for slight spacing between title and subheading


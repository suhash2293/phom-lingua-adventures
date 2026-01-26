

## Plan: Fix Subheading Styling for "Good afternoon/Good evening" Card

This plan corrects the styling of the subheading to match the example sentence format used on other cards - making it italic and wrapped in quotes.

---

### What Will Change

| Current | After Fix |
|---------|-----------|
| Plain text: "This greeting is applicable for both afternoon and evening" | Italic with quotes: *"This greeting is applicable for both afternoon and evening"* |

---

### File to Modify

**`src/pages/GreetingsPage.tsx`** (lines 95-99)

Change from:
```jsx
{greeting.english_translation === 'Good afternoon/Good evening' && (
  <p className="text-xs text-muted-foreground text-center mt-1">
    This greeting is applicable for both afternoon and evening
  </p>
)}
```

Change to:
```jsx
{greeting.english_translation === 'Good afternoon/Good evening' && (
  <p className="text-xs text-muted-foreground/70 text-center mt-1 italic">
    "This greeting is applicable for both afternoon and evening"
  </p>
)}
```

---

### Technical Details

- Add `italic` class to match the example sentence styling
- Add quotes around the text content
- Change `text-muted-foreground` to `text-muted-foreground/70` for consistent opacity with example sentences


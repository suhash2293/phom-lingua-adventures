

## Plan: Update Greetings Module Subtitle

This plan updates the subtitle text in the Greetings module header to use more natural phrasing.

---

### What Will Change

| Current | After Fix |
|---------|-----------|
| "Learn greetings in Phom dialect" | "Learn to greet in Phom dialect" |

---

### File to Modify

**`src/pages/GreetingsPage.tsx`** (line 57)

Change the `subtitle` prop from:
```jsx
subtitle="Learn greetings in Phom dialect"
```

To:
```jsx
subtitle="Learn to greet in Phom dialect"
```

---

### Technical Details

- Single line change in the `ModuleTitleWithAudio` component props
- No functional changes, just updated text content


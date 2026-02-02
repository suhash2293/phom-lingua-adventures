
## Plan: Center the "Back to Home" Buttons

Move the "Back to Home" navigation buttons from the left position to the center on both Greetings and Bible Books pages.

---

### Current State

Both pages have the "Back to Home" button aligned to the left by default.

---

### Changes Required

**File 1: `src/pages/GreetingsPage.tsx`**

Update the Button wrapper to center it:

```tsx
{/* Back Button */}
<div className="mb-6 flex justify-center">
  <Button 
    variant="ghost" 
    onClick={() => navigate('/')}
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to Home
  </Button>
</div>
```

**File 2: `src/pages/BibleBooksPage.tsx`**

Update the Button wrapper to center it:

```tsx
{/* Back button */}
<div className="mb-6 flex justify-center">
  <Button 
    variant="ghost" 
    size="sm"
    onClick={() => navigate('/')}
    className="flex items-center gap-2"
  >
    <ArrowLeft className="h-4 w-4" />
    Back to Home
  </Button>
</div>
```

---

### Result

The "Back to Home" buttons on both pages will be horizontally centered, providing a cleaner, more symmetrical layout that aligns well with the centered module headers.

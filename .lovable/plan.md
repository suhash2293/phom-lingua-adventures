

## Plan: Left-Align "Back to Home" Button on Bible Books Page

### Change Required

**File: `src/pages/BibleBooksPage.tsx`**

The "Back to Home" button is currently centered using a `<div className="mb-6 flex justify-center">` wrapper. Remove the centering wrapper and apply `mb-6` directly to the Button, matching the same pattern used on the Greetings page.

**Before:**
```tsx
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

**After:**
```tsx
<Button 
  variant="ghost" 
  size="sm"
  onClick={() => navigate('/')}
  className="mb-6 flex items-center gap-2"
>
  <ArrowLeft className="h-4 w-4" />
  Back to Home
</Button>
```

### Result

The "Back to Home" button on the Bible Books page will be left-aligned, consistent with the Greetings page.


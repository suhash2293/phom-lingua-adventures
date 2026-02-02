

## Plan: Move "Back to Home" Button to the Left on Greetings Page

Relocate the "Back to Home" navigation button from the center to the left side of the page.

---

### Current State

The button is currently centered using `flex justify-center` wrapper.

---

### Change Required

**File: `src/pages/GreetingsPage.tsx`**

Remove the centering wrapper and restore the left-aligned layout:

```tsx
{/* Back Button */}
<Button 
  variant="ghost" 
  onClick={() => navigate('/')}
  className="mb-6"
>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Back to Home
</Button>
```

This removes the `<div className="mb-6 flex justify-center">` wrapper and moves the `mb-6` class back to the Button itself.

---

### Result

The "Back to Home" button on the Greetings page will be aligned to the left side of the container.


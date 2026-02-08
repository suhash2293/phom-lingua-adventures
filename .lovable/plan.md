

## Plan: Fix "Back to Home" Button Left-Alignment on Greetings Page

### Root Cause

The file `src/App.css` contains a global style on `#root` that centers ALL text content:

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;  /* <-- THIS is the culprit */
}
```

This `text-align: center` is inherited by every element on the page, which is why the "Back to Home" button appears centered even after removing the `flex justify-center` wrapper. The button is an inline-flex element, so it follows `text-align`.

### Fix

**File: `src/App.css`**

Remove the problematic global styles from `#root`. These are leftover from the default Vite starter template and conflict with the app's own layout system (Tailwind + the `ConditionalLayout` component in `App.tsx`).

Clean up the entire file by removing the `#root` styles and other unused Vite template styles:

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;   /* REMOVE this line */
}
```

The simplest and safest fix is to just remove `text-align: center;` from the `#root` rule, keeping the other properties. However, the `padding: 2rem` on `#root` may also cause unwanted extra spacing since the app already handles padding via Tailwind container classes. Ideally, the entire `#root` block and unused Vite template styles (`.logo`, `.card`, `.read-the-docs`, `logo-spin` animation) should be cleaned up.

### Impact

- The "Back to Home" button on the Greetings page will properly align to the left
- Other pages may also see improved alignment where elements were unintentionally centered
- No visual regressions expected since the app uses Tailwind utilities for all intentional centering (e.g., `text-center` classes on card titles)


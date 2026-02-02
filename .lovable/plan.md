
## Plan: Add "Back to Home" Button to Bible Books Page

Add a "Back to Home" navigation button to the Bible Books learning module to match the consistent UI pattern used in other learning modules like Alphabets and Greetings.

---

### What's Missing

The BibleBooksPage currently lacks the back navigation button that other learning modules have, making it inconsistent with the app's navigation patterns.

---

### Changes Required

**File: `src/pages/BibleBooksPage.tsx`**

1. **Add import for `useNavigate`** from react-router-dom
2. **Add import for `ArrowLeft`** icon from lucide-react
3. **Add `navigate` hook** at the top of the component
4. **Add Back Button** before the ModuleTitleWithAudio component

The button will match the existing pattern:
- Ghost variant button
- ArrowLeft icon with "Back to Home" text
- Navigates to the home page (`/`)
- Positioned with margin-bottom for spacing

---

### Code Preview

The back button will look exactly like other learning modules:

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

---

### Result

After this change, the Bible Books page will have consistent navigation with all other learning modules in the app.

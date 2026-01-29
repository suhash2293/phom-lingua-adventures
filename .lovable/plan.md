

## Plan: Add Motivational Text to Home Page Hero Section

Add a bold motivational message to encourage daily learning on the home page.

---

### Current State

The hero section currently shows:
- Title: "Welcome to PhomShah"
- Subtitle: "A beginner's guide to learning Phom dialect"
- Description: "Learn Phom vocabularies and dialect basics through interactive lessons and gamified exercises."

---

### Proposed Change

Add a new bold line immediately after the description:

**"Commit to learning from PhomShah daily, and level up your skills!"**

---

### Code Change

**File: `src/pages/Index.tsx`** (lines 111-113)

```tsx
// Current
<p className="text-lg text-muted-foreground max-w-[600px]">
  Learn Phom vocabularies and dialect basics through interactive lessons and gamified exercises.
</p>

// Updated
<p className="text-lg text-muted-foreground max-w-[600px]">
  Learn Phom vocabularies and dialect basics through interactive lessons and gamified exercises.
</p>
<p className="text-lg font-bold max-w-[600px]">
  Commit to learning from PhomShah daily, and level up your skills!
</p>
```

---

### Visual Result

The hero section will display:
1. Welcome to PhomShah (title)
2. A beginner's guide to learning Phom dialect (subtitle)
3. Learn Phom vocabularies... (regular description)
4. **Commit to learning from PhomShah daily, and level up your skills!** (bold motivational text)


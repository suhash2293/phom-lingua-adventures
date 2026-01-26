

## Plan: Add Disclaimer Note Card Above Learning Modules

This plan adds an informational note card to the home page, positioned just above the "Learning Modules" heading to set expectations for users about the Phom dialect content.

---

### What Will Be Added

A styled card will appear above the "Learning Modules" section containing:

> **Note:** The Phom dialect lessons in this app reflect the current state of the dialect, focusing on commonly used words and phrases. Given the limited vocabulary and the evolving nature of the dialect, some concepts or words may not be covered. We aim to provide a foundational understanding, and we're committed to improving the app over time.

---

### Visual Design

The note card will:
- Use an info-style appearance with a subtle background
- Include an "Info" icon for visual emphasis
- Have a "Note:" label in bold
- Be centered and appropriately sized to match the page layout
- Sit between the Hero section and the Learning Modules heading

---

### File to Modify

**`src/pages/Index.tsx`**

1. Import the `Info` icon from lucide-react (line 5)
2. Add a new note card section between the Hero section (ends line 133) and the Features/Learning Modules section (starts line 136)

The new note card will use the existing `Card` and `CardContent` components already imported in the file for consistency with the rest of the design.

---

### Technical Details

```text
+--------------------------------------------------+
|  Hero Section                                    |
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+  |  <-- NEW: Note Card
|  | (i) Note: The Phom dialect lessons...      |  |
|  +--------------------------------------------+  |
|                                                  |
|          Learning Modules (heading)              |
|                                                  |
|  [Module Cards Grid]                             |
+--------------------------------------------------+
```

- Uses existing Card components for visual consistency
- Adds Info icon from lucide-react for visual emphasis
- Styled with muted background and proper padding
- Responsive design that works on all screen sizes


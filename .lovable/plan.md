

## Plan: Enable MP3 Audio for "Old Testament" Section Header

This plan adds audio support for the "Old Testament" (Lai Chang) section header in the Bible Books module by storing it as a content item in the database and updating the page to read its audio URL.

---

### Approach

The section headers ("Old Testament" and "New Testament") are currently hardcoded in the page with no connection to the database. To enable audio management via the Admin Dashboard, we'll:

1. **Add section headers as content items** with reserved sort_order values
2. **Update the page logic** to extract audio URLs from these items

---

### Database Changes

Add two new content items to the `content_items` table for the section headers:

| English Translation | Phom Word | Sort Order | Purpose |
|---------------------|-----------|------------|---------|
| Old Testament | Lai Chang | -100 | Section header with audio |
| New Testament | Lai Jaa | -101 | Section header with audio |

The negative sort_order values below -10 will distinguish section headers from vocabulary items (which use -1 to -10).

---

### Code Changes

**File: `src/pages/BibleBooksPage.tsx`**

1. **Update the filtering logic** to identify section header items:
   ```text
   - Section headers: sort_order <= -100
   - Vocabulary items: sort_order between -99 and -1
   - Old Testament books: sort_order 1-39
   - New Testament books: sort_order 40-66
   ```

2. **Extract audio URLs from section header items** in the useEffect:
   - Find the "Old Testament" item and set `oldTestamentAudioUrl` from its `audio_url`
   - Find the "New Testament" item and set `newTestamentAudioUrl` from its `audio_url`

3. **Preload section header audio** alongside other audio URLs

---

### After Implementation

Once the database migration runs and the code is updated:
- Go to **Admin Dashboard → Content Items**
- Find the "Old Testament" entry
- Upload the MP3 audio file for "Lai Chang"
- The audio button on the Bible Books page will become active

---

### Technical Details

The code change in `BibleBooksPage.tsx` will:

1. Filter section headers from the fetched items
2. Match items by `english_translation` ("Old Testament" / "New Testament")
3. Set the corresponding audio URL state variables
4. Update vocabulary items filter to exclude section headers (sort_order > -100)


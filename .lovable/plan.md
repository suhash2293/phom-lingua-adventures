

## Plan: Update "New Year Greetings" Description

### What Will Change

Update the italic description text on the "New Year Greetings" flashcard:

- **Current text:** "Although there can be a varied ways of greeting "Happy New Year" the above mentioned ones are common greetings used by the Phom masses"
- **New text:** "Although there are various ways to express New year greetings, the above mentioned ones are commonly used by the Phoms"

### Technical Details

**Database Change:** A single SQL UPDATE on the `content_items` table, targeting the record with ID `8e9d5fe0-2e83-436b-8c97-24e48c3ecadd`:

```text
UPDATE content_items
SET example_sentence = 'Although there are various ways to express New year greetings, the above mentioned ones are commonly used by the Phoms'
WHERE id = '8e9d5fe0-2e83-436b-8c97-24e48c3ecadd';
```

No code changes are needed -- the `GreetingsPage.tsx` already renders the `example_sentence` field in italics automatically.


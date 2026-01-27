-- Remove incorrect singular form fields from Bible Vocabularies category
-- The singular "Bible Vocabulary" / "Daülangpü Laihing Shang" is incorrectly displayed
-- Only the plural header "Bible Vocabularies" should remain visible

UPDATE public.categories
SET singular_name = NULL,
    singular_phom_name = NULL,
    singular_audio_url = NULL
WHERE name = 'Bible Vocabularies';
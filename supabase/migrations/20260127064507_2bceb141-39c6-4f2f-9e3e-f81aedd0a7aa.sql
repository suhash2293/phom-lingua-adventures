-- Remove Phom translation from Bible Vocabularies category header
UPDATE public.categories
SET phom_name = NULL
WHERE name = 'Bible Vocabularies';
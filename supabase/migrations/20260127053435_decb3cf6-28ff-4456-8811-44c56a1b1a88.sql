-- Add section header content items for Bible Books module
-- These use negative sort_order values below -100 to distinguish them from vocabulary items

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT 
  id as category_id,
  'Old Testament' as english_translation,
  'Lai Chang' as phom_word,
  -100 as sort_order,
  NULL as audio_url
FROM public.categories 
WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT 
  id as category_id,
  'New Testament' as english_translation,
  'Lai Jaa' as phom_word,
  -101 as sort_order,
  NULL as audio_url
FROM public.categories 
WHERE name = 'Bible Books';
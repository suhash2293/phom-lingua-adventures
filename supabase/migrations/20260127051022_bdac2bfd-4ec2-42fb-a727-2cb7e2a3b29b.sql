-- Add "Gospel" vocabulary item to Bible Books category
INSERT INTO public.content_items (
  category_id,
  english_translation,
  phom_word,
  sort_order,
  audio_url
)
SELECT 
  id,
  'Gospel',
  'Shahjangmei',
  -5,  -- Negative sort_order to appear in vocabulary section
  NULL -- Audio URL can be added via Admin Dashboard
FROM public.categories
WHERE name = 'Bible Books';
-- Insert the Seasons category
INSERT INTO public.categories (name, description)
VALUES ('Seasons', 'The four seasons of the year in Phom language');

-- Get the category ID and insert content items
WITH season_category AS (
  SELECT id FROM public.categories WHERE name = 'Seasons' LIMIT 1
)
INSERT INTO public.content_items (category_id, phom_word, english_translation, example_sentence, sort_order)
SELECT 
  sc.id,
  phom_word,
  english_translation,
  example_sentence,
  sort_order
FROM season_category sc
CROSS JOIN (VALUES 
  ('Pang', 'Spring', 'The season of new beginnings and blooming flowers', 1),
  ('Lan', 'Summer', 'The warmest season of the year', 2),
  ('Muk', 'Autumn', 'The season of harvest and falling leaves', 3),
  ('Theng', 'Winter', 'The coldest season of the year', 4)
) AS seasons(phom_word, english_translation, example_sentence, sort_order);
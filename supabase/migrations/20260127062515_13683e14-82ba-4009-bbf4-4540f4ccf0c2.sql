-- Add 17 new Bible vocabulary words to the Common Bible Vocabularies section
INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'God', 'Kahvang', -6, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Jesus', 'Jisu', -7, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Christ', 'Krista', -8, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Jesus Christ', 'Jisu Krista', -9, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Lord', 'Shembüpa', -10, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Holy Spirit', 'Daülangpü Laangha', -11, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Angels', 'Phongshandhü', -12, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Prayer', 'Phoppü', -13, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Fasting', 'Lakmeilayung ei phoppü', -14, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Faith', 'Hinglempü', -15, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Love', 'Bampü', -16, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Sin', 'Mang', -17, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Salvation', 'Yemleipü', -18, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Heaven', 'Vangsho', -19, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Hell', 'Molo aw', -20, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Cross', 'Shophang', -21, NULL FROM categories WHERE name = 'Bible Books';

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, audio_url)
SELECT id, 'Church', 'Phopshem/Khümshem', -22, NULL FROM categories WHERE name = 'Bible Books';
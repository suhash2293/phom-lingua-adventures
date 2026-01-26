-- Insert Common Bible vocabularies with negative sort_order to appear before Old Testament (sort_order 1-39)
INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order) VALUES
  ('668ac52d-cbf8-4b87-b729-c0d657d3ccf0', 'Holy Bible', 'Daülangpü Laihing', -4),
  ('668ac52d-cbf8-4b87-b729-c0d657d3ccf0', 'Bible', 'Laihing', -3),
  ('668ac52d-cbf8-4b87-b729-c0d657d3ccf0', 'Chapter', 'Laiphong', -2),
  ('668ac52d-cbf8-4b87-b729-c0d657d3ccf0', 'Verse', 'Lüng', -1);
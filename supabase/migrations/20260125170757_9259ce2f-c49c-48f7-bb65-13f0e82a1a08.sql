-- Insert greeting content items into the Greetings category
INSERT INTO public.content_items (category_id, phom_word, english_translation, example_sentence, sort_order)
VALUES 
  ('4f90edf0-e38d-4edb-8e4a-1eb99131a5bc', 'Nepmei', 'Good morning', 'Use this greeting in the morning', 1),
  ('4f90edf0-e38d-4edb-8e4a-1eb99131a5bc', 'Nyihmei', 'Good day', 'A general daytime greeting', 2),
  ('4f90edf0-e38d-4edb-8e4a-1eb99131a5bc', 'Nyakmei', 'Good night', 'Use this greeting at night', 3);
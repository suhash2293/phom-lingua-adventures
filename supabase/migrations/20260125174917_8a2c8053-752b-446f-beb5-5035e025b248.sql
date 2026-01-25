-- Insert 4 demonstrative pronouns into content_items table
-- Category ID for Pronouns: 64d3a55e-c003-4246-bcf6-66789561ad18
-- Sort order continues from 28 (after personal 1-12, reflexive 13-20, and possessive 21-27)

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order)
VALUES
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'This', 'Hapa', 28),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'That', 'Antepa', 29),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'These', 'Hadhü', 30),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'Those', 'Antepadhü', 31);
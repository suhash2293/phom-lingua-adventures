-- Insert 7 possessive pronouns into content_items table
-- Category ID for Pronouns: 64d3a55e-c003-4246-bcf6-66789561ad18
-- Sort order continues from 21 (after personal 1-12 and reflexive 13-20)

INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order)
VALUES
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'Mine', 'Ngelei', 21),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'Yours', 'Nüngei', 22),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'His', 'Büpalei', 23),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'Hers', 'Pinyülei', 24),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'Its', 'Hapalei', 25),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'Ours', 'Jenei/Jenphongei', 26),
  ('64d3a55e-c003-4246-bcf6-66789561ad18', 'Theirs', 'Jomei/Jomphongei', 27);
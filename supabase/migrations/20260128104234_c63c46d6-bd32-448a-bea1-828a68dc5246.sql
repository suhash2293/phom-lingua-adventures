-- Shift all items with sort_order >= 12 up by 1
UPDATE content_items
SET sort_order = sort_order + 1
WHERE category_id = (SELECT id FROM categories WHERE name = 'Bible Vocabularies')
  AND sort_order >= 12;

-- Insert the new "Angel" vocabulary item
INSERT INTO content_items (category_id, phom_word, english_translation, sort_order)
VALUES (
  (SELECT id FROM categories WHERE name = 'Bible Vocabularies'),
  'Phongshan',
  'Angel',
  12
);
-- Create Bible Books category
INSERT INTO public.categories (name, description, phom_name, singular_name, singular_phom_name)
VALUES (
  'Bible Books',
  'Learn the names of Bible books in Phom dialect',
  NULL,
  'Bible Book',
  NULL
);

-- Get the category ID for inserting content items
DO $$
DECLARE
  bible_category_id UUID;
BEGIN
  SELECT id INTO bible_category_id FROM public.categories WHERE name = 'Bible Books';
  
  -- Old Testament Books (sort_order 1-39)
  INSERT INTO public.content_items (category_id, english_translation, phom_word, sort_order, example_sentence) VALUES
  (bible_category_id, 'Genesis', 'Genesis', 1, 'Old Testament'),
  (bible_category_id, 'Exodus', 'Exodus', 2, 'Old Testament'),
  (bible_category_id, 'Leviticus', 'Leviticus', 3, 'Old Testament'),
  (bible_category_id, 'Numbers', 'Numbers', 4, 'Old Testament'),
  (bible_category_id, 'Deuteronomy', 'Deuteronomy', 5, 'Old Testament'),
  (bible_category_id, 'Joshua', 'Joshua', 6, 'Old Testament'),
  (bible_category_id, 'Judges', 'Judges', 7, 'Old Testament'),
  (bible_category_id, 'Ruth', 'Ruth', 8, 'Old Testament'),
  (bible_category_id, '1 Samuel', '1 Samuel', 9, 'Old Testament'),
  (bible_category_id, '2 Samuel', '2 Samuel', 10, 'Old Testament'),
  (bible_category_id, '1 Kings', '1 Kings', 11, 'Old Testament'),
  (bible_category_id, '2 Kings', '2 Kings', 12, 'Old Testament'),
  (bible_category_id, '1 Chronicles', '1 Chronicles', 13, 'Old Testament'),
  (bible_category_id, '2 Chronicles', '2 Chronicles', 14, 'Old Testament'),
  (bible_category_id, 'Ezra', 'Ezra', 15, 'Old Testament'),
  (bible_category_id, 'Nehemiah', 'Nehemiah', 16, 'Old Testament'),
  (bible_category_id, 'Esther', 'Esther', 17, 'Old Testament'),
  (bible_category_id, 'Job', 'Job', 18, 'Old Testament'),
  (bible_category_id, 'Psalms', 'Psalms', 19, 'Old Testament'),
  (bible_category_id, 'Proverbs', 'Proverbs', 20, 'Old Testament'),
  (bible_category_id, 'Ecclesiastes', 'Ecclesiastes', 21, 'Old Testament'),
  (bible_category_id, 'Song of Solomon', 'Song of Solomon', 22, 'Old Testament'),
  (bible_category_id, 'Isaiah', 'Isaiah', 23, 'Old Testament'),
  (bible_category_id, 'Jeremiah', 'Jeremiah', 24, 'Old Testament'),
  (bible_category_id, 'Lamentations', 'Lamentations', 25, 'Old Testament'),
  (bible_category_id, 'Ezekiel', 'Ezekiel', 26, 'Old Testament'),
  (bible_category_id, 'Daniel', 'Daniel', 27, 'Old Testament'),
  (bible_category_id, 'Hosea', 'Hosea', 28, 'Old Testament'),
  (bible_category_id, 'Joel', 'Joel', 29, 'Old Testament'),
  (bible_category_id, 'Amos', 'Amos', 30, 'Old Testament'),
  (bible_category_id, 'Obadiah', 'Obadiah', 31, 'Old Testament'),
  (bible_category_id, 'Jonah', 'Jonah', 32, 'Old Testament'),
  (bible_category_id, 'Micah', 'Micah', 33, 'Old Testament'),
  (bible_category_id, 'Nahum', 'Nahum', 34, 'Old Testament'),
  (bible_category_id, 'Habakkuk', 'Habakkuk', 35, 'Old Testament'),
  (bible_category_id, 'Zephaniah', 'Zephaniah', 36, 'Old Testament'),
  (bible_category_id, 'Haggai', 'Haggai', 37, 'Old Testament'),
  (bible_category_id, 'Zechariah', 'Zechariah', 38, 'Old Testament'),
  (bible_category_id, 'Malachi', 'Malachi', 39, 'Old Testament'),
  
  -- New Testament Books (sort_order 40-66)
  (bible_category_id, 'Matthew', 'Matthew', 40, 'New Testament'),
  (bible_category_id, 'Mark', 'Mark', 41, 'New Testament'),
  (bible_category_id, 'Luke', 'Luke', 42, 'New Testament'),
  (bible_category_id, 'John', 'John', 43, 'New Testament'),
  (bible_category_id, 'Acts', 'Acts', 44, 'New Testament'),
  (bible_category_id, 'Romans', 'Romans', 45, 'New Testament'),
  (bible_category_id, '1 Corinthians', '1 Corinthians', 46, 'New Testament'),
  (bible_category_id, '2 Corinthians', '2 Corinthians', 47, 'New Testament'),
  (bible_category_id, 'Galatians', 'Galatians', 48, 'New Testament'),
  (bible_category_id, 'Ephesians', 'Ephesians', 49, 'New Testament'),
  (bible_category_id, 'Philippians', 'Philippians', 50, 'New Testament'),
  (bible_category_id, 'Colossians', 'Colossians', 51, 'New Testament'),
  (bible_category_id, '1 Thessalonians', '1 Thessalonians', 52, 'New Testament'),
  (bible_category_id, '2 Thessalonians', '2 Thessalonians', 53, 'New Testament'),
  (bible_category_id, '1 Timothy', '1 Timothy', 54, 'New Testament'),
  (bible_category_id, '2 Timothy', '2 Timothy', 55, 'New Testament'),
  (bible_category_id, 'Titus', 'Titus', 56, 'New Testament'),
  (bible_category_id, 'Philemon', 'Philemon', 57, 'New Testament'),
  (bible_category_id, 'Hebrews', 'Hebrews', 58, 'New Testament'),
  (bible_category_id, 'James', 'James', 59, 'New Testament'),
  (bible_category_id, '1 Peter', '1 Peter', 60, 'New Testament'),
  (bible_category_id, '2 Peter', '2 Peter', 61, 'New Testament'),
  (bible_category_id, '1 John', '1 John', 62, 'New Testament'),
  (bible_category_id, '2 John', '2 John', 63, 'New Testament'),
  (bible_category_id, '3 John', '3 John', 64, 'New Testament'),
  (bible_category_id, 'Jude', 'Jude', 65, 'New Testament'),
  (bible_category_id, 'Revelation', 'Revelation', 66, 'New Testament');
END $$;
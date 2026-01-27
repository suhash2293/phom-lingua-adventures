-- Step 1: Create new category for Bible Vocabularies
INSERT INTO public.categories (name, description, phom_name, singular_name, singular_phom_name)
VALUES (
  'Bible Vocabularies', 
  'Learn common Bible vocabularies in Phom dialect', 
  'Daülangpü Laihing Shang', 
  'Bible Vocabulary', 
  'Daülangpü Laihing Shang'
);

-- Step 2: Move vocabulary items from Bible Books to Bible Vocabularies and update sort_order to positive values
UPDATE public.content_items 
SET category_id = (SELECT id FROM public.categories WHERE name = 'Bible Vocabularies'),
    sort_order = ABS(sort_order)
WHERE category_id = (SELECT id FROM public.categories WHERE name = 'Bible Books')
AND sort_order < 0 AND sort_order > -100;
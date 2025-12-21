-- Add Phom name and audio URL columns to categories table
ALTER TABLE public.categories 
ADD COLUMN phom_name text,
ADD COLUMN title_audio_url text;

-- Update existing categories with placeholder Phom names
UPDATE public.categories SET phom_name = 'Akhur' WHERE name = 'Alphabets';
UPDATE public.categories SET phom_name = 'Nyäng' WHERE name = 'Numbers';
UPDATE public.categories SET phom_name = 'Nyishi' WHERE name = 'Days';
UPDATE public.categories SET phom_name = 'Hli' WHERE name = 'Months';
UPDATE public.categories SET phom_name = 'Rukhum' WHERE name = 'Seasons';
-- Update the Greetings category to change singular_name to "Greetings"
UPDATE public.categories 
SET singular_name = 'Greetings', updated_at = now()
WHERE id = '4f90edf0-e38d-4edb-8e4a-1eb99131a5bc';
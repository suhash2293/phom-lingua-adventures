-- Remove singular_name for Greetings category since it's the same as the plural form
-- This will hide the redundant singular section in the header card
UPDATE categories 
SET singular_name = NULL 
WHERE name = 'Greetings';
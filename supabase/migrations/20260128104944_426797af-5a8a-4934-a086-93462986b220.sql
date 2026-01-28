-- Update the phom_name spelling for Numbers category
UPDATE categories 
SET phom_name = 'Nyihthü', updated_at = now()
WHERE name = 'Numbers';
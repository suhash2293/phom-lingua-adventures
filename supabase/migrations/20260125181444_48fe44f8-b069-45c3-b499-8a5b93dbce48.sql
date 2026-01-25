-- Add linguistic context note to the "Nobody" indefinite pronoun entry
UPDATE public.content_items 
SET example_sentence = 'In the Phom dialect "Üpayao" is a "Nobody" starter that needs the surrounding words to show the exact meaning (like "nobody can - üpayao neaok" or "nobody is there - üpayao neshiü") and many such syntactic/semantic context.'
WHERE english_translation = 'Nobody' 
  AND category_id = '64d3a55e-c003-4246-bcf6-66789561ad18';
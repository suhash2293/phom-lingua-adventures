-- Add singular form columns to categories table
ALTER TABLE categories 
ADD COLUMN singular_name text,
ADD COLUMN singular_phom_name text,
ADD COLUMN singular_audio_url text;

-- Add comments for documentation
COMMENT ON COLUMN categories.singular_name IS 'Singular form of the English category name (e.g., Day for Days)';
COMMENT ON COLUMN categories.singular_phom_name IS 'Singular form of the Phom category name';
COMMENT ON COLUMN categories.singular_audio_url IS 'Audio URL for the singular form pronunciation';
-- Add Reviews & Ratings columns to exclusive_keywords table
ALTER TABLE exclusive_keywords ADD COLUMN IF NOT EXISTS total_reviews TEXT DEFAULT '1,178';
ALTER TABLE exclusive_keywords ADD COLUMN IF NOT EXISTS avg_ratings TEXT DEFAULT '4.54';

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

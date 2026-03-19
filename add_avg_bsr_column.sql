-- Add AVG BSR column to exclusive_keywords table
ALTER TABLE exclusive_keywords ADD COLUMN IF NOT EXISTS avg_bsr TEXT DEFAULT '1,200';

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

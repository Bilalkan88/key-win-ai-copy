ALTER TABLE exclusive_keywords ADD COLUMN IF NOT EXISTS risk_assessment TEXT;
NOTIFY pgrst, 'reload schema';

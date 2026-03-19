-- If status is just text with no constraint, you do not need any SQL.
-- If you have a CHECK constraint, you may need to update it:

-- ALTER TABLE public.exclusive_keywords DROP CONSTRAINT IF EXISTS exclusive_keywords_status_check;
-- ALTER TABLE public.exclusive_keywords ADD CONSTRAINT exclusive_keywords_status_check CHECK (status IN ('available', 'sold', 'unavailable'));


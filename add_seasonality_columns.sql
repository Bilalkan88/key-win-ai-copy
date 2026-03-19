ALTER TABLE public.exclusive_keywords 
ADD COLUMN IF NOT EXISTS seasonality_peak TEXT DEFAULT 'Jun - Aug',
ADD COLUMN IF NOT EXISTS seasonality_off_peak TEXT DEFAULT 'Nov - Feb';

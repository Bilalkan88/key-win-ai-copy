ALTER TABLE public.exclusive_keywords 
ADD COLUMN IF NOT EXISTS seasonality_note TEXT DEFAULT 'Demand spikes by 34% in summer.';

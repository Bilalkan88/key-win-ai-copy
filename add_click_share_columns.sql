ALTER TABLE public.exclusive_keywords 
ADD COLUMN IF NOT EXISTS click_share_single TEXT DEFAULT '52%',
ADD COLUMN IF NOT EXISTS click_share_top3 TEXT DEFAULT '38%',
ADD COLUMN IF NOT EXISTS click_share_top5 TEXT DEFAULT '11%';

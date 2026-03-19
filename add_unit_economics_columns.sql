-- Run this SQL in your Supabase SQL Editor to add the new Unit Economics columns

ALTER TABLE public.exclusive_keywords
ADD COLUMN IF NOT EXISTS economics_sale_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS economics_cogs NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS economics_shipping NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS economics_referral_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS economics_fba_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS economics_ads_spend NUMERIC DEFAULT 0;

-- Refresh the PostgREST schema cache to make the new columns available to the API
NOTIFY pgrst, 'reload schema';

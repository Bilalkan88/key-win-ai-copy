-- Add Sales Performance columns to exclusive_keywords table
ALTER TABLE exclusive_keywords ADD COLUMN IF NOT EXISTS avg_monthly_sales TEXT DEFAULT '600';
ALTER TABLE exclusive_keywords ADD COLUMN IF NOT EXISTS units_sold_12m_count TEXT DEFAULT '2000';
ALTER TABLE exclusive_keywords ADD COLUMN IF NOT EXISTS avg_listing_age TEXT DEFAULT '14 Months';

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

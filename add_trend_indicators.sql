ALTER TABLE exclusive_keywords 
ADD COLUMN revenue_12m_trend TEXT DEFAULT 'up',
ADD COLUMN click_share_trend TEXT DEFAULT 'up',
ADD COLUMN units_sold_12m_trend TEXT DEFAULT 'up';

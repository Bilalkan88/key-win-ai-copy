-- ==========================================
-- 1. ADD COLUMNS TO exclusive_keywords TABLE
-- ==========================================
ALTER TABLE "public"."exclusive_keywords"
ADD COLUMN IF NOT EXISTS "report_pdf_url" TEXT,
ADD COLUMN IF NOT EXISTS "report_pdf_name" TEXT,
ADD COLUMN IF NOT EXISTS "report_pdf_size" BIGINT;


-- ==========================================
-- 2. CREATE `delivery_records` TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS "public"."delivery_records" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" TEXT NOT NULL,          -- Could be UUID or String depending on payment gateway
    "keyword_id" UUID REFERENCES "public"."exclusive_keywords"("id") ON DELETE CASCADE,
    "buyer_email" TEXT NOT NULL,
    "delivered_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure exactly one delivery record per order to prevent duplicate emails
    CONSTRAINT "unique_order_delivery" UNIQUE ("order_id")
);

-- Enable RLS on delivery_records
ALTER TABLE "public"."delivery_records" ENABLE ROW LEVEL SECURITY;

-- Allow admin and system (service_role) full access to delivery_records
CREATE POLICY "Enable ALL for service-role"
ON "public"."delivery_records"
TO service_role
USING (true)
WITH CHECK (true);


-- ==========================================
-- 3. CREATE SECURE STORAGE BUCKET
-- ==========================================
-- NOTE: If this fails because the bucket exists, you can safely ignore the error.
INSERT INTO "storage"."buckets" ("id", "name", "public", "file_size_limit", "allowed_mime_types")
VALUES (
    'keyword_reports',
    'keyword_reports',
    false, -- MUST BE FALSE (PRIVATE)
    5242880, -- 5MB limit
    ARRAY['application/pdf']
)
ON CONFLICT ("id") DO UPDATE SET 
    "public" = false, 
    "file_size_limit" = 5242880,
    "allowed_mime_types" = ARRAY['application/pdf'];


-- ==========================================
-- 4. STORAGE RLS POLICIES
-- ==========================================
-- Allow authenticated users to upload (Admin restriction handled in UI/Backend usually, 
-- or you can restrict to users with a specific role if setup)
CREATE POLICY "Allow authenticated users to insert files"
ON "storage"."objects"
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'keyword_reports');

-- Allow authenticated users to update/delete their uploaded files
CREATE POLICY "Allow authenticated users to update/delete"
ON "storage"."objects"
FOR UPDATE
TO authenticated
USING (bucket_id = 'keyword_reports');

CREATE POLICY "Allow authenticated users to delete"
ON "storage"."objects"
FOR DELETE
TO authenticated
USING (bucket_id = 'keyword_reports');

-- Allow users to select files (Download capability)
-- In a real scenario, the backend generates signed URLs, so public select policy might not even be needed.
-- But if using `supabase.storage.from().download()`, the user needs select access.
-- We will allow authenticated selection, but rely on the Frontend to only show links to owners.
CREATE POLICY "Allow authenticated view"
ON "storage"."objects"
FOR SELECT
TO authenticated
USING (bucket_id = 'keyword_reports');

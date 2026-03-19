-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create a table for user profiles (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  credits INTEGER DEFAULT 1000,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create the Exclusive Keywords table (if not exists)
CREATE TABLE IF NOT EXISTS public.exclusive_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  keyword_phrase TEXT NOT NULL,
  category TEXT,
  price NUMERIC DEFAULT 149,
  search_volume INTEGER DEFAULT 0,
  competing_products INTEGER DEFAULT 0,
  est_sales INTEGER DEFAULT 0,
  competition_level TEXT DEFAULT 'Low',
  opportunity_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  sold_at TIMESTAMP WITH TIME ZONE,
  price_range TEXT,
  est_profit TEXT,
  avg_reviews NUMERIC DEFAULT 0,
  demand_level TEXT DEFAULT 'Moderate' CHECK (demand_level IN ('Low', 'Moderate', 'High')),
  demand_type TEXT DEFAULT 'Year-Round' CHECK (demand_type IN ('Year-Round', 'Seasonal')),
  trend_image_url TEXT,
  trend_data JSONB,
  keepa_image_url TEXT,
  helium10_image_url TEXT,
  buyer_id UUID REFERENCES auth.users(id)
);

-- CRITICAL: Reload PostgREST schema cache to fix "Could not find column in schema cache" error
NOTIFY pgrst, 'reload schema';

-- 3. Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusive_keywords ENABLE ROW LEVEL SECURITY;

-- CLEANUP: Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view available keywords" ON public.exclusive_keywords;
DROP POLICY IF EXISTS "Public can view recent sold keywords" ON public.exclusive_keywords;
DROP POLICY IF EXISTS "Admins have full access" ON public.exclusive_keywords;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Exclusive Keywords Policies
-- Anyone (even unauthenticated) can see available keywords to browse the marketplace
CREATE POLICY "Public can view available keywords" ON public.exclusive_keywords 
  FOR SELECT USING (status = 'available' OR buyer_id = auth.uid());

-- Recently sold keywords might also be visible for the ticker (last 24h as per code logic)
CREATE POLICY "Public can view recent sold keywords" ON public.exclusive_keywords
  FOR SELECT USING (status = 'sold' AND (NOW() - sold_at) < INTERVAL '24 hours');

-- Only Admins can manage the inventory
CREATE POLICY "Admins have full access" ON public.exclusive_keywords
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 4. Trigger to create a profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, plan)
  VALUES (new.id, new.email, 1000, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- STORAGE BUCKET SETUP (Run this in Supabase SQL Editor)

-- 1. Ensure the bucket exists and is public (This often needs to be done in UI, but SQL can try)
INSERT INTO storage.buckets (id, name, public)
VALUES ('keyword-images', 'keyword-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Give me imports" ON storage.objects; -- potential old policy name

-- 3. Create Permissive Policies for 'keyword-images'

-- Allow public read access (anyone can view images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'keyword-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'keyword-images' );

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'keyword-images' );

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'keyword-images' AND auth.role() = 'authenticated' );

-- Instructions:
-- 1. Go to Supabase Dashboard -> Storage
-- 2. Create a new bucket named 'keyword-images'
-- 3. Set it to Public

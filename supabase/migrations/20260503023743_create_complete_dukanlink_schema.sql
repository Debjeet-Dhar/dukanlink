/*
  # Create Complete Database Schema for DukanLink

  1. New Tables
    - `shops` - Stores shop information (name, slug, city, whatsapp, plan, status, banner, logo)
    - `products` - Stores product information per shop (name, price, image, description, category, tags)
    - `user_profiles` - Stores user metadata (admin status)

  2. Indexes
    - shops: owner_id, slug, status
    - products: shop_id
    - user_profiles: is_admin

  3. Security
    - RLS enabled on ALL tables
    - Shops: owners can CRUD own shops, admins can read/update all, public can read active
    - Products: owners can CRUD own shop products, admins can read all, public can read active shop products
    - User profiles: users can create/read/update own profile, admins can read/update all

  4. Storage
    - shop-images bucket (public, 5MB limit, image types only)
    - Users can upload/update/delete in their own folder, anyone can read
*/

-- ============================================================
-- SHOPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  city TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  banner TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Shops: owners can view own shops
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can view own shops' AND tablename = 'shops') THEN
    CREATE POLICY "Owners can view own shops"
      ON shops FOR SELECT TO authenticated
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- Shops: admins can view all shops
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all shops' AND tablename = 'shops') THEN
    CREATE POLICY "Admins can view all shops"
      ON shops FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
  END IF;
END $$;

-- Shops: public can view active shops
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active shops' AND tablename = 'shops') THEN
    CREATE POLICY "Public can view active shops"
      ON shops FOR SELECT TO anon, authenticated
      USING (status = 'active');
  END IF;
END $$;

-- Shops: users can create shops
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create shops' AND tablename = 'shops') THEN
    CREATE POLICY "Users can create shops"
      ON shops FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- Shops: owners can update own shops
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can update own shops' AND tablename = 'shops') THEN
    CREATE POLICY "Owners can update own shops"
      ON shops FOR UPDATE TO authenticated
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- Shops: admins can update any shop
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any shop' AND tablename = 'shops') THEN
    CREATE POLICY "Admins can update any shop"
      ON shops FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE))
      WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
  END IF;
END $$;

-- Shops: owners can delete own shops
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can delete own shops' AND tablename = 'shops') THEN
    CREATE POLICY "Owners can delete own shops"
      ON shops FOR DELETE TO authenticated
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  image TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products: owners can view own shop products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can view own shop products' AND tablename = 'products') THEN
    CREATE POLICY "Owners can view own shop products"
      ON products FOR SELECT TO authenticated
      USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
  END IF;
END $$;

-- Products: admins can view all products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all products' AND tablename = 'products') THEN
    CREATE POLICY "Admins can view all products"
      ON products FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
  END IF;
END $$;

-- Products: public can view active shop products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active shop products' AND tablename = 'products') THEN
    CREATE POLICY "Public can view active shop products"
      ON products FOR SELECT TO anon, authenticated
      USING (shop_id IN (SELECT id FROM shops WHERE status = 'active'));
  END IF;
END $$;

-- Products: owners can create products in own shops
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can create products in own shops' AND tablename = 'products') THEN
    CREATE POLICY "Owners can create products in own shops"
      ON products FOR INSERT TO authenticated
      WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
  END IF;
END $$;

-- Products: owners can update own products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can update own products' AND tablename = 'products') THEN
    CREATE POLICY "Owners can update own products"
      ON products FOR UPDATE TO authenticated
      USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
      WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
  END IF;
END $$;

-- Products: owners can delete own products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can delete own products' AND tablename = 'products') THEN
    CREATE POLICY "Owners can delete own products"
      ON products FOR DELETE TO authenticated
      USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
  END IF;
END $$;

-- ============================================================
-- USER PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles: users can view own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'user_profiles') THEN
    CREATE POLICY "Users can view own profile"
      ON user_profiles FOR SELECT TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- User profiles: admins can view all profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles' AND tablename = 'user_profiles') THEN
    CREATE POLICY "Admins can view all profiles"
      ON user_profiles FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
  END IF;
END $$;

-- User profiles: users can create own profile (CRITICAL for signup)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own profile' AND tablename = 'user_profiles') THEN
    CREATE POLICY "Users can create own profile"
      ON user_profiles FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- User profiles: users can update own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'user_profiles') THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles FOR UPDATE TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- User profiles: admins can update any profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any profile' AND tablename = 'user_profiles') THEN
    CREATE POLICY "Admins can update any profile"
      ON user_profiles FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE))
      WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
  END IF;
END $$;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-images',
  'shop-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage: users can upload to own folder
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload own images' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload own images"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- Storage: anyone can read shop images
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read shop images' AND tablename = 'objects') THEN
    CREATE POLICY "Public can read shop images"
      ON storage.objects FOR SELECT TO anon, authenticated
      USING (bucket_id = 'shop-images');
  END IF;
END $$;

-- Storage: users can update own images
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own images' AND tablename = 'objects') THEN
    CREATE POLICY "Users can update own images"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- Storage: users can delete own images
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own images' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete own images"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

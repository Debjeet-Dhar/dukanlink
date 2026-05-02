/*
  # Create User Profiles Table for Admin Role Management
  
  Creates a user_profiles table linked to auth.users for tracking admin status
  and other user metadata while maintaining referential integrity.
*/

-- Create user profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);

-- User profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON user_profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
      ON user_profiles FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE user_profiles.id = auth.uid() 
          AND user_profiles.is_admin = TRUE
        )
      );
  END IF;
END $$;

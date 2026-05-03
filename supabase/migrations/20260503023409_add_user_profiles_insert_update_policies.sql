/*
  # Add INSERT and UPDATE policies for user_profiles

  1. Security Changes
    - Add INSERT policy: Users can create their own profile on signup
    - Add UPDATE policy: Users can update their own profile
    - Add UPDATE policy: Admins can update any profile (for admin management)

  Without these policies, the AuthContext.signUp function fails silently
  because user_profiles has RLS enabled but no INSERT policy.
*/

-- Users can insert their own profile (needed during signup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own profile' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY "Users can create own profile"
      ON user_profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Users can update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Admins can update any profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any profile' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY "Admins can update any profile"
      ON user_profiles FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = TRUE
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = TRUE
        )
      );
  END IF;
END $$;

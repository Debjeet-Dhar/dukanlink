/*
  # Owner metadata and admin action support

  - Stores Google/email profile metadata for admin review.
  - Auto-creates and refreshes user_profiles from auth.users.
  - Replaces recursive admin RLS checks with SECURITY DEFINER helpers.
  - Keeps owners from changing admin/billing fields while admins can manage status and plan.
*/

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
      AND is_admin = TRUE
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.sync_user_profile_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    avatar_url,
    last_sign_in_at,
    is_admin
  )
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.last_sign_in_at,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    last_sign_in_at = COALESCE(EXCLUDED.last_sign_in_at, user_profiles.last_sign_in_at),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profile_from_auth();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, raw_user_meta_data, last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profile_from_auth();

UPDATE user_profiles profile
SET email = LOWER(auth_user.email),
    full_name = COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name', profile.full_name),
    avatar_url = COALESCE(auth_user.raw_user_meta_data->>'avatar_url', auth_user.raw_user_meta_data->>'picture', profile.avatar_url),
    last_sign_in_at = COALESCE(auth_user.last_sign_in_at, profile.last_sign_in_at),
    updated_at = now()
FROM auth.users auth_user
WHERE profile.id = auth_user.id;

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT TO authenticated
  USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own non-admin profile" ON user_profiles;
CREATE POLICY "Users can create own non-admin profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND is_admin = FALSE);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own non-admin profile" ON user_profiles;
CREATE POLICY "Users can update own profile metadata"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = FALSE);

DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can view all shops" ON shops;
DROP POLICY IF EXISTS "Admins can manage all shops" ON shops;
CREATE POLICY "Admins can view all shops"
  ON shops FOR SELECT TO authenticated
  USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update any shop" ON shops;
DROP POLICY IF EXISTS "Admins can update all shops" ON shops;
CREATE POLICY "Admins can update any shop"
  ON shops FOR UPDATE TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can view all products" ON products;
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT TO authenticated
  USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update all products" ON products;
CREATE POLICY "Admins can update all products"
  ON products FOR UPDATE TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can delete all products" ON products;
CREATE POLICY "Admins can delete all products"
  ON products FOR DELETE TO authenticated
  USING (public.current_user_is_admin());

/*
  # Harden admin, plan, and subscription security

  - Users can only create non-admin profile rows.
  - Users cannot update their own is_admin flag.
  - Only one admin profile can exist at a time.
  - First admin can be claimed through a SECURITY DEFINER RPC only when no admin exists.
  - Shop owners cannot change protected billing/admin fields from the client.
  - Subscription writes are server/admin controlled, not user controlled.
*/

-- Keep only one admin profile. If the auth user is deleted, the profile cascades
-- and a new first admin can be claimed.
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_single_admin
  ON user_profiles ((is_admin))
  WHERE is_admin = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS shops_one_per_owner
  ON shops (owner_id);

DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
CREATE POLICY "Users can create own non-admin profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND is_admin = FALSE);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM user_profiles WHERE is_admin = TRUE);
$$;

GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  PERFORM pg_advisory_xact_lock(918273645);

  IF EXISTS (SELECT 1 FROM user_profiles WHERE is_admin = TRUE) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO user_profiles (id, is_admin)
  VALUES (current_user_id, TRUE)
  ON CONFLICT (id) DO UPDATE SET is_admin = TRUE, updated_at = now();

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_owner_protected_shop_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF public.current_user_is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id
    OR NEW.plan IS DISTINCT FROM OLD.plan
    OR NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Protected shop fields cannot be changed by shop owners';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_owner_protected_shop_updates ON shops;
CREATE TRIGGER trigger_prevent_owner_protected_shop_updates
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_owner_protected_shop_updates();

CREATE OR REPLACE FUNCTION public.enforce_product_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  shop_plan TEXT;
  product_count INTEGER;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.shop_id IS DISTINCT FROM OLD.shop_id THEN
    RAISE EXCEPTION 'Product shop cannot be changed';
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT plan INTO shop_plan FROM shops WHERE id = NEW.shop_id;

    IF COALESCE(shop_plan, 'free') <> 'premium' THEN
      SELECT COUNT(*) INTO product_count FROM products WHERE shop_id = NEW.shop_id;
      IF product_count >= 15 THEN
        RAISE EXCEPTION 'Free plan product limit reached';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_product_limits ON products;
CREATE TRIGGER trigger_enforce_product_limits
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_product_limits();

-- Billing records must be controlled by server-side/webhook/admin flows.
DROP POLICY IF EXISTS "Users can create own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscription events" ON subscription_events;

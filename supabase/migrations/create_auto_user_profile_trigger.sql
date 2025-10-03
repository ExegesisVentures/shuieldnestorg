-- Create hardened trigger function to automatically create public user profile when auth user is created
-- SECURITY DEFINER: Function runs with owner privileges (postgres) to bypass RLS
-- search_path: Locked to public, pg_temp to prevent schema shadowing attacks
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $func$
DECLARE
  new_public_user_id uuid;
BEGIN
  -- Skip if mapping already exists (idempotent)
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE auth_user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Create public_users record
  INSERT INTO public.public_users (email, created_at)
  VALUES (NEW.email, NOW())
  RETURNING id INTO new_public_user_id;

  -- Create user_profiles mapping
  INSERT INTO public.user_profiles (auth_user_id, public_user_id, created_at)
  VALUES (NEW.id, new_public_user_id, NOW());

  RETURN NEW;
END;
$func$;

-- Create trigger that fires when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users who don't have profiles yet
-- Set-based approach (faster and cleaner than row-by-row loop)
-- Idempotent: Safe to re-run

-- Step 1: Create missing public_users by email
WITH missing AS (
  SELECT au.id AS auth_user_id, au.email
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON up.auth_user_id = au.id
  WHERE up.auth_user_id IS NULL
)
INSERT INTO public.public_users (email, created_at)
SELECT m.email, NOW()
FROM missing m
ON CONFLICT (email) DO NOTHING;

-- Step 2: Map auth_user_id to public_user_id
INSERT INTO public.user_profiles (auth_user_id, public_user_id, created_at)
SELECT m.auth_user_id, pu.id, NOW()
FROM (
  SELECT au.id AS auth_user_id, au.email
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON up.auth_user_id = au.id
  WHERE up.auth_user_id IS NULL
) m
JOIN public.public_users pu ON pu.email = m.email
ON CONFLICT (auth_user_id) DO NOTHING;

-- RLS policies to allow controlled inserts by authenticated users
-- Note: SECURITY DEFINER function already bypasses RLS, but these policies
-- reduce friction for developer workflows and non-superuser contexts
DO $$
BEGIN
  -- public.public_users: Allow INSERT by authenticated
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'public_users' AND policyname = 'public_users_insert_authenticated'
  ) THEN
    CREATE POLICY public_users_insert_authenticated
      ON public.public_users
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- public.user_profiles: Allow INSERT by authenticated
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'user_profiles_insert_authenticated'
  ) THEN
    CREATE POLICY user_profiles_insert_authenticated
      ON public.user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END$$;

-- Grant least-privilege permissions
-- Schema usage for all roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- public_users: SELECT for anon/authenticated, INSERT for authenticated
GRANT SELECT ON public.public_users TO anon, authenticated;
GRANT INSERT ON public.public_users TO authenticated;

-- user_profiles: SELECT only for authenticated (writes via trigger/server)
GRANT SELECT ON public.user_profiles TO authenticated;

-- service_role retains full control for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;


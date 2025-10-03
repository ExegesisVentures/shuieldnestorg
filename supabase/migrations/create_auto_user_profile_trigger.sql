-- Create function to automatically create public user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_public_user_id UUID;
BEGIN
  -- Check if profile already exists (avoid duplicates)
  IF EXISTS (
    SELECT 1 FROM public.user_profiles WHERE auth_user_id = NEW.id
  ) THEN
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
$$;

-- Create trigger that fires when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also handle existing users who don't have profiles yet
-- This is a one-time backfill
DO $$
DECLARE
  auth_user RECORD;
  new_public_user_id UUID;
BEGIN
  FOR auth_user IN 
    SELECT au.id, au.email 
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.auth_user_id
    WHERE up.auth_user_id IS NULL
  LOOP
    -- Create public_users record
    INSERT INTO public.public_users (email, created_at)
    VALUES (auth_user.email, NOW())
    RETURNING id INTO new_public_user_id;

    -- Create user_profiles mapping
    INSERT INTO public.user_profiles (auth_user_id, public_user_id, created_at)
    VALUES (auth_user.id, new_public_user_id, NOW());

    RAISE NOTICE 'Created profile for user: %', auth_user.id;
  END LOOP;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;


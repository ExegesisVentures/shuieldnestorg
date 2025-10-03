-- =====================================================
-- Clean Up Invalid .local Email Addresses
-- =====================================================
-- This script removes users created with invalid .local
-- email addresses from the wallet-bootstrap flow.
-- 
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: View users with .local emails (SAFE - just viewing)
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'wallet_bootstrap' as is_wallet_bootstrap,
  raw_user_meta_data->>'wallet_address' as wallet_address
FROM auth.users
WHERE email LIKE '%@wallet.shieldnest.local'
ORDER BY created_at DESC;

-- =====================================================
-- CAUTION: The commands below will DELETE data
-- Review the SELECT results above before proceeding
-- =====================================================

-- Step 2: Get the auth user IDs to clean up
-- (Uncomment to execute)
/*
DO $$
DECLARE
  user_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  -- Loop through all users with .local emails
  FOR user_record IN 
    SELECT id, email
    FROM auth.users
    WHERE email LIKE '%@wallet.shieldnest.local'
  LOOP
    RAISE NOTICE 'Processing user: % (%)', user_record.email, user_record.id;
    
    -- Delete from user_profiles (this will cascade to other tables due to RLS)
    DELETE FROM user_profiles WHERE auth_user_id = user_record.id;
    
    -- Delete from auth.users
    -- Note: This requires service_role access
    DELETE FROM auth.users WHERE id = user_record.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Cleanup complete. Deleted % users with .local emails', deleted_count;
END $$;
*/

-- =====================================================
-- Alternative: Manual cleanup (if DO block doesn't work)
-- =====================================================

-- Step 2a: Delete user_profiles for .local email users
-- (Uncomment to execute)
/*
DELETE FROM user_profiles
WHERE auth_user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@wallet.shieldnest.local'
);
*/

-- Step 2b: Delete the auth users themselves
-- NOTE: This requires service_role access in Supabase
-- You may need to run this through the Supabase Dashboard
-- (Uncomment to execute)
/*
DELETE FROM auth.users
WHERE email LIKE '%@wallet.shieldnest.local';
*/

-- =====================================================
-- Verification: Check that cleanup was successful
-- =====================================================

-- Run this after cleanup to verify
SELECT COUNT(*) as remaining_local_emails
FROM auth.users
WHERE email LIKE '%@wallet.shieldnest.local';

-- Should return 0 if cleanup was successful


# Automatic User Profile Creation

## Problem
User profiles (`public_users` and `user_profiles`) were being created manually in application code, which is error-prone and can fail silently.

## Solution
Use a **PostgreSQL Database Trigger** to automatically create user profiles when a user signs up.

## How It Works

### 1. Trigger Function
When a new row is inserted into `auth.users` (user signs up), the `handle_new_user()` function:
1. Checks if profile already exists (avoid duplicates)
2. Creates a `public_users` record
3. Creates a `user_profiles` mapping linking `auth.users.id` to `public_users.id`

### 2. Automatic & Guaranteed
- Happens **automatically** on every sign-up
- Runs **in the same database transaction** as user creation
- **Cannot be skipped** or forgotten
- Works for ALL sign-up methods (email/password, OAuth, anonymous, wallet-bootstrap)

### 3. Backfill Existing Users
The migration also includes a one-time script that creates profiles for any existing users who don't have them.

## Installation

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project → **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/create_auto_user_profile_trigger.sql`
4. Paste and **Run** the query
5. Verify in the logs that existing users were backfilled

### Option 2: Via Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd /Users/exe/Downloads/Cursor/shuieldnestorg

# Run the migration
supabase db push

# Or apply specific migration
supabase migration up
```

## Verification

After running the migration, verify it works:

### 1. Check Trigger Exists
```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### 2. Check Existing Users Have Profiles
```sql
SELECT 
  au.id as auth_user_id,
  au.email,
  up.public_user_id,
  pu.email as public_email
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.auth_user_id
LEFT JOIN public.public_users pu ON up.public_user_id = pu.id;
```

All users should have non-null `public_user_id`.

### 3. Test New User Creation
1. Create a test account in your app
2. Immediately check the database
3. The user should have a `public_users` record and `user_profiles` mapping

## Benefits

✅ **Automatic** - No application code needed  
✅ **Reliable** - Runs in database transaction  
✅ **Consistent** - Works for all sign-up methods  
✅ **Fast** - Happens instantly on sign-up  
✅ **Retroactive** - Backfills existing users  

## Application Code Cleanup

After the trigger is in place, you can **simplify** the application code:

### Before (Complex)
```typescript
// In signUpAction
const { data, error } = await client.auth.signUp({ email, password });
if (data.user) {
  // Manually create profile - might fail!
  const serviceClient = createServiceRoleClient();
  await ensurePublicUserProfile(serviceClient);
}
```

### After (Simple)
```typescript
// In signUpAction
const { data, error } = await client.auth.signUp({ email, password });
// Profile is automatically created by database trigger!
```

You can remove all the `ensurePublicUserProfile` calls from:
- `app/actions.ts` (signInAction, signUpAction)
- `hooks/useWalletConnect.ts`
- `app/api/user/profile/route.ts` (can delete this endpoint)

## Troubleshooting

### Trigger not firing?
Check if it's enabled:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Profiles not created for existing users?
Run the backfill manually:
```sql
-- See the migration file for the DO block
```

### Permission errors?
Make sure the function has SECURITY DEFINER and proper grants.


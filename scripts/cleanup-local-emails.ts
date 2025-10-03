/**
 * Cleanup Script for Invalid .local Email Addresses
 * 
 * This script removes users created with invalid @wallet.shieldnest.local
 * email addresses from the wallet-bootstrap flow.
 * 
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✓" : "✗");
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface LocalEmailUser {
  id: string;
  email: string;
  created_at: string;
  wallet_bootstrap?: boolean;
  wallet_address?: string;
}

async function inspectLocalEmailUsers(): Promise<LocalEmailUser[]> {
  console.log("\n🔍 Step 1: Inspecting users with .local emails...\n");

  // Use admin API to list all users, then filter
  const { data: listData, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("❌ Error fetching users:", error);
    return [];
  }

  // Filter for .local emails
  const users = listData.users.filter((u) => 
    u.email?.includes("@wallet.shieldnest.local")
  );

  if (users.length === 0) {
    console.log("✅ No users with .local emails found!");
    return [];
  }

  const formattedUsers: LocalEmailUser[] = users.map((u) => ({
    id: u.id,
    email: u.email || "",
    created_at: u.created_at,
    wallet_bootstrap: u.user_metadata?.wallet_bootstrap,
    wallet_address: u.user_metadata?.wallet_address,
  }));

  console.log(`Found ${formattedUsers.length} users with .local emails:\n`);
  formattedUsers.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`   Wallet Bootstrap: ${user.wallet_bootstrap ? "Yes" : "No"}`);
    if (user.wallet_address) {
      console.log(`   Wallet Address: ${user.wallet_address}`);
    }
    console.log("");
  });

  return formattedUsers;
}

async function deleteUserProfiles(userIds: string[]): Promise<number> {
  console.log("\n🗑️  Step 2: Deleting user profiles...\n");

  let totalDeleted = 0;

  // Delete private_user_profiles first (if any exist)
  const { data: privateProfiles, error: privateError } = await supabase
    .from("private_user_profiles")
    .delete()
    .in("auth_user_id", userIds)
    .select();

  if (privateError) {
    console.error("⚠️  Error deleting private_user_profiles:", privateError.message);
  } else {
    const count = privateProfiles?.length || 0;
    console.log(`   Deleted ${count} private_user_profiles`);
    totalDeleted += count;
  }

  // Delete user_profiles
  const { data: publicProfiles, error: publicError } = await supabase
    .from("user_profiles")
    .delete()
    .in("auth_user_id", userIds)
    .select();

  if (publicError) {
    console.error("⚠️  Error deleting user_profiles:", publicError.message);
  } else {
    const count = publicProfiles?.length || 0;
    console.log(`   Deleted ${count} user_profiles`);
    totalDeleted += count;
  }

  console.log(`\n   Total profiles deleted: ${totalDeleted}`);
  return totalDeleted;
}

async function deleteRelatedData(userIds: string[]): Promise<void> {
  console.log("\n🗑️  Step 3: Deleting related user data...\n");

  // Get public_user_ids from user_profiles (if they still exist somehow)
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("public_user_id")
    .in("auth_user_id", userIds);

  const publicUserIds = profiles?.map((p: any) => p.public_user_id) || [];

  if (publicUserIds.length > 0) {
    // Delete wallets
    const { data: wallets, error: walletsError } = await supabase
      .from("wallets")
      .delete()
      .in("user_id", publicUserIds)
      .select();

    if (walletsError) {
      console.error("⚠️  Error deleting wallets:", walletsError.message);
    } else {
      console.log(`   Deleted ${wallets?.length || 0} wallets`);
    }

    // Delete portfolio_addresses (if exists)
    const { data: addresses, error: addressesError } = await supabase
      .from("portfolio_addresses")
      .delete()
      .in("user_id", publicUserIds)
      .select();

    if (addressesError && !addressesError.message.includes("does not exist")) {
      console.error("⚠️  Error deleting portfolio_addresses:", addressesError.message);
    } else if (addresses) {
      console.log(`   Deleted ${addresses.length} portfolio_addresses`);
    }

    // Delete public_users
    const { data: publicUsers, error: publicUsersError } = await supabase
      .from("public_users")
      .delete()
      .in("id", publicUserIds)
      .select();

    if (publicUsersError) {
      console.error("⚠️  Error deleting public_users:", publicUsersError.message);
    } else {
      console.log(`   Deleted ${publicUsers?.length || 0} public_users`);
    }
  }
}

async function deleteAuthUsers(userIds: string[]): Promise<number> {
  console.log("\n🗑️  Step 4: Deleting auth.users (requires service_role)...\n");

  let deletedCount = 0;

  for (const userId of userIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error(`   ❌ Failed to delete user ${userId}:`, error.message);
    } else {
      deletedCount++;
      console.log(`   ✓ Deleted user ${userId}`);
    }
  }

  console.log(`\n   Total auth users deleted: ${deletedCount} / ${userIds.length}`);
  return deletedCount;
}

async function verifyCleanup(): Promise<void> {
  console.log("\n✅ Step 5: Verifying cleanup...\n");

  const { data: listData, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("❌ Error checking remaining users:", error);
    return;
  }

  const remainingUsers = listData.users.filter((u) =>
    u.email?.includes("@wallet.shieldnest.local")
  );

  const count = remainingUsers.length;

  if (count === 0) {
    console.log("✅ SUCCESS! No .local email addresses remain in the database.");
  } else {
    console.log(`⚠️  WARNING: ${count} .local email addresses still remain:`);
    remainingUsers.forEach((u) => {
      console.log(`   - ${u.email} (${u.id})`);
    });
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("🧹 ShieldNest - Cleanup Invalid .local Email Addresses");
  console.log("=".repeat(60));

  try {
    // Step 1: Inspect
    const users = await inspectLocalEmailUsers();

    if (users.length === 0) {
      console.log("\n✨ Nothing to clean up!\n");
      return;
    }

    // Confirm before proceeding
    console.log("⚠️  WARNING: This will permanently delete these users and all their data!\n");
    console.log("Press Ctrl+C within 5 seconds to cancel...\n");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("⏳ Proceeding with cleanup...\n");

    const userIds = users.map((u) => u.id);

    // Step 2: Delete user profiles (must be first due to FK constraints)
    await deleteUserProfiles(userIds);

    // Step 3: Delete related data
    await deleteRelatedData(userIds);

    // Step 4: Delete auth users
    await deleteAuthUsers(userIds);

    // Step 5: Verify
    await verifyCleanup();

    console.log("\n" + "=".repeat(60));
    console.log("✅ Cleanup complete!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
main();


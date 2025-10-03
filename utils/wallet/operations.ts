/**
 * Wallet CRUD Operations
 * Handles wallet management with Supabase
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { uiError, UiError } from "@/utils/errors";

export interface Wallet {
  id: string;
  user_id: string;
  user_scope: "public" | "private";
  chain_id: string;
  address: string;
  label: string;
  read_only: boolean;
  is_primary: boolean;
  created_at: string;
}

/**
 * Fetch all wallets for the current user
 */
export async function fetchUserWallets(
  supabase: SupabaseClient,
  userId: string,
  userScope: "public" | "private"
): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("user_scope", userScope)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching wallets:", error);
    return [];
  }

  return data || [];
}

/**
 * Add a new wallet
 */
export async function addWallet(
  supabase: SupabaseClient,
  userId: string,
  userScope: "public" | "private",
  address: string,
  label: string,
  chainId: string = "coreum-mainnet-1",
  readOnly: boolean = false
): Promise<{ success: boolean; wallet?: Wallet; error?: UiError }> {
  // Check if wallet already exists for this user
  const { data: existing } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", userId)
    .eq("user_scope", userScope)
    .eq("address", address.toLowerCase())
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: uiError("WALLET_EXISTS", "This wallet is already connected to your account."),
    };
  }

  // Check if this is the first wallet (make it primary)
  const { count } = await supabase
    .from("wallets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("user_scope", userScope);

  const isPrimary = (count || 0) === 0;

  // Insert new wallet
  const { data, error } = await supabase
    .from("wallets")
    .insert({
      user_id: userId,
      user_scope: userScope,
      chain_id: chainId,
      address: address.toLowerCase(),
      label,
      read_only: readOnly,
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding wallet:", error);
    return {
      success: false,
      error: uiError("WALLET_ADD_FAILED", "Failed to add wallet.", error.message),
    };
  }

  return { success: true, wallet: data };
}

/**
 * Update wallet label
 */
export async function updateWalletLabel(
  supabase: SupabaseClient,
  walletId: string,
  newLabel: string
): Promise<{ success: boolean; error?: UiError }> {
  const { error } = await supabase
    .from("wallets")
    .update({ label: newLabel })
    .eq("id", walletId);

  if (error) {
    console.error("Error updating wallet label:", error);
    return {
      success: false,
      error: uiError("WALLET_UPDATE_FAILED", "Failed to update wallet label.", error.message),
    };
  }

  return { success: true };
}

/**
 * Delete a wallet
 */
export async function deleteWallet(
  supabase: SupabaseClient,
  walletId: string
): Promise<{ success: boolean; error?: UiError }> {
  const { error } = await supabase
    .from("wallets")
    .delete()
    .eq("id", walletId);

  if (error) {
    console.error("Error deleting wallet:", error);
    return {
      success: false,
      error: uiError("WALLET_DELETE_FAILED", "Failed to delete wallet.", error.message),
    };
  }

  return { success: true };
}

/**
 * Set a wallet as primary
 */
export async function setPrimaryWallet(
  supabase: SupabaseClient,
  userId: string,
  userScope: "public" | "private",
  walletId: string
): Promise<{ success: boolean; error?: UiError }> {
  // First, unset all primary flags
  const { error: unsetError } = await supabase
    .from("wallets")
    .update({ is_primary: false })
    .eq("user_id", userId)
    .eq("user_scope", userScope);

  if (unsetError) {
    console.error("Error unsetting primary wallets:", unsetError);
    return {
      success: false,
      error: uiError("PRIMARY_UPDATE_FAILED", "Failed to update primary wallet.", unsetError.message),
    };
  }

  // Set the new primary
  const { error: setError } = await supabase
    .from("wallets")
    .update({ is_primary: true })
    .eq("id", walletId);

  if (setError) {
    console.error("Error setting primary wallet:", setError);
    return {
      success: false,
      error: uiError("PRIMARY_UPDATE_FAILED", "Failed to set primary wallet.", setError.message),
    };
  }

  return { success: true };
}


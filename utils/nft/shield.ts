/**
 * Shield NFT utilities
 * Handles Shield NFT settings and placeholder value generation
 */

import { SupabaseClient } from "@supabase/supabase-js";

export type ShieldSettings = { 
  image_url: string | null; 
  min_usd: number; 
  max_usd: number 
};

/**
 * Fetch Shield NFT settings from database
 * Use with server-side or client-side Supabase client
 */
export async function fetchShieldSettings(supabase: SupabaseClient): Promise<ShieldSettings> {
  const { data } = await supabase
    .from("shield_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  
  return {
    image_url: data?.image_url ?? null,
    min_usd: Number(data?.min_usd ?? 5000),
    max_usd: Number(data?.max_usd ?? 6000),
  };
}

/**
 * Generate a stable placeholder USD value for a user
 * Uses deterministic seeded random based on userId
 * Returns the same value for the same userId consistently
 */
export function pickPlaceholderUsd(userId: string, min: number, max: number): number {
  // Stable-ish seeded pick per user
  const seed = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (Math.sin(seed) + 1) / 2; // 0..1
  return Math.round((min + r * (max - min)) * 100) / 100;
}

/**
 * Check if user owns Shield NFT
 * Checks nft_holdings_cache for the configured Shield NFT
 * TODO: Define Shield NFT contract/token ID in settings
 */
export async function hasShieldNft(
  supabase: SupabaseClient, 
  userId: string, 
  userScope: "public" | "private"
): Promise<boolean> {
  const { data } = await supabase
    .from("nft_holdings_cache")
    .select("id")
    .eq("user_id", userId)
    .eq("user_scope", userScope)
    .eq("chain_id", "coreum-mainnet-1")
    // TODO: Add filter for specific Shield NFT contract/token_id
    .limit(1)
    .maybeSingle();

  return !!data;
}


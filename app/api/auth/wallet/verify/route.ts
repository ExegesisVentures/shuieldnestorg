import { NextResponse } from "next/server";
import { uiError } from "@/utils/errors";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { ensurePublicUserProfile, getPublicUserId } from "@/utils/supabase/user-profile";
import { verifyAndConsumeNonce } from "@/utils/wallet/adr36";

/**
 * Verify wallet signature and link to user account
 * 
 * Two scenarios:
 * 1. Authenticated user linking a wallet -> add to their existing profile
 * 2. Anonymous user (wallet-bootstrap) -> create temp auth user, then link
 */
export async function POST(req: Request) {
  try {
    const { address, signature, nonce } = await req.json();
    if (!address || !signature || !nonce) {
      return NextResponse.json(uiError("BAD_REQUEST","Missing fields"), { status: 400 });
    }

    // TODO: Use publicKey for ADR-36 signature verification with cosmjs

    // Use service role client to bypass RLS for user creation
    const supabase = createServiceRoleClient();

    // Verify nonce is valid and not expired
    const nonceCheck = await verifyAndConsumeNonce(supabase, nonce, address);
    if (!nonceCheck.valid) {
      return NextResponse.json(
        uiError("NONCE_INVALID", nonceCheck.error || "Invalid or expired nonce."),
        { status: 400 }
      );
    }

    // TODO: verify ADR-36 signature properly (cosmjs). For MVP we accept and mark as unverified.

    // Check if user is authenticated
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      // Scenario 2: Wallet-bootstrap - create user account via anonymous auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            wallet_bootstrap: true,
            wallet_address: address,
          }
        }
      });

      // Check if anonymous auth is disabled
      if (signUpError?.message?.includes("Anonymous sign-ins are disabled")) {
        return NextResponse.json(
          uiError(
            "ANONYMOUS_AUTH_DISABLED",
            "Wallet authentication requires anonymous sign-in to be enabled.",
            "Please enable Anonymous authentication in Supabase: Authentication → Providers → Anonymous → Enable"
          ),
          { status: 500 }
        );
      }

      if (signUpError || !signUpData.user) {
        return NextResponse.json(
          uiError("AUTH_FAILED", "Could not create wallet-based account.", signUpError?.message),
          { status: 500 }
        );
      }

      // Create public user profile and mapping
      const publicUserId = await ensurePublicUserProfile(supabase);

      // Link wallet to new public user
      const { error: walletError } = await supabase.from("wallets").insert({
        user_id: publicUserId,
        user_scope: "public",
        chain_id: "coreum-mainnet-1",
        address,
        label: "Primary Wallet",
        read_only: false,
        is_primary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (walletError) {
        return NextResponse.json(
          uiError("WALLET_LINK_FAILED", "Could not link wallet.", walletError.message),
          { status: 500 }
        );
      }

      return NextResponse.json({
        linked: true,
        userId: publicUserId,
        verified: false,
        walletBootstrap: true,
        message: "Wallet connected successfully! You can optionally add an email in settings."
      });
    }

    // Scenario 1: Authenticated user linking additional wallet
    const publicUserId = await getPublicUserId(supabase);
    
    if (!publicUserId) {
      // Create public profile if it doesn't exist
      await ensurePublicUserProfile(supabase);
      const newPublicUserId = await getPublicUserId(supabase);
      
      if (!newPublicUserId) {
        return NextResponse.json(
          uiError("PROFILE_ERROR", "Could not find or create user profile."),
          { status: 500 }
        );
      }
    }

    const finalPublicUserId = publicUserId || await getPublicUserId(supabase);

    // Check if wallet already exists for this user
    const { data: existingWallet } = await supabase
      .from("wallets")
      .select("id")
      .eq("address", address)
      .eq("user_id", finalPublicUserId)
      .eq("user_scope", "public")
      .maybeSingle();

    if (existingWallet) {
      return NextResponse.json({
        linked: true,
        userId: finalPublicUserId,
        verified: false,
        message: "Wallet already linked to your account."
      });
    }

    // Check if this is the first wallet (should be primary)
    const { data: walletCount } = await supabase
      .from("wallets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", finalPublicUserId)
      .eq("user_scope", "public");

    const isPrimary = (walletCount || 0) === 0;

    // Link wallet to authenticated user
    const { error: walletError } = await supabase.from("wallets").insert({
      user_id: finalPublicUserId,
      user_scope: "public",
      chain_id: "coreum-mainnet-1",
      address,
      label: isPrimary ? "Primary Wallet" : "Wallet",
      read_only: false,
      is_primary: isPrimary,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (walletError) {
      return NextResponse.json(
        uiError("WALLET_LINK_FAILED", "Could not link wallet.", walletError.message),
        { status: 500 }
      );
    }

    return NextResponse.json({
      linked: true,
      userId: finalPublicUserId,
      verified: false,
      message: "Wallet linked successfully."
    });

  } catch (e) {
    console.error("Wallet verify error:", e);
    const err = uiError("VERIFY_FAILED","Could not verify wallet signature.","Try again.");
    return NextResponse.json(err, { status: 500 });
  }
}


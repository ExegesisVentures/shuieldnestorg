"use client";

import { useState, useCallback } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { keplrGetAddress, keplrSignArbitrary } from "@/utils/wallet/keplr";
import { leapGetAddress, leapSignArbitrary } from "@/utils/wallet/leap";
import { cosmostationGetAddress, cosmostationSignArbitrary } from "@/utils/wallet/cosmostation";
import { makeSignDoc } from "@/utils/wallet/adr36";
import { UiError } from "@/utils/errors";

type WalletProvider = "keplr" | "leap" | "cosmostation";

interface ConnectResult {
  success: boolean;
  error?: UiError;
  walletBootstrap?: boolean;
}

export function useWalletConnect() {
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState<WalletProvider | null>(null);
  
  const connectWallet = useCallback(async (walletProvider: WalletProvider): Promise<ConnectResult> => {
    setConnecting(true);
    setProvider(walletProvider);

    try {
      // Step 1: Get wallet address
      let address: string;
      let signFn: (address: string, message: string) => Promise<any>;

      switch (walletProvider) {
        case "keplr":
          address = await keplrGetAddress();
          signFn = keplrSignArbitrary;
          break;
        case "leap":
          address = await leapGetAddress();
          signFn = leapSignArbitrary;
          break;
        case "cosmostation":
          address = await cosmostationGetAddress();
          signFn = cosmostationSignArbitrary;
          break;
        default:
          throw new Error("Unknown wallet provider");
      }

      // Step 2: Request nonce from API
      const nonceResponse = await fetch(`/api/auth/wallet/nonce?address=${encodeURIComponent(address)}`);
      
      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        return {
          success: false,
          error: errorData as UiError,
        };
      }

      const { nonce } = await nonceResponse.json();

      // Step 3: Create sign document
      const signDoc = makeSignDoc(address, nonce);

      // Step 4: Request signature from wallet
      const signatureResult = await signFn(address, signDoc);

      // Step 5: Verify signature with API
      const verifyResponse = await fetch("/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          signature: signatureResult.signature,
          nonce,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        return {
          success: false,
          error: errorData as UiError,
        };
      }

      const result = await verifyResponse.json();

      return {
        success: true,
        walletBootstrap: result.walletBootstrap,
      };
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Map common errors to friendly messages
      let code = "CONNECTION_FAILED";
      let message = "Failed to connect wallet";
      let hint = "Please try again";

      if (errorMessage.includes("WALLET_NOT_INSTALLED")) {
        code = "WALLET_NOT_INSTALLED";
        message = `${walletProvider} wallet not found`;
        hint = `Please install the ${walletProvider} browser extension`;
      } else if (errorMessage.includes("User rejected")) {
        code = "USER_REJECTED";
        message = "Connection cancelled";
        hint = "Please approve the connection in your wallet";
      }

      return {
        success: false,
        error: { code, message, hint },
      };
    } finally {
      setConnecting(false);
      setProvider(null);
    }
  }, []);

  const addManualAddress = useCallback(async (address: string, label?: string): Promise<ConnectResult> => {
    setConnecting(true);

    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: {
            code: "NOT_AUTHENTICATED",
            message: "You must be logged in to add addresses",
            hint: "Please sign in first",
          },
        };
      }

      // Get user's public_user_id
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("public_user_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile?.public_user_id) {
        return {
          success: false,
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "User profile not found",
          },
        };
      }

      // Check if wallet already exists
      const { data: existing } = await supabase
        .from("wallets")
        .select("id")
        .eq("address", address)
        .eq("user_id", profile.public_user_id)
        .eq("user_scope", "public")
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: {
            code: "WALLET_EXISTS",
            message: "This address is already added",
          },
        };
      }

      // Check if this is the first wallet
      const { count } = await supabase
        .from("wallets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.public_user_id)
        .eq("user_scope", "public");

      const isPrimary = (count || 0) === 0;

      // Add wallet
      const { error: insertError } = await supabase.from("wallets").insert({
        user_id: profile.public_user_id,
        user_scope: "public",
        chain_id: "coreum-mainnet-1",
        address,
        label: label || "Manual Address",
        read_only: true,
        is_primary: isPrimary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        return {
          success: false,
          error: {
            code: "INSERT_FAILED",
            message: "Failed to add address",
            hint: insertError.message,
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Manual address error:", error);
      return {
        success: false,
        error: {
          code: "ADD_FAILED",
          message: "Failed to add address",
        },
      };
    } finally {
      setConnecting(false);
    }
  }, []);

  return {
    connectWallet,
    addManualAddress,
    connecting,
    provider,
  };
}


import { NextResponse } from "next/server";
import { makeNonce } from "@/utils/wallet/adr36";
import { uiError } from "@/utils/errors";
import { createSupabaseClient } from "@/utils/supabase/server";

/**
 * Generate a nonce for wallet signature verification
 * Stores nonce with expiry for later verification
 */
export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseClient();
    const nonce = makeNonce();
    
    // Get address from query params (REQUIRED with your new schema)
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        uiError("BAD_REQUEST", "Address parameter is required"),
        { status: 400 }
      );
    }

    // Store nonce (expires_at has default of now() + 10 minutes in DB)
    const { error: insertError } = await supabase.from("wallet_nonces").insert({
      nonce,
      address: address.toLowerCase(), // Normalize to lowercase
      // expires_at will use DB default (now() + 10 minutes)
      // used will default to false
      // created_at will default to now()
    });

    if (insertError) {
      console.error("Failed to store nonce:", insertError);
      return NextResponse.json(
        uiError("NONCE_STORAGE_FAILED", "Could not store nonce", insertError.message),
        { status: 500 }
      );
    }

    // Calculate expiry for response (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    return NextResponse.json({ nonce, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    console.error("Nonce generation error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    const err = uiError("NONCE_FAILED", "Could not create a login nonce.", errorMessage);
    return NextResponse.json(err, { status: 500 });
  }
}


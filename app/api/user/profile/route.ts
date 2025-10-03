import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { ensurePublicUserProfile } from "@/utils/supabase/user-profile";

/**
 * POST /api/user/profile
 * Ensures the authenticated user has a public user profile
 * Uses service role client to bypass RLS
 */
export async function POST() {
  try {
    // Verify user is authenticated
    const client = await createSupabaseClient();
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create profile using service role client to bypass RLS
    const serviceClient = createServiceRoleClient();
    const publicUserId = await ensurePublicUserProfile(serviceClient);

    return NextResponse.json({ 
      success: true,
      publicUserId 
    });
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create user profile",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


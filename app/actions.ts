"use server";

import { createSupabaseClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/redirect";
import { ensurePublicUserProfile } from "@/utils/supabase/user-profile";

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const client = await createSupabaseClient();

  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Ensure public user profile exists (for existing users who signed up before this change)
  // Use service role client to bypass RLS
  try {
    const serviceClient = createServiceRoleClient();
    await ensurePublicUserProfile(serviceClient);
  } catch (e) {
    console.error("Failed to ensure public user profile:", e);
    // Don't block sign-in, profile will be created on first wallet connection if needed
  }

  return redirect("/dashboard");
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const client = await createSupabaseClient();

  const url = process.env.VERCEL_URL
    ? `${process.env.VERCEL_URL}/dashboard`
    : "http://localhost:3000/dashboard";

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: url,
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // Create public_users record and mapping for new user
  // Use service role client to bypass RLS
  if (data.user) {
    try {
      const serviceClient = createServiceRoleClient();
      await ensurePublicUserProfile(serviceClient);
    } catch (e) {
      console.error("Failed to create public user profile:", e);
      return encodedRedirect("error", "/sign-up", "Account created but profile setup failed. Please contact support.");
    }
  }

  return redirect("/dashboard");
};

export const signOutAction = async () => {
  const client = await createSupabaseClient();
  await client.auth.signOut();
  return redirect("/");
};

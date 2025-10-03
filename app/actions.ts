"use server";

import { createSupabaseClient } from "@/utils/supabase/server";
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
  try {
    await ensurePublicUserProfile(client);
  } catch (e) {
    console.error("Failed to ensure public user profile:", e);
  }

  return redirect("/protected");
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const client = await createSupabaseClient();

  const url = process.env.VERCEL_URL
    ? `${process.env.VERCEL_URL}/protected`
    : "http://localhost:3000/protected";

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
  if (data.user) {
    try {
      await ensurePublicUserProfile(client);
    } catch (e) {
      console.error("Failed to create public user profile:", e);
      return encodedRedirect("error", "/sign-up", "Account created but profile setup failed. Please contact support.");
    }
  }

  return redirect("/protected");
};

export const signOutAction = async () => {
  const client = await createSupabaseClient();
  await client.auth.signOut();
  return redirect("/sign-in");
};

"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import ShieldNftPanel from "@/components/membership/ShieldNftPanel";
import MembershipCTA from "@/components/membership/MembershipCTA";
import { createSupabaseClient } from "@/utils/supabase/client";
import { fetchShieldSettings, pickPlaceholderUsd } from "@/utils/nft/shield";

export default function Membership() {
  const [userType, setUserType] = useState<"visitor" | "public" | "private">("visitor");
  const [shieldSettings, setShieldSettings] = useState<{ image_url: string | null; min_usd: number; max_usd: number } | null>(null);
  const [placeholderValue, setPlaceholderValue] = useState(5500);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
    loadShieldSettings();
  }, []);

  const checkUserStatus = async () => {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setUserType("visitor");
      setLoading(false);
      return;
    }

    // Check for private membership
    const { data: privateProfile } = await supabase
      .from("private_user_profiles")
      .select("private_user_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (privateProfile?.private_user_id) {
      const { data: privateUser } = await supabase
        .from("private_users")
        .select("pma_signed, shield_nft_verified")
        .eq("id", privateProfile.private_user_id)
        .single();

      if (privateUser?.pma_signed && privateUser?.shield_nft_verified) {
        setUserType("private");
        setLoading(false);
        return;
      }
    }

    setUserType("public");
    setLoading(false);
  };

  const loadShieldSettings = async () => {
    try {
      const supabase = createSupabaseClient();
      const settings = await fetchShieldSettings(supabase);
      setShieldSettings(settings);
      
      // Get user ID for placeholder calculation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const value = pickPlaceholderUsd(user.id, settings.min_usd, settings.max_usd);
        setPlaceholderValue(value);
      }
    } catch (error) {
      console.error("Failed to load shield settings:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 px-4 py-2 rounded-full mb-4">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Exclusive Membership
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Shield Membership
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {userType === "private"
              ? "Welcome back, Shield Member! Enjoy your exclusive benefits."
              : "Unlock exclusive NFT analytics, advanced features, and PMA legal protection."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shield NFT Panel */}
          <div>
            <ShieldNftPanel
              imageUrl={shieldSettings?.image_url || null}
              valueUsd={placeholderValue}
              isOwner={userType === "private"}
              loading={loading}
            />
          </div>

          {/* Membership CTA or Status */}
          <div className="flex flex-col justify-center">
            <MembershipCTA userType={userType} />

            {userType !== "private" && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  How It Works
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {userType === "visitor" ? "Create Account" : "Sign PMA"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userType === "visitor"
                          ? "Create a free account to get started"
                          : "Review and sign the Private Member Agreement"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {userType === "visitor" ? "Connect Wallet" : "Acquire Shield NFT"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userType === "visitor"
                          ? "Link your Coreum wallet to your account"
                          : "Purchase the exclusive Shield NFT"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Unlock Features
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Access exclusive dashboard, analytics, and member tools
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        {userType !== "private" && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Membership Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "📊",
                  title: "Advanced Analytics",
                  description: "Deep insights into your portfolio performance",
                },
                {
                  icon: "🎨",
                  title: "NFT Dashboard",
                  description: "Exclusive access to NFT metrics and tools",
                },
                {
                  icon: "🔒",
                  title: "PMA Protection",
                  description: "Legal protection through Private Member Agreement",
                },
                {
                  icon: "⚡",
                  title: "Early Access",
                  description: "First access to new features and updates",
                },
              ].map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


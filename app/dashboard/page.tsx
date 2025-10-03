"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ExitIntentPrompt from "@/components/misc/ExitIntentPrompt";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";
import ConnectedWallets from "@/components/wallet/ConnectedWallets";
import PortfolioTotals from "@/components/portfolio/PortfolioTotals";
import TokenTable from "@/components/portfolio/TokenTable";
import UpgradeNudge from "@/components/nudges/UpgradeNudge";
import { createSupabaseClient } from "@/utils/supabase/client";
import { fetchUserWallets } from "@/utils/wallet/operations";
import { getMultiAddressBalances, EnrichedBalance } from "@/utils/coreum/rpc";

export default function Dashboard() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletCount, setWalletCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [tokens, setTokens] = useState<EnrichedBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [refreshCounter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        // Get user's public_user_id
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("public_user_id")
          .eq("auth_user_id", user.id)
          .single();

        if (profile?.public_user_id) {
          // Fetch wallets
          const wallets = await fetchUserWallets(supabase, profile.public_user_id, "public");
          setWalletCount(wallets.length);

          if (wallets.length > 0) {
            // Fetch balances for all wallets
            const addresses = wallets.map((w) => w.address);
            const { aggregated, totalValueUsd } = await getMultiAddressBalances(addresses);
            
            setTokens(aggregated);
            setTotalValue(totalValueUsd);
            
            // Calculate weighted average 24h change
            if (totalValueUsd > 0) {
              const weightedChange = aggregated.reduce((acc, token) => {
                const weight = token.valueUsd / totalValueUsd;
                return acc + (token.change24h * weight);
              }, 0);
              setChange24h(weightedChange);
            } else {
              setChange24h(0);
            }
          } else {
            setTokens([]);
            setTotalValue(0);
            setChange24h(0);
          }
        }
      } else {
        // Not authenticated - visitor mode
        setWalletCount(0);
        setTokens([]);
        setTotalValue(0);
        setChange24h(0);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionSuccess = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your Coreum assets and manage your wallets
          </p>
        </div>

        {/* Visitor Nudge */}
        {!isAuthenticated && (
          <div className="mb-6">
            <UpgradeNudge
              message="Your portfolio data will be lost unless you save it. Create a free account to keep your wallets and track your portfolio."
              ctaText="Create Free Account"
              ctaHref="/sign-up"
            />
          </div>
        )}

        {/* Portfolio Totals */}
        <div className="mb-6">
          <PortfolioTotals
            totalValue={totalValue}
            change24h={change24h}
            walletCount={walletCount}
            loading={loading}
          />
        </div>

        {/* Connected Wallets Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Your Wallets
            </h2>
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Wallet</span>
            </button>
          </div>

          <ConnectedWallets onRefresh={refreshCounter} />
        </div>

        {/* Token Holdings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Token Holdings
          </h2>
          <TokenTable 
            tokens={tokens.map(t => ({
              symbol: t.symbol,
              name: t.name,
              balance: t.balanceFormatted,
              valueUsd: t.valueUsd,
              change24h: t.change24h,
              logoUrl: t.logoUrl,
            }))}
            loading={loading}
          />
        </div>
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={handleConnectionSuccess}
      />

      {/* Exit Intent for Visitors */}
      {!isAuthenticated && <ExitIntentPrompt />}
    </main>
  );
}


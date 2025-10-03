"use client";

import { useState, useEffect } from "react";
import SmartUpgradePrompt from "@/components/nudges/SmartUpgradePrompt";
import VisitorWalletMigrationPrompt from "@/components/nudges/VisitorWalletMigrationPrompt";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";
import PortfolioTotals from "@/components/portfolio/PortfolioTotals";
import CoreumBreakdown from "@/components/portfolio/CoreumBreakdown";
import TokenTable from "@/components/portfolio/TokenTable";
import UpgradeNudge from "@/components/nudges/UpgradeNudge";
import { createSupabaseClient } from "@/utils/supabase/client";
import { fetchUserWallets, Wallet } from "@/utils/wallet/operations";
import { getMultiAddressBalances, EnrichedBalance } from "@/utils/coreum/rpc";
import { updatePortfolioValue } from "@/utils/visitor-upgrade-rules";
import { hasVisitorWallets, isMigrationCompleted } from "@/utils/visitor-wallet-migration";

export default function Dashboard() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [publicUserId, setPublicUserId] = useState<string | null>(null);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [walletCount, setWalletCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [tokens, setTokens] = useState<EnrichedBalance[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [tokensByAddress, setTokensByAddress] = useState<Record<string, EnrichedBalance[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Listen for storage changes (for visitor addresses)
    const handleStorageChange = () => {
      loadDashboardData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshCounter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        // AUTHENTICATED USER MODE
        // Get user's public_user_id - should exist from database trigger
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("public_user_id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (!profile?.public_user_id) {
          // Profile should exist from database trigger
          console.error("No user profile found - database trigger may not be set up");
          setLoading(false);
          return;
        }

        if (profile.public_user_id) {
          setPublicUserId(profile.public_user_id);
          
          // Check if we should show migration prompt
          if (hasVisitorWallets() && !isMigrationCompleted()) {
            setShowMigrationPrompt(true);
          }
          
          // Fetch wallets
          const fetchedWallets = await fetchUserWallets(supabase, profile.public_user_id, "public");
          setWallets(fetchedWallets);
          setWalletCount(fetchedWallets.length);

          if (fetchedWallets.length > 0) {
            // Fetch balances for all wallets
            const addresses = fetchedWallets.map((w) => w.address);
            const { aggregated, totalValueUsd, byAddress } = await getMultiAddressBalances(addresses);
            
            setTokens(aggregated);
            setTokensByAddress(byAddress);
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
        // VISITOR MODE - use localStorage
        const visitorAddresses = JSON.parse(localStorage.getItem('visitor_addresses') || '[]');
        setWalletCount(visitorAddresses.length);

        if (visitorAddresses.length > 0) {
          // Fetch balances for visitor addresses
          const addresses = visitorAddresses.map((w: { address: string }) => w.address);
          const { aggregated, totalValueUsd, byAddress } = await getMultiAddressBalances(addresses);
          
          setTokens(aggregated);
          setTokensByAddress(byAddress);
          setTotalValue(totalValueUsd);
          
          // Store portfolio value for upgrade triggers
          updatePortfolioValue(totalValueUsd);
          
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
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionSuccess = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const handleMigrationComplete = () => {
    setShowMigrationPrompt(false);
    setRefreshCounter((prev) => prev + 1);
  };

  const handleMigrationDismiss = () => {
    setShowMigrationPrompt(false);
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
            onAddWallet={() => setShowConnectModal(true)}
            onRefresh={refreshCounter}
          />
        </div>

        {/* COREUM Balance Breakdown */}
        {(() => {
          if (walletCount > 0 && Object.keys(tokensByAddress).length > 0) {
            // Build per-wallet COREUM breakdown
            const coreumByWallet = isAuthenticated 
              ? wallets.map(w => {
                  const walletTokens = tokensByAddress[w.address] || [];
                  const coreumToken = walletTokens.find(t => t.symbol === 'COREUM');
                  return {
                    address: w.address,
                    label: w.label,
                    available: coreumToken?.available || "0",
                    staked: coreumToken?.staked || "0",
                    rewards: coreumToken?.rewards || "0",
                    unbonding: "0", // TODO: Add unbonding data from RPC
                  };
                })
              : JSON.parse(localStorage.getItem('visitor_addresses') || '[]').map((w: any) => {
                  const walletTokens = tokensByAddress[w.address] || [];
                  const coreumToken = walletTokens.find((t: EnrichedBalance) => t.symbol === 'COREUM');
                  return {
                    address: w.address,
                    label: w.label || w.address.slice(0, 10) + '...',
                    available: coreumToken?.available || "0",
                    staked: coreumToken?.staked || "0",
                    rewards: coreumToken?.rewards || "0",
                    unbonding: "0",
                  };
                });
            
            return (
              <div className="mb-6">
                <CoreumBreakdown tokens={coreumByWallet} loading={loading} />
              </div>
            );
          }
          return null;
        })()}

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
              denom: t.denom,
              available: t.available,
              staked: t.staked,
              rewards: t.rewards,
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

      {/* Smart Upgrade Prompt for Visitors */}
      {!isAuthenticated && <SmartUpgradePrompt />}

      {/* Visitor Wallet Migration Prompt for Authenticated Users */}
      {isAuthenticated && showMigrationPrompt && publicUserId && (
        <VisitorWalletMigrationPrompt
          publicUserId={publicUserId}
          onComplete={handleMigrationComplete}
          onDismiss={handleMigrationDismiss}
        />
      )}
    </main>
  );
}


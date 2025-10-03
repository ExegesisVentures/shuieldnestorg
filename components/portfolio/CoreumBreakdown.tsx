"use client";

import { Coins, TrendingUp, Gift, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CoreumToken {
  address: string;
  label: string;
  available: string;
  staked: string;
  rewards: string;
  unbonding?: string;
}

interface CoreumBreakdownProps {
  tokens: CoreumToken[];
  loading?: boolean;
}

export default function CoreumBreakdown({ tokens, loading }: CoreumBreakdownProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals across all wallets
  const totals = tokens.reduce(
    (acc, token) => ({
      available: acc.available + parseFloat(token.available || "0"),
      staked: acc.staked + parseFloat(token.staked || "0"),
      rewards: acc.rewards + parseFloat(token.rewards || "0"),
      unbonding: acc.unbonding + parseFloat(token.unbonding || "0"),
    }),
    { available: 0, staked: 0, rewards: 0, unbonding: 0 }
  );

  const hasMultipleWallets = tokens.length > 1;

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          COREUM Balance
        </h2>
        {hasMultipleWallets && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tokens.length} wallets combined
          </span>
        )}
      </div>

      {/* Total Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Available */}
        <Card className="p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Available
            </p>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatAmount(totals.available)}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">COREUM</p>
        </Card>

        {/* Staked */}
        <Card className="p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Staked
            </p>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatAmount(totals.staked)}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">COREUM</p>
        </Card>

        {/* Rewards */}
        <Card className="p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Rewards
            </p>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatAmount(totals.rewards)}
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">COREUM</p>
        </Card>

        {/* Unbonding */}
        <Card className="p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Unbonding
            </p>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {formatAmount(totals.unbonding)}
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">COREUM</p>
        </Card>
      </div>

      {/* Per-Wallet Breakdown (if multiple wallets) */}
      {hasMultipleWallets && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Per Wallet Breakdown
          </h3>
          <div className="space-y-3">
            {tokens.map((token, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {token.label}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Available</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatAmount(parseFloat(token.available || "0"))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Staked</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatAmount(parseFloat(token.staked || "0"))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Rewards</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatAmount(parseFloat(token.rewards || "0"))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Unbonding</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatAmount(parseFloat(token.unbonding || "0"))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

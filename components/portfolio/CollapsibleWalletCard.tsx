"use client";

import { useState } from "react";
import { Wallet, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import ConnectedWallets from "@/components/wallet/ConnectedWallets";

interface CollapsibleWalletCardProps {
  walletCount: number;
  loading?: boolean;
  onAddWallet: () => void;
  onRefresh?: number;
}

export default function CollapsibleWalletCard({
  walletCount,
  loading,
  onAddWallet,
  onRefresh,
}: CollapsibleWalletCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all relative">
      {/* Main Card - Clickable to expand */}
      <div
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Connected Wallets
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {walletCount}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            {/* Expand/Collapse Indicator */}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Wallet List */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Wallets
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddWallet();
              }}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all relative"
              title="Add Wallet"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Wallet</span>
              {/* Tooltip for mobile */}
              <span className="sm:hidden absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Add Wallet
              </span>
            </button>
          </div>

          <ConnectedWallets onRefresh={onRefresh} />
        </div>
      )}
    </Card>
  );
}

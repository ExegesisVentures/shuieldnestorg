"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ExitIntentPrompt from "@/components/misc/ExitIntentPrompt";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";
import ConnectedWallets from "@/components/wallet/ConnectedWallets";

export default function Dashboard() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleConnectionSuccess = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your Coreum assets and manage your wallets
          </p>
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

        {/* Portfolio Summary - Coming Soon */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Portfolio Summary
          </h2>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Portfolio totals coming soon...</p>
            <p className="text-sm mt-2">Add wallets to start tracking your assets</p>
          </div>
        </div>
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={handleConnectionSuccess}
      />

      {/* Exit Intent for Visitors */}
      <ExitIntentPrompt />
    </main>
  );
}


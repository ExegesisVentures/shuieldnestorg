"use client";

import { useState } from "react";
import { X } from "lucide-react";
import WalletButton from "./WalletButton";
import ManualAddressInput from "./ManualAddressInput";
import { useWalletConnect } from "@/hooks/useWalletConnect";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WalletConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: WalletConnectModalProps) {
  const { connectWallet, addManualAddress, connecting, provider } = useWalletConnect();
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async (walletProvider: "keplr" | "leap" | "cosmostation") => {
    setError(null);
    const result = await connectWallet(walletProvider);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else if (result.error) {
      setError(result.error.hint || result.error.message);
    }
  };

  const handleManualAdd = async (address: string, label?: string) => {
    setError(null);
    const result = await addManualAddress(address, label);

    if (result.success) {
      onSuccess?.();
      setShowManual(false);
    } else if (result.error) {
      setError(result.error.hint || result.error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={connecting}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {showManual ? "Add Address" : "Connect Wallet"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {showManual
              ? "Enter a Coreum address to track"
              : "Choose your preferred wallet to connect"}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {showManual ? (
          <div className="space-y-4">
            <ManualAddressInput onAdd={handleManualAdd} />
            <button
              onClick={() => setShowManual(false)}
              disabled={connecting}
              className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              ← Back to wallet connect
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Wallet Buttons */}
            <WalletButton
              provider="keplr"
              onClick={() => handleConnect("keplr")}
              connecting={connecting && provider === "keplr"}
              disabled={connecting && provider !== "keplr"}
            />
            <WalletButton
              provider="leap"
              onClick={() => handleConnect("leap")}
              connecting={connecting && provider === "leap"}
              disabled={connecting && provider !== "leap"}
            />
            <WalletButton
              provider="cosmostation"
              onClick={() => handleConnect("cosmostation")}
              connecting={connecting && provider === "cosmostation"}
              disabled={connecting && provider !== "cosmostation"}
            />

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
                  Or
                </span>
              </div>
            </div>

            {/* Manual Address Button */}
            <button
              onClick={() => setShowManual(true)}
              disabled={connecting}
              className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enter Address Manually
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


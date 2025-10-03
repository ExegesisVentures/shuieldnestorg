"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Wallet, Trash2, Star, ExternalLink } from "lucide-react";

interface WalletData {
  id: string;
  address: string;
  label: string;
  read_only: boolean;
  is_primary: boolean;
  created_at: string;
}

interface ConnectedWalletsProps {
  onRefresh?: number; // Counter to trigger refresh
}

export default function ConnectedWallets({ onRefresh }: ConnectedWalletsProps) {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isVisitor, setIsVisitor] = useState(false);

  useEffect(() => {
    loadWallets();
    
    // Listen for storage changes (for visitor addresses)
    const handleStorageChange = () => {
      loadWallets();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [onRefresh]);

  const loadWallets = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Visitor mode - load from localStorage
        setIsVisitor(true);
        const visitorAddresses = JSON.parse(localStorage.getItem('visitor_addresses') || '[]');
        const formattedWallets = visitorAddresses.map((w: { address: string; label?: string; is_primary?: boolean; added_at?: string }, index: number) => ({
          id: `visitor-${index}`,
          address: w.address,
          label: w.label || "Manual Address",
          read_only: true,
          is_primary: w.is_primary || false,
          created_at: w.added_at || new Date().toISOString(),
        }));
        setWallets(formattedWallets);
        setLoading(false);
        return;
      }

      setIsVisitor(false);

      // Get user's public_user_id - should exist from database trigger
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("public_user_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!profile?.public_user_id) {
        // Profile should exist from database trigger
        console.error("No user profile found - database trigger may not be set up");
        setWallets([]);
        setLoading(false);
        return;
      }

      // Get wallets
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", profile.public_user_id)
        .eq("user_scope", "public")
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load wallets:", error);
        setWallets([]);
      } else {
        setWallets(data || []);
      }
    } catch (error) {
      console.error("Error loading wallets:", error);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (walletId: string) => {
    if (!confirm("Are you sure you want to remove this wallet?")) {
      return;
    }

    setDeleting(walletId);

    try {
      // Check if it's a visitor wallet
      if (walletId.startsWith('visitor-')) {
        // Delete from localStorage
        const visitorAddresses = JSON.parse(localStorage.getItem('visitor_addresses') || '[]');
        const index = parseInt(walletId.replace('visitor-', ''));
        visitorAddresses.splice(index, 1);
        localStorage.setItem('visitor_addresses', JSON.stringify(visitorAddresses));
        
        // Trigger storage event
        window.dispatchEvent(new Event('storage'));
        
        await loadWallets();
      } else {
        // Delete from database
        const supabase = createSupabaseClient();
        const { error } = await supabase.from("wallets").delete().eq("id", walletId);

        if (error) {
          console.error("Failed to delete wallet:", error);
          alert("Failed to remove wallet. Please try again.");
        } else {
          await loadWallets();
        }
      }
    } catch (error) {
      console.error("Error deleting wallet:", error);
      alert("Failed to remove wallet. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">No wallets connected</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Connect a wallet or add an address to track your portfolio
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Wallet Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {wallet.label}
                </span>
                {wallet.is_primary && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
                {wallet.read_only && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    Read-only
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {truncateAddress(wallet.address)}
                </code>
                <a
                  href={`https://explorer.coreum.com/coreum/accounts/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="View on explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Delete Button - visitors can delete any wallet, authenticated users can't delete primary */}
            {(isVisitor || !wallet.is_primary) && (
              <button
                onClick={() => handleDelete(wallet.id)}
                disabled={deleting === wallet.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                title="Remove wallet"
              >
                {deleting === wallet.id ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


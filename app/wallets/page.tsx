"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddressList from "@/components/portfolio/AddressList";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";
import { createSupabaseClient } from "@/utils/supabase/client";
import { fetchUserWallets, deleteWallet, updateWalletLabel } from "@/utils/wallet/operations";

export default function WalletsPage() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [addresses, setAddresses] = useState<Array<{
    id: string;
    address: string;
    label: string;
    chain: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, [refreshCounter]);

  const loadWallets = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAddresses([]);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("public_user_id")
        .eq("auth_user_id", user.id)
        .single();

      if (profile?.public_user_id) {
        const wallets = await fetchUserWallets(supabase, profile.public_user_id, "public");
        setAddresses(wallets.map(w => ({
          id: w.id,
          address: w.address,
          label: w.label,
          chain: "Coreum",
        })));
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Error loading wallets:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowConnectModal(true);
  };

  const handleEdit = async (id: string) => {
    const newLabel = prompt("Enter new label:");
    if (newLabel) {
      const supabase = createSupabaseClient();
      const result = await updateWalletLabel(supabase, id, newLabel);
      if (result.success) {
        loadWallets();
      } else {
        alert(result.error?.message || "Failed to update label");
      }
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createSupabaseClient();
    const result = await deleteWallet(supabase, id);
    if (result.success) {
      loadWallets();
    } else {
      alert(result.error?.message || "Failed to delete wallet");
    }
  };

  const handleConnectionSuccess = () => {
    setRefreshCounter((prev) => prev + 1);
    setShowConnectModal(false);
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Wallet Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Connect and manage your Coreum wallets in one place
        </p>
      </div>

      {/* Add Wallet Button */}
      <div className="mb-6">
        <Button onClick={handleAdd} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Wallet
        </Button>
      </div>

      {/* Address List */}
      <AddressList
        addresses={addresses}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={handleConnectionSuccess}
      />
    </main>
  );
}


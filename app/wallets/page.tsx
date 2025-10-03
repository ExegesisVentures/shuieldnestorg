"use client";

import { useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddressList from "@/components/portfolio/AddressList";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";

export default function WalletsPage() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Mock data for now - TODO: fetch from Supabase
  const mockAddresses = [
    {
      id: "1",
      address: "core1abcdefghijklmnopqrstuvwxyz1234567890",
      label: "Main Wallet",
      chain: "Coreum",
    },
    {
      id: "2",
      address: "core1zyxwvutsrqponmlkjihgfedcba0987654321",
      label: "Trading Wallet",
      chain: "Coreum",
    },
  ];

  const handleAdd = () => {
    setShowConnectModal(true);
  };

  const handleEdit = (id: string) => {
    // TODO: implement edit functionality
    console.log("Edit address:", id);
  };

  const handleDelete = async (id: string) => {
    // TODO: implement delete functionality
    console.log("Delete address:", id);
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
        addresses={mockAddresses}
        loading={false}
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


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, User as UserIcon } from "lucide-react";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";

interface HeaderClientWrapperProps {
  hasAuthUser: boolean;
}

export default function HeaderClientWrapper({ hasAuthUser }: HeaderClientWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasVisitorWallets, setHasVisitorWallets] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if visitor has wallets in localStorage
    if (!hasAuthUser) {
      const checkVisitorWallets = () => {
        const visitorAddresses = JSON.parse(localStorage.getItem('visitor_addresses') || '[]');
        setHasVisitorWallets(visitorAddresses.length > 0);
      };

      checkVisitorWallets();

      // Listen for changes
      const handleStorageChange = () => {
        checkVisitorWallets();
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [hasAuthUser]);

  const handleSuccess = () => {
    setShowModal(false);
    router.push("/dashboard");
  };

  // If user is authenticated, this component isn't shown (parent handles it)
  if (hasAuthUser) return null;

  // Visitor with wallets - show "Go to Dashboard" button
  if (hasVisitorWallets) {
    return (
      <Button size="sm" onClick={() => router.push("/dashboard")}>
        <UserIcon className="w-4 h-4 mr-2" />
        View Portfolio
      </Button>
    );
  }

  // Visitor without wallets - show "Sign In" button
  return (
    <>
      <Button size="sm" onClick={() => setShowModal(true)}>
        <Wallet className="w-4 h-4 mr-2" />
        Sign In
      </Button>

      <WalletConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}


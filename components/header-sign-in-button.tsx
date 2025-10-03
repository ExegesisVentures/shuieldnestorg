"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";

export default function HeaderSignInButton() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setShowModal(false);
    router.push("/dashboard");
  };

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


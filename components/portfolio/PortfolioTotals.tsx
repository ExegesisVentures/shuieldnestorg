"use client";

import { TrendingUp, DollarSign, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PortfolioTotalsProps {
  totalValue?: number;
  change24h?: number;
  walletCount?: number;
  loading?: boolean;
}

export default function PortfolioTotals({
  totalValue = 0,
  change24h = 0,
  walletCount = 0,
  loading = false,
}: PortfolioTotalsProps) {
  const isPositive = change24h >= 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Value */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Value
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>

      {/* 24h Change */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              24h Change
            </p>
            <h3
              className={`text-3xl font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {change24h.toFixed(2)}%
            </h3>
          </div>
          <div
            className={`p-3 rounded-xl ${
              isPositive
                ? "bg-gradient-to-br from-green-500 to-emerald-500"
                : "bg-gradient-to-br from-red-500 to-rose-500"
            }`}
          >
            <TrendingUp
              className={`w-6 h-6 text-white ${
                !isPositive ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </Card>

      {/* Wallet Count */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Connected Wallets
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {walletCount}
            </h3>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </div>
  );
}


import { Droplet, TrendingUp, Lock, Info } from "lucide-react";
import PoolsTable from "@/components/liquidity/PoolsTable";
import { Card } from "@/components/ui/card";

export default function LiquidityPage() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Liquidity Pools
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Track liquidity pools on Coreum DEXs (view-only in v1)
        </p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
              View-Only Mode
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              DEX trading and liquidity provision will be available in a future release.
              For now, you can view pool statistics and track performance.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total TVL */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total TVL</span>
            <Droplet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            $4.2M
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12.5% this week
          </div>
        </Card>

        {/* Average APY */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Average APY</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            32.2%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Across active pools
          </div>
        </Card>

        {/* 24h Volume */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">24h Volume</span>
            <Lock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            $670K
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +8.3% from yesterday
          </div>
        </Card>
      </div>

      {/* Pools Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Available Pools
        </h2>
        <PoolsTable />
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          About Liquidity Pools
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Liquidity pools enable decentralized trading on Coreum. By providing liquidity,
          users earn fees from trades that occur in the pool. APY reflects current
          annualized returns based on trading volume and fee structure.
        </p>
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Trading features are coming soon. Shield Members will receive priority access
            to advanced DEX features when released.
          </p>
        </div>
      </Card>
    </main>
  );
}


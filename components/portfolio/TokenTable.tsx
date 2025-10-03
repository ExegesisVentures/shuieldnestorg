"use client";

import { ExternalLink, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatTokenSymbol, formatTokenName, sortTokensWithCoreFirst } from "@/utils/token-display";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  valueUsd: number;
  change24h: number;
  logoUrl?: string;
  denom?: string;
  // COREUM breakdown
  available?: string;
  staked?: string;
  rewards?: string;
}

interface TokenTableProps {
  tokens?: Token[];
  loading?: boolean;
}

export default function TokenTable({ tokens = [], loading = false }: TokenTableProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  24h
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">No tokens found</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Connect a wallet with token balances to see them here
        </p>
      </Card>
    );
  }

  // Sort tokens with CORE first
  const sortedTokens = sortTokensWithCoreFirst(tokens);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                24h Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTokens.map((token) => {
              const isPositive = token.change24h >= 0;
              const isCoreToken = token.symbol === "CORE";
              const displaySymbol = formatTokenSymbol(token.symbol, token.denom || token.symbol);
              const displayName = formatTokenName(token.name, token.denom || token.name);
              
              return (
                <tr
                  key={token.denom || token.symbol}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    isCoreToken ? "bg-purple-50/30 dark:bg-purple-900/10" : ""
                  }`}
                >
                  {/* Asset */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        isCoreToken 
                          ? "bg-gradient-to-br from-purple-600 to-blue-600" 
                          : "bg-gradient-to-br from-gray-500 to-gray-600"
                      }`}>
                        {isCoreToken ? <Coins className="w-5 h-5" /> : displaySymbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {displaySymbol}
                          {isCoreToken && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                              Native
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {displayName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Balance */}
                  <td className="px-6 py-4">
                    {isCoreToken && (token.available || token.staked || token.rewards) ? (
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {token.balance}
                        </div>
                        {token.available && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Available: {token.available}
                          </div>
                        )}
                        {token.staked && parseFloat(token.staked) > 0 && (
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            Staked: {token.staked}
                          </div>
                        )}
                        {token.rewards && parseFloat(token.rewards) > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Rewards: {token.rewards}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {token.balance}
                      </div>
                    )}
                  </td>

                  {/* Value */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${token.valueUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>

                  {/* 24h Change */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {isPositive ? "+" : ""}
                      {token.change24h.toFixed(2)}%
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <a
                      href={`https://explorer.coreum.com/coreum/assets/${token.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-4 h-4 inline" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}


/**
 * Coreum RPC Client
 * Handles interactions with Coreum blockchain for balance queries
 */

import { getTokenMetadata } from "./token-registry";

const COREUM_RPC_ENDPOINT = process.env.NEXT_PUBLIC_COREUM_RPC || "https://full-node.mainnet-1.coreum.dev:26657";
const COREUM_REST_ENDPOINT = process.env.NEXT_PUBLIC_COREUM_REST || "https://full-node.mainnet-1.coreum.dev:1317";

export interface TokenBalance {
  denom: string;
  amount: string;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  denom: string;
  decimals: number;
  logo?: string;
}

export interface EnrichedBalance {
  symbol: string;
  name: string;
  denom: string;
  balance: string;
  balanceFormatted: string;
  valueUsd: number;
  change24h: number;
  decimals: number;
  logoUrl?: string;
  // COREUM-specific breakdown
  available?: string;
  staked?: string;
  rewards?: string;
}

/**
 * Fetch all token balances for a Coreum address
 */
export async function fetchBalances(address: string): Promise<TokenBalance[]> {
  try {
    const url = `${COREUM_REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${address}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch balances: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.balances || [];
  } catch (error) {
    console.error("Error fetching balances:", error);
    return [];
  }
}

/**
 * Fetch staked COREUM for an address
 */
export async function fetchStakedBalance(address: string): Promise<string> {
  try {
    const url = `${COREUM_REST_ENDPOINT}/cosmos/staking/v1beta1/delegations/${address}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return "0";
    }
    
    const data = await response.json();
    const delegations = data.delegation_responses || [];
    
    const totalStaked = delegations.reduce((sum: bigint, del: any) => {
      return sum + BigInt(del.balance?.amount || "0");
    }, BigInt(0));
    
    return totalStaked.toString();
  } catch (error) {
    console.error("Error fetching staked balance:", error);
    return "0";
  }
}

/**
 * Fetch pending rewards for an address
 */
export async function fetchRewards(address: string): Promise<string> {
  try {
    const url = `${COREUM_REST_ENDPOINT}/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return "0";
    }
    
    const data = await response.json();
    const rewards = data.total || [];
    
    const coreReward = rewards.find((r: any) => r.denom === "ucore");
    return coreReward ? BigInt(Math.floor(parseFloat(coreReward.amount))).toString() : "0";
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return "0";
  }
}

/**
 * Get token metadata (symbol, name, decimals)
 * Uses comprehensive token registry
 */
export function getTokenInfo(denom: string): TokenInfo {
  // Check token registry first
  const metadata = getTokenMetadata(denom);
  
  if (metadata) {
    return {
      symbol: metadata.symbol,
      name: metadata.name,
      denom: metadata.denom,
      decimals: metadata.decimals,
      logo: metadata.logo,
    };
  }

  // Fallback for unknown tokens
  return {
    symbol: denom.toUpperCase(),
    name: denom,
    denom,
    decimals: 6, // default
  };
}

/**
 * Format token amount based on decimals
 * Max 4 decimal places for display
 */
export function formatTokenAmount(amount: string, decimals: number = 6): string {
  const numAmount = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = numAmount / divisor;
  const fractionalPart = numAmount % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  // Trim trailing zeros, but keep max 4 decimal places
  const trimmedFractional = fractionalStr.replace(/0+$/, "").substring(0, 4);
  
  if (trimmedFractional === "") {
    return integerPart.toString();
  }
  
  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Get USD price for a token
 * TODO: Integrate with CoinGecko API for real-time prices
 */
export async function getTokenPrice(symbol: string): Promise<number> {
  // Mock prices for v1 - TODO: Replace with CoinGecko API
  const mockPrices: Record<string, number> = {
    "CORE": 0.25,
    "DROP": 0.18,
    "AWKT": 0.05,
    "COZY": 0.12,
    "KONG": 0.08,
    "MART": 0.15,
    "XRP": 0.52, // Wrapped XRP follows XRP price
    "ULP": 1.00, // LP tokens typically $1 base
  };
  
  return mockPrices[symbol] || 0;
}

/**
 * Get 24h price change percentage
 * TODO: Integrate with CoinGecko API for real-time changes
 */
export async function getTokenChange24h(symbol: string): Promise<number> {
  // Mock changes for v1 - TODO: Replace with CoinGecko API
  const mockChanges: Record<string, number> = {
    "CORE": 5.2,
    "DROP": 3.5,
    "AWKT": -1.2,
    "COZY": 2.8,
    "KONG": 7.5,
    "MART": -0.5,
    "XRP": 1.8,
    "ULP": 0.1,
  };
  
  return mockChanges[symbol] || 0;
}

/**
 * Enrich raw balances with metadata and pricing
 */
export async function enrichBalances(balances: TokenBalance[]): Promise<EnrichedBalance[]> {
  const enriched: EnrichedBalance[] = [];
  
  for (const balance of balances) {
    const tokenInfo = getTokenInfo(balance.denom);
    const balanceFormatted = formatTokenAmount(balance.amount, tokenInfo.decimals);
    const price = await getTokenPrice(tokenInfo.symbol);
    const change24h = await getTokenChange24h(tokenInfo.symbol);
    const valueUsd = parseFloat(balanceFormatted) * price;
    
    enriched.push({
      symbol: tokenInfo.symbol,
      name: tokenInfo.name,
      denom: balance.denom,
      balance: balance.amount,
      balanceFormatted,
      valueUsd,
      change24h,
      decimals: tokenInfo.decimals,
      logoUrl: tokenInfo.logo,
    });
  }
  
  return enriched;
}

/**
 * Fetch and enrich balances for a single address
 */
export async function getAddressBalances(address: string): Promise<EnrichedBalance[]> {
  const rawBalances = await fetchBalances(address);
  const enriched = await enrichBalances(rawBalances);
  
  // Add staking and rewards data for COREUM
  const coreBalance = enriched.find(b => b.denom === "ucore");
  if (coreBalance) {
    const staked = await fetchStakedBalance(address);
    const rewards = await fetchRewards(address);
    
    coreBalance.staked = formatTokenAmount(staked, 6);
    coreBalance.rewards = formatTokenAmount(rewards, 6);
    coreBalance.available = coreBalance.balanceFormatted;
    
    // Update total balance to include staked
    const totalBalance = BigInt(coreBalance.balance) + BigInt(staked) + BigInt(rewards);
    coreBalance.balance = totalBalance.toString();
    coreBalance.balanceFormatted = formatTokenAmount(totalBalance.toString(), 6);
    
    // Recalculate value with total
    const price = await getTokenPrice("CORE");
    coreBalance.valueUsd = parseFloat(coreBalance.balanceFormatted) * price;
  }
  
  return enriched;
}

/**
 * Fetch and aggregate balances across multiple addresses
 */
export async function getMultiAddressBalances(addresses: string[]): Promise<{
  byAddress: Record<string, EnrichedBalance[]>;
  aggregated: EnrichedBalance[];
  totalValueUsd: number;
}> {
  const byAddress: Record<string, EnrichedBalance[]> = {};
  const tokenTotals: Record<string, {
    balance: bigint;
    info: TokenInfo;
  }> = {};
  
  // Fetch balances for each address
  for (const address of addresses) {
    const balances = await getAddressBalances(address);
    byAddress[address] = balances;
    
    // Aggregate by token
    for (const bal of balances) {
      if (!tokenTotals[bal.denom]) {
        tokenTotals[bal.denom] = {
          balance: BigInt(0),
          info: getTokenInfo(bal.denom),
        };
      }
      tokenTotals[bal.denom].balance += BigInt(bal.balance);
    }
  }
  
  // Create aggregated list
  const aggregated: EnrichedBalance[] = [];
  let totalValueUsd = 0;
  
  for (const [denom, data] of Object.entries(tokenTotals)) {
    const tokenInfo = data.info;
    const balanceFormatted = formatTokenAmount(data.balance.toString(), tokenInfo.decimals);
    const price = await getTokenPrice(tokenInfo.symbol);
    const change24h = await getTokenChange24h(tokenInfo.symbol);
    const valueUsd = parseFloat(balanceFormatted) * price;
    
    totalValueUsd += valueUsd;
    
    aggregated.push({
      symbol: tokenInfo.symbol,
      name: tokenInfo.name,
      denom,
      balance: data.balance.toString(),
      balanceFormatted,
      valueUsd,
      change24h,
      decimals: tokenInfo.decimals,
      logoUrl: tokenInfo.logo,
    });
  }
  
  return { byAddress, aggregated, totalValueUsd };
}


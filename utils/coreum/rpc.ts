/**
 * Coreum RPC Client
 * Handles interactions with Coreum blockchain for balance queries
 */

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
 * Get token metadata (symbol, name, decimals)
 * In v1, we'll use a static mapping. In v2, fetch from chain or registry.
 */
export function getTokenInfo(denom: string): TokenInfo {
  // Static token mapping for common Coreum tokens
  const tokenMap: Record<string, TokenInfo> = {
    "ucore": {
      symbol: "CORE",
      name: "Coreum",
      denom: "ucore",
      decimals: 6,
      logo: undefined,
    },
    // Add more tokens as needed
  };

  return tokenMap[denom] || {
    symbol: denom.toUpperCase(),
    name: denom,
    denom,
    decimals: 6, // default
  };
}

/**
 * Format token amount based on decimals
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
  const trimmedFractional = fractionalStr.replace(/0+$/, "");
  
  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Get USD price for a token (mock for v1)
 * TODO: Integrate with CoinGecko or similar price API
 */
export async function getTokenPrice(symbol: string): Promise<number> {
  // Mock prices for v1
  const mockPrices: Record<string, number> = {
    "CORE": 0.25, // Example price
  };
  
  return mockPrices[symbol] || 0;
}

/**
 * Get 24h price change percentage (mock for v1)
 */
export async function getTokenChange24h(symbol: string): Promise<number> {
  // Mock changes for v1
  const mockChanges: Record<string, number> = {
    "CORE": 5.2,
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
  return enrichBalances(rawBalances);
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


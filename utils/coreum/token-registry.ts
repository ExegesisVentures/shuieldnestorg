/**
 * Coreum Token Registry
 * Comprehensive metadata for all supported tokens on Coreum
 */

export interface TokenMetadata {
  symbol: string;
  name: string;
  denom: string;
  decimals: number;
  logo?: string;
  coingeckoId?: string; // For price feeds
  description?: string;
}

/**
 * Complete token registry for Coreum Mainnet
 */
export const TOKEN_REGISTRY: Record<string, TokenMetadata> = {
  // Native COREUM
  "ucore": {
    symbol: "CORE",
    name: "Coreum",
    denom: "ucore",
    decimals: 6,
    logo: "/tokens/core.svg",
    coingeckoId: "coreum",
    description: "Native token of the Coreum blockchain",
  },

  // DROP Protocol
  "drop-core1zhs909jp9yktml6qqx9f0ptcq2xnhhj99cja03j3lfcsp2pgm86studdrz": {
    symbol: "DROP",
    name: "Drop Protocol",
    denom: "drop-core1zhs909jp9yktml6qqx9f0ptcq2xnhhj99cja03j3lfcsp2pgm86studdrz",
    decimals: 6,
    logo: "/tokens/drop.svg",
    coingeckoId: "drop-protocol",
    description: "Liquid staking protocol on Coreum",
  },

  // AWKT Token
  "awkt-core1p54uvh2faq4j7mmlcp2pufz5jh03e5xjm7tm5uw5mkyhljfsmays0a5l9z": {
    symbol: "AWKT",
    name: "Awoken Token",
    denom: "awkt-core1p54uvh2faq4j7mmlcp2pufz5jh03e5xjm7tm5uw5mkyhljfsmays0a5l9z",
    decimals: 6,
    logo: "/tokens/awkt.svg",
    description: "Awoken ecosystem token",
  },

  // COZY Token
  "cozy-core1wpnq5fxy9fqf6h2dqmr3sm8y2wjgf7y6yehzehw2mrc33qzp9cjs0t4a5v": {
    symbol: "COZY",
    name: "Cozy Token",
    denom: "cozy-core1wpnq5fxy9fqf6h2dqmr3sm8y2wjgf7y6yehzehw2mrc33qzp9cjs0t4a5v",
    decimals: 6,
    logo: "/tokens/cozy.svg",
    description: "Cozy DeFi ecosystem token",
  },

  // KONG Token
  "kong-core193djf6hx35gwchrhq5vmxl0mwssmrvr3ytcgk9d59w2sd7kkrpfqfzxmmu": {
    symbol: "KONG",
    name: "Kong Token",
    denom: "kong-core193djf6hx35gwchrhq5vmxl0mwssmrvr3ytcgk9d59w2sd7kkrpfqfzxmmu",
    decimals: 6,
    logo: "/tokens/kong.svg",
    description: "Kong gaming and metaverse token",
  },

  // MART Token
  "mart-core1x47xjfj4rzl43pphzwj54nlx5ryzrcj87k2z90u8cz8z33s7mckqtjms32": {
    symbol: "MART",
    name: "Market Token",
    denom: "mart-core1x47xjfj4rzl43pphzwj54nlx5ryzrcj87k2z90u8cz8z33s7mckqtjms32",
    decimals: 6,
    logo: "/tokens/mart.svg",
    description: "Marketplace and trading token",
  },

  // XRP (Wrapped)
  "xrp-core1l44nkr00gudzx9y9kpq0d2k68zn7q6ya4f4v6y7pq8n5tj0vyxfqvh4agl": {
    symbol: "XRP",
    name: "Wrapped XRP",
    denom: "xrp-core1l44nkr00gudzx9y9kpq0d2k68zn7q6ya4f4v6y7pq8n5tj0vyxfqvh4agl",
    decimals: 6, // IMPORTANT: XRP on Coreum uses 6 decimals, not 8
    logo: "/tokens/xrp.svg",
    coingeckoId: "ripple",
    description: "Wrapped XRP on Coreum",
  },

  // ULP Token (Universal Liquidity Pool / DEX LP Token)
  "ulp-core1qhfqvv5hsnmxv3yt2j3wapsgzvr4ex4vlvvxuqe": {
    symbol: "ULP",
    name: "Universal LP Token",
    denom: "ulp-core1qhfqvv5hsnmxv3yt2j3wapsgzvr4ex4vlvvxuqe",
    decimals: 6,
    logo: "/tokens/ulp.svg",
    description: "Universal Liquidity Pool token for Coreum DEX",
  },
};

/**
 * Get token metadata by denom
 */
export function getTokenMetadata(denom: string): TokenMetadata | null {
  return TOKEN_REGISTRY[denom] || null;
}

/**
 * Get all registered tokens
 */
export function getAllTokens(): TokenMetadata[] {
  return Object.values(TOKEN_REGISTRY);
}

/**
 * Search tokens by symbol or name
 */
export function searchTokens(query: string): TokenMetadata[] {
  const lowerQuery = query.toLowerCase();
  return getAllTokens().filter(
    token =>
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Check if a token is registered
 */
export function isRegisteredToken(denom: string): boolean {
  return denom in TOKEN_REGISTRY;
}


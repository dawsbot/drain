import { z } from 'zod';

/**
 * Moralis API client for fetching ERC-20 token balances across multiple chains
 */

// Chain ID to Moralis chain name mapping
const CHAIN_ID_TO_MORALIS_CHAIN: Record<number, string> = {
  1: 'eth',
  10: 'optimism',
  56: 'bsc',
  100: 'gnosis',
  137: 'polygon',
  42161: 'arbitrum',
} as const;

// Zod schema for a single token balance response from Moralis
const MoralisTokenSchema = z.object({
  token_address: z.string(),
  name: z.string().nullable(),
  symbol: z.string().nullable(),
  logo: z.string().url().nullable().optional(),
  thumbnail: z.string().url().nullable().optional(),
  decimals: z.number().int().min(0).max(255),
  balance: z.string(), // Raw balance as string to handle large numbers
  balance_formatted: z.string().optional(),
  usd_price: z.number().nullable().optional(),
  usd_value: z.number().nullable().optional(),
  usd_price_24hr_percent_change: z.number().nullable().optional(),
  usd_value_24hr_ago: z.number().nullable().optional(),
  possible_spam: z.boolean().optional(),
  verified_contract: z.boolean().optional(),
  native_token: z.boolean().optional(),
});

// Zod schema for Moralis Wallet API response (object with result array)
const MoralisWalletResponseSchema = z.object({
  result: z.array(MoralisTokenSchema),
  cursor: z.string().nullable().optional(),
});

// Also support array response for direct /erc20 endpoint
const MoralisResponseSchema = z.union([
  MoralisWalletResponseSchema,
  z.array(MoralisTokenSchema),
]);

// Export the inferred types
export type MoralisToken = z.infer<typeof MoralisTokenSchema>;
export type MoralisResponse =
  | z.infer<typeof MoralisWalletResponseSchema>
  | z.infer<typeof MoralisTokenSchema>[];

// Normalized token type that matches the existing codebase structure
export interface NormalizedToken {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: ['erc20'];
  logo_url: string;
  last_transferred_at: string;
  native_token: false;
  type: 'cryptocurrency' | 'stablecoin';
  balance: string;
  balance_24h: string;
  quote_rate: number;
  quote_rate_24h: number;
  quote: number;
  quote_24h: number;
  nft_data: null;
}

export interface FetchTokensResult {
  erc20s: ReadonlyArray<NormalizedToken>;
  nfts: ReadonlyArray<never>; // NFTs not included in this implementation
}

export class MoralisClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://deep-index.moralis.io/api/v2.2';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Moralis API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Fetches ERC-20 token balances for a given address on a specific chain
   * @param chainId - The chain ID (1 for Ethereum, 137 for Polygon, etc.)
   * @param evmAddress - The wallet address to fetch balances for
   * @param blacklistAddresses - Array of token addresses to exclude from results
   * @returns Object containing ERC-20 tokens and NFTs (empty array)
   */
  async fetchTokens(
    chainId: number,
    evmAddress: string,
    blacklistAddresses: string[] = [],
  ): Promise<FetchTokensResult> {
    const chainName = this.getChainName(chainId);
    // Use the wallet API endpoint that includes price data
    const url = `${this.baseUrl}/wallets/${evmAddress}/tokens`;

    const params = new URLSearchParams({
      chain: chainName,
      exclude_spam: 'true', // Exclude tokens marked as spam
      exclude_unverified_contracts: 'false', // Include unverified contracts but we'll filter by price
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Moralis API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Validate response with Zod
    const validatedData = MoralisResponseSchema.parse(data);

    // Extract tokens array from response
    const tokens = Array.isArray(validatedData)
      ? validatedData
      : validatedData.result;

    // Normalize and filter tokens
    const normalizedTokens = this.normalizeTokens(tokens);

    // Filter out blacklisted addresses and apply business logic
    const erc20s = normalizedTokens.filter((token) => {
      // Exclude blacklisted addresses (case-insensitive)
      if (
        blacklistAddresses.some(
          (addr) => addr.toLowerCase() === token.contract_address.toLowerCase(),
        )
      ) {
        return false;
      }

      // Only include tokens with non-zero balance
      if (token.balance === '0') {
        return false;
      }

      // Only include tokens with valid price data (similar to Covalent logic)
      const hasQuotes = [
        token.quote,
        token.quote_24h,
        token.quote_rate,
        token.quote_rate_24h,
      ].every((val) => val !== null && val !== undefined);

      // Only include tokens with value > $1 USD
      return hasQuotes && token.quote > 1;
    });

    return {
      erc20s,
      nfts: [], // NFTs not included in this implementation
    };
  }

  /**
   * Normalizes Moralis token response to match existing codebase structure
   */
  private normalizeTokens(
    tokens: MoralisToken[],
  ): ReadonlyArray<NormalizedToken> {
    return tokens.map((token) => {
      // Calculate balance_24h (current balance - change)
      // Since Moralis doesn't provide historical balance, we estimate it
      const currentUsdValue = token.usd_value || 0;
      const usdValue24hAgo = token.usd_value_24hr_ago || currentUsdValue;

      // Estimate balance 24h ago based on value change
      const balance24h =
        token.usd_price && token.usd_price > 0
          ? String(
              Math.floor(
                (usdValue24hAgo / token.usd_price) *
                  Math.pow(10, token.decimals),
              ),
            )
          : token.balance;

      // Calculate quote_rate_24h from percentage change
      const quoteRate = token.usd_price || 0;
      const percentChange = token.usd_price_24hr_percent_change || 0;
      const quoteRate24h = quoteRate / (1 + percentChange / 100);

      // Determine if it's a stablecoin (simple heuristic based on symbol)
      const stablecoinSymbols = [
        'USDT',
        'USDC',
        'DAI',
        'BUSD',
        'UST',
        'TUSD',
        'USDP',
        'USDD',
        'GUSD',
        'FRAX',
      ];
      const isStablecoin = stablecoinSymbols.includes(
        token.symbol?.toUpperCase() || '',
      );

      return {
        contract_decimals: token.decimals,
        contract_name: token.name || 'Unknown Token',
        contract_ticker_symbol: token.symbol || 'UNKNOWN',
        contract_address: token.token_address,
        supports_erc: ['erc20'] as ['erc20'],
        logo_url: token.logo || token.thumbnail || '',
        last_transferred_at: new Date().toISOString(), // Moralis doesn't provide this
        native_token: false as const,
        type: isStablecoin ? 'stablecoin' : 'cryptocurrency',
        balance: token.balance,
        balance_24h: balance24h,
        quote_rate: quoteRate,
        quote_rate_24h: quoteRate24h,
        quote: currentUsdValue,
        quote_24h: usdValue24hAgo,
        nft_data: null,
      };
    });
  }

  /**
   * Maps chain ID to Moralis chain name
   */
  private getChainName(chainId: number): string {
    const chainName = CHAIN_ID_TO_MORALIS_CHAIN[chainId];
    if (!chainName) {
      throw new Error(
        `Chain ID ${chainId} is not supported. Supported chains: ${Object.keys(CHAIN_ID_TO_MORALIS_CHAIN).join(', ')}`,
      );
    }
    return chainName;
  }

  /**
   * Gets the list of supported chain IDs
   */
  static getSupportedChainIds(): number[] {
    return Object.keys(CHAIN_ID_TO_MORALIS_CHAIN).map(Number);
  }
}

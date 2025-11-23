import { describe, it, expect, beforeAll } from 'vitest';
import { MoralisClient } from './moralis-client';

// Test configuration
// Using a whale address that's confirmed to work
const TEST_ADDRESS = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503'; // Binance 8 (confirmed working)
const ETHEREUM_CHAIN_ID = 1;
const POLYGON_CHAIN_ID = 137;

describe('MoralisClient', () => {
  let client: MoralisClient;

  beforeAll(() => {
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      throw new Error(
        'MORALIS_API_KEY environment variable is required for tests',
      );
    }
    client = new MoralisClient(apiKey);
  });

  describe('Initialization', () => {
    it('should create a client with valid API key', () => {
      expect(client).toBeInstanceOf(MoralisClient);
    });

    it('should throw error when API key is missing', () => {
      expect(() => new MoralisClient('')).toThrow(
        'Moralis API key is required',
      );
    });

    it('should provide list of supported chain IDs', () => {
      const supportedChains = MoralisClient.getSupportedChainIds();
      expect(supportedChains).toEqual([1, 10, 56, 100, 137, 42161]);
      expect(supportedChains).toContain(ETHEREUM_CHAIN_ID);
      expect(supportedChains).toContain(POLYGON_CHAIN_ID);
    });
  });

  describe('Fetch Tokens - Ethereum', () => {
    it('should fetch tokens from Ethereum mainnet', async () => {
      const result = await client.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('erc20s');
      expect(result).toHaveProperty('nfts');
      expect(Array.isArray(result.erc20s)).toBe(true);
      expect(Array.isArray(result.nfts)).toBe(true);
    });

    it('should return tokens with correct structure', async () => {
      const result = await client.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS);

      if (result.erc20s.length > 0) {
        const token = result.erc20s[0];

        // Check required fields
        expect(token).toHaveProperty('contract_address');
        expect(token).toHaveProperty('contract_name');
        expect(token).toHaveProperty('contract_ticker_symbol');
        expect(token).toHaveProperty('contract_decimals');
        expect(token).toHaveProperty('balance');
        expect(token).toHaveProperty('quote_rate');
        expect(token).toHaveProperty('quote');
        expect(token).toHaveProperty('logo_url');

        // Check field types
        expect(typeof token.contract_address).toBe('string');
        expect(typeof token.contract_name).toBe('string');
        expect(typeof token.contract_ticker_symbol).toBe('string');
        expect(typeof token.contract_decimals).toBe('number');
        expect(typeof token.balance).toBe('string');
        expect(typeof token.quote_rate).toBe('number');
        expect(typeof token.quote).toBe('number');

        // Check specific values
        expect(token.contract_address).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(token.contract_decimals).toBeGreaterThanOrEqual(0);
        expect(token.contract_decimals).toBeLessThanOrEqual(255);
        expect(token.supports_erc).toEqual(['erc20']);
        expect(token.native_token).toBe(false);
        expect(token.nft_data).toBe(null);

        console.log('\n✓ Sample token:', {
          symbol: token.contract_ticker_symbol,
          name: token.contract_name,
          balance: token.balance,
          usd_value: token.quote,
          decimals: token.contract_decimals,
        });
      }
    });

    it('should only return tokens with value > $1', async () => {
      const result = await client.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS);

      result.erc20s.forEach((token) => {
        expect(token.quote).toBeGreaterThan(1);
      });
    });

    it('should filter out tokens with zero balance', async () => {
      const result = await client.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS);

      result.erc20s.forEach((token) => {
        expect(token.balance).not.toBe('0');
      });
    });
  });

  describe('Fetch Tokens - Multi-chain', () => {
    it('should fetch tokens from Polygon', async () => {
      const result = await client.fetchTokens(POLYGON_CHAIN_ID, TEST_ADDRESS);

      expect(result).toBeDefined();
      expect(Array.isArray(result.erc20s)).toBe(true);

      console.log(
        `\n✓ Found ${result.erc20s.length} tokens on Polygon for test address`,
      );
    });

    it('should handle unsupported chain ID', async () => {
      const unsupportedChainId = 999;

      await expect(
        client.fetchTokens(unsupportedChainId, TEST_ADDRESS),
      ).rejects.toThrow(/not supported/);
    });
  });

  describe('Blacklist Filtering', () => {
    it('should filter out blacklisted addresses', async () => {
      // First, get tokens without blacklist
      const resultWithout = await client.fetchTokens(
        ETHEREUM_CHAIN_ID,
        TEST_ADDRESS,
        [],
      );

      if (resultWithout.erc20s.length === 0) {
        console.log('\n⚠ No tokens found to test blacklist filtering');
        return;
      }

      // Pick the first token to blacklist
      const tokenToBlacklist = resultWithout.erc20s[0].contract_address;

      // Fetch with blacklist
      const resultWith = await client.fetchTokens(
        ETHEREUM_CHAIN_ID,
        TEST_ADDRESS,
        [tokenToBlacklist],
      );

      // Check that blacklisted token is not in results
      const hasBlacklisted = resultWith.erc20s.some(
        (token) =>
          token.contract_address.toLowerCase() ===
          tokenToBlacklist.toLowerCase(),
      );

      expect(hasBlacklisted).toBe(false);
      expect(resultWith.erc20s.length).toBeLessThan(
        resultWithout.erc20s.length,
      );

      console.log(
        `\n✓ Blacklist working: ${resultWithout.erc20s.length} tokens → ${resultWith.erc20s.length} tokens (filtered ${tokenToBlacklist.slice(0, 10)}...)`,
      );
    });

    it('should handle case-insensitive blacklist', async () => {
      const resultWithout = await client.fetchTokens(
        ETHEREUM_CHAIN_ID,
        TEST_ADDRESS,
        [],
      );

      if (resultWithout.erc20s.length === 0) {
        return;
      }

      const tokenToBlacklist = resultWithout.erc20s[0].contract_address;
      const uppercaseBlacklist = tokenToBlacklist.toUpperCase();

      const resultWith = await client.fetchTokens(
        ETHEREUM_CHAIN_ID,
        TEST_ADDRESS,
        [uppercaseBlacklist],
      );

      const hasBlacklisted = resultWith.erc20s.some(
        (token) =>
          token.contract_address.toLowerCase() ===
          tokenToBlacklist.toLowerCase(),
      );

      expect(hasBlacklisted).toBe(false);
    });
  });

  describe('Token Type Classification', () => {
    it('should classify stablecoins correctly', async () => {
      // USDC address on Ethereum
      const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

      // Find a well-known address that holds USDC
      const WHALE_ADDRESS = '0x28C6c06298d514Db089934071355E5743bf21d60'; // Binance 14

      const result = await client.fetchTokens(
        ETHEREUM_CHAIN_ID,
        WHALE_ADDRESS,
        [],
      );

      const usdc = result.erc20s.find(
        (token) =>
          token.contract_address.toLowerCase() === USDC_ADDRESS.toLowerCase(),
      );

      if (usdc) {
        expect(usdc.type).toBe('stablecoin');
        console.log('\n✓ USDC correctly identified as stablecoin');
      } else {
        console.log('\n⚠ USDC not found in test wallet');
      }
    });

    it('should have valid token types', async () => {
      const result = await client.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS);

      result.erc20s.forEach((token) => {
        expect(['cryptocurrency', 'stablecoin']).toContain(token.type);
      });
    });
  });

  describe('Price and Quote Data', () => {
    it('should have valid price data', async () => {
      const result = await client.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS);

      if (result.erc20s.length > 0) {
        result.erc20s.forEach((token) => {
          // All tokens should have non-null quote data (filtered by API)
          expect(token.quote_rate).toBeGreaterThanOrEqual(0);
          expect(token.quote).toBeGreaterThan(0);

          // 24h data should exist
          expect(typeof token.quote_rate_24h).toBe('number');
          expect(typeof token.quote_24h).toBe('number');
        });
      }
    });

    it('should calculate 24h price changes', async () => {
      const result = await client.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS);

      if (result.erc20s.length > 0) {
        const token = result.erc20s[0];

        // Both current and 24h ago prices should exist
        expect(token.quote_rate).toBeDefined();
        expect(token.quote_rate_24h).toBeDefined();

        console.log('\n✓ 24h price data:', {
          symbol: token.contract_ticker_symbol,
          current_price: token.quote_rate,
          price_24h_ago: token.quote_rate_24h,
          change_pct: (
            ((token.quote_rate - token.quote_rate_24h) / token.quote_rate_24h) *
            100
          ).toFixed(2),
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid address format gracefully', async () => {
      const invalidAddress = 'not-an-address';

      await expect(
        client.fetchTokens(ETHEREUM_CHAIN_ID, invalidAddress),
      ).rejects.toThrow();
    });

    it('should handle API errors gracefully', async () => {
      // Create client with invalid API key
      const badClient = new MoralisClient('invalid-key');

      await expect(
        badClient.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS),
      ).rejects.toThrow(/Moralis API request failed/);
    });
  });

  describe('Performance', () => {
    it('should fetch tokens within reasonable time', async () => {
      const startTime = Date.now();

      await client.fetchTokens(ETHEREUM_CHAIN_ID, TEST_ADDRESS);

      const duration = Date.now() - startTime;

      console.log(`\n✓ API response time: ${duration}ms`);
      expect(duration).toBeLessThan(10000); // Should be under 10 seconds
    });
  });

  describe('Integration Test - Full Flow', () => {
    it('should complete full token fetch flow with all filters', async () => {
      console.log('\n--- Integration Test ---');

      // 1. Fetch tokens
      const result = await client.fetchTokens(
        ETHEREUM_CHAIN_ID,
        TEST_ADDRESS,
        [], // No blacklist for this test
      );

      console.log(`\n1. Fetched ${result.erc20s.length} tokens from Ethereum`);

      // 2. Verify structure
      expect(result.erc20s).toBeDefined();
      expect(result.nfts).toBeDefined();

      // 3. Check that all tokens meet criteria
      if (result.erc20s.length > 0) {
        console.log('\n2. Validating token criteria:');

        result.erc20s.forEach((token, index) => {
          // Has balance
          expect(token.balance).not.toBe('0');

          // Has valid price
          expect(token.quote).toBeGreaterThan(1);

          // Has all required fields
          expect(token.contract_address).toBeDefined();
          expect(token.contract_name).toBeDefined();
          expect(token.contract_ticker_symbol).toBeDefined();

          if (index < 5) {
            // Log first 5 tokens
            console.log(`   ${index + 1}. ${token.contract_ticker_symbol}:`, {
              balance: parseFloat(
                (
                  parseFloat(token.balance) /
                  Math.pow(10, token.contract_decimals)
                ).toFixed(4),
              ),
              value: `$${token.quote.toFixed(2)}`,
              price: `$${token.quote_rate.toFixed(2)}`,
            });
          }
        });

        console.log(
          `   ... and ${Math.max(0, result.erc20s.length - 5)} more tokens`,
        );

        // 4. Calculate total portfolio value
        const totalValue = result.erc20s.reduce(
          (sum, token) => sum + token.quote,
          0,
        );
        console.log(
          `\n3. Total portfolio value: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        );

        expect(totalValue).toBeGreaterThan(0);
      }

      console.log('\n✓ Integration test passed!');
    });
  });
});

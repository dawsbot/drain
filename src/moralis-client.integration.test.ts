/**
 * Integration tests for MoralisClient
 * Run these tests manually to verify API integration
 * Note: These tests make real API calls and may be rate-limited
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { MoralisClient } from './moralis-client';

describe('MoralisClient Integration Tests', () => {
  let client: MoralisClient;
  const TEST_ADDRESS = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503'; // Binance 8

  beforeAll(() => {
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      throw new Error('MORALIS_API_KEY is required');
    }
    client = new MoralisClient(apiKey);
  });

  it('should successfully fetch and validate token data', async () => {
    console.log('\n🔄 Fetching tokens from Moralis API...\n');

    const result = await client.fetchTokens(1, TEST_ADDRESS, []);

    // Verify structure
    expect(result).toBeDefined();
    expect(result).toHaveProperty('erc20s');
    expect(result).toHaveProperty('nfts');
    expect(Array.isArray(result.erc20s)).toBe(true);
    expect(Array.isArray(result.nfts)).toBe(true);

    console.log(`✅ Successfully fetched ${result.erc20s.length} tokens\n`);

    if (result.erc20s.length > 0) {
      // Verify token structure
      const token = result.erc20s[0];

      console.log('📊 Sample Token Data:');
      console.log(`   Symbol: ${token.contract_ticker_symbol}`);
      console.log(`   Name: ${token.contract_name}`);
      console.log(`   Address: ${token.contract_address}`);
      console.log(`   Decimals: ${token.contract_decimals}`);
      console.log(`   Balance: ${token.balance}`);
      console.log(`   Price: $${token.quote_rate.toFixed(4)}`);
      console.log(`   Value: $${token.quote.toFixed(2)}`);
      console.log(`   Type: ${token.type}\n`);

      // Verify required fields
      expect(token).toHaveProperty('contract_address');
      expect(token).toHaveProperty('contract_name');
      expect(token).toHaveProperty('contract_ticker_symbol');
      expect(token).toHaveProperty('contract_decimals');
      expect(token).toHaveProperty('balance');
      expect(token).toHaveProperty('quote_rate');
      expect(token).toHaveProperty('quote');
      expect(token).toHaveProperty('supports_erc');

      // Verify types
      expect(typeof token.contract_address).toBe('string');
      expect(typeof token.contract_decimals).toBe('number');
      expect(typeof token.balance).toBe('string');
      expect(typeof token.quote_rate).toBe('number');
      expect(typeof token.quote).toBe('number');

      // Verify values
      expect(token.contract_address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(token.supports_erc).toEqual(['erc20']);
      expect(token.native_token).toBe(false);
      expect(['cryptocurrency', 'stablecoin']).toContain(token.type);

      // Calculate portfolio stats
      const totalValue = result.erc20s.reduce((sum, t) => sum + t.quote, 0);
      const avgTokenValue = totalValue / result.erc20s.length;

      console.log('📈 Portfolio Statistics:');
      console.log(
        `   Total Value: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      );
      console.log(`   Token Count: ${result.erc20s.length}`);
      console.log(
        `   Average Token Value: $${avgTokenValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`,
      );

      // Show top 5 tokens by value
      console.log('🏆 Top 5 Tokens by Value:');
      const sortedTokens = [...result.erc20s].sort((a, b) => b.quote - a.quote);
      sortedTokens.slice(0, 5).forEach((t, i) => {
        console.log(
          `   ${i + 1}. ${t.contract_ticker_symbol.padEnd(10)} $${t.quote.toFixed(2).padStart(15)}`,
        );
      });

      console.log('\n✅ All validations passed!');
    }
  }, 30000);

  it('should filter blacklisted tokens', async () => {
    console.log('\n🔄 Testing blacklist functionality...\n');

    // First, fetch without blacklist
    const withoutBlacklist = await client.fetchTokens(1, TEST_ADDRESS, []);

    if (withoutBlacklist.erc20s.length === 0) {
      console.log('⚠️  No tokens found, skipping blacklist test');
      return;
    }

    // Blacklist the first token
    const tokenToBlacklist = withoutBlacklist.erc20s[0].contract_address;
    console.log(
      `📝 Blacklisting token: ${withoutBlacklist.erc20s[0].contract_ticker_symbol} (${tokenToBlacklist.slice(0, 10)}...)`,
    );

    // Fetch with blacklist
    const withBlacklist = await client.fetchTokens(1, TEST_ADDRESS, [
      tokenToBlacklist,
    ]);

    // Verify blacklisted token is not present
    const hasBlacklisted = withBlacklist.erc20s.some(
      (token) =>
        token.contract_address.toLowerCase() === tokenToBlacklist.toLowerCase(),
    );

    expect(hasBlacklisted).toBe(false);
    expect(withBlacklist.erc20s.length).toBeLessThan(
      withoutBlacklist.erc20s.length,
    );

    console.log(
      `\n✅ Blacklist working: ${withoutBlacklist.erc20s.length} → ${withBlacklist.erc20s.length} tokens`,
    );
  }, 30000);

  it('should support all expected chains', () => {
    const supportedChains = MoralisClient.getSupportedChainIds();

    console.log('\n🌐 Supported Chains:');
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      10: 'Optimism',
      56: 'BSC',
      100: 'Gnosis',
      137: 'Polygon',
      42161: 'Arbitrum',
    };

    supportedChains.forEach((chainId) => {
      console.log(
        `   ${chainId.toString().padEnd(6)} - ${chainNames[chainId]}`,
      );
    });

    expect(supportedChains).toHaveLength(6);
    expect(supportedChains).toContain(1); // Ethereum
    expect(supportedChains).toContain(137); // Polygon
    expect(supportedChains).toContain(42161); // Arbitrum

    console.log('\n✅ All chains configured correctly');
  });

  it('should handle errors gracefully', async () => {
    console.log('\n🔄 Testing error handling...\n');

    // Test with invalid API key
    const badClient = new MoralisClient('invalid-key');

    await expect(badClient.fetchTokens(1, TEST_ADDRESS)).rejects.toThrow();

    console.log('✅ Invalid API key error handled correctly');

    // Test with unsupported chain
    await expect(client.fetchTokens(999, TEST_ADDRESS)).rejects.toThrow(
      /not supported/,
    );

    console.log('✅ Unsupported chain error handled correctly\n');
  }, 30000);
});

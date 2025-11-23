import { describe, it, expect, beforeAll } from 'vitest';
import { MoralisClient } from './moralis-client';

/**
 * Diagnostic tests to verify Moralis API connectivity and response
 */
describe('Moralis Diagnostic Tests', () => {
  let client: MoralisClient;

  beforeAll(() => {
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      throw new Error('MORALIS_API_KEY is required');
    }
    client = new MoralisClient(apiKey);
  });

  it('should successfully connect to Moralis API', async () => {
    // Test with a known whale address
    const address = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503'; // Binance 8

    console.log(`\nTesting Moralis API with address: ${address}`);

    const result = await client.fetchTokens(1, address, []);

    console.log(`Raw result structure:`, {
      hasErc20s: !!result.erc20s,
      erc20sIsArray: Array.isArray(result.erc20s),
      erc20sLength: result.erc20s.length,
      hasNfts: !!result.nfts,
    });

    expect(result).toBeDefined();
    expect(result.erc20s).toBeDefined();
    expect(Array.isArray(result.erc20s)).toBe(true);

    console.log(`\n✓ Found ${result.erc20s.length} tokens`);

    // If we have tokens, log the first few
    if (result.erc20s.length > 0) {
      console.log('\nFirst 5 tokens:');
      result.erc20s.slice(0, 5).forEach((token, i) => {
        console.log(`${i + 1}. ${token.contract_ticker_symbol}`, {
          address: token.contract_address.slice(0, 10) + '...',
          balance: token.balance,
          quote: token.quote,
          quote_rate: token.quote_rate,
        });
      });
    } else {
      // Try to see what the raw API returns by making a direct call
      console.log('\n⚠️ No tokens after filtering. Testing raw API call...');

      const apiKey = process.env.MORALIS_API_KEY!;
      const rawResponse = await fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=eth&exclude_spam=true&exclude_unverified_contracts=false`,
        {
          headers: {
            Accept: 'application/json',
            'X-API-Key': apiKey,
          },
        },
      );

      const rawData = await rawResponse.json();
      console.log('Raw API response:', {
        status: rawResponse.status,
        dataLength: Array.isArray(rawData) ? rawData.length : 'not an array',
        firstToken: Array.isArray(rawData) && rawData[0] ? rawData[0] : null,
      });

      if (Array.isArray(rawData) && rawData.length > 0) {
        console.log('\nFirst token from raw API:');
        console.log(JSON.stringify(rawData[0], null, 2));
      }
    }
  }, 30000);

  it('should handle multiple test addresses', async () => {
    const testAddresses = [
      '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', // Binance 8
      '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', // Binance 7
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Bitfinex
    ];

    console.log('\nTesting multiple addresses:');

    for (const address of testAddresses) {
      const result = await client.fetchTokens(1, address, []);
      console.log(
        `  ${address.slice(0, 10)}...: ${result.erc20s.length} tokens`,
      );

      if (result.erc20s.length > 0) {
        // Found tokens, log details
        const totalValue = result.erc20s.reduce(
          (sum, token) => sum + token.quote,
          0,
        );
        console.log(`    Total value: $${totalValue.toFixed(2)}`);
        console.log(
          `    Top token: ${result.erc20s[0].contract_ticker_symbol} ($${result.erc20s[0].quote.toFixed(2)})`,
        );
        break; // Found working address, no need to test more
      }
    }
  }, 60000);

  it('should validate Zod schema is working', async () => {
    const address = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';

    console.log('\nTesting Zod validation...');

    // This should not throw - if it does, Zod validation failed
    await expect(client.fetchTokens(1, address, [])).resolves.toBeDefined();

    console.log('✓ Zod validation passed');
  });

  it('should verify all supported chains', async () => {
    const chains = MoralisClient.getSupportedChainIds();

    console.log('\nSupported chains:', chains);
    expect(chains).toEqual([1, 10, 56, 100, 137, 42161]);

    console.log('✓ All 6 chains supported:', {
      1: 'Ethereum',
      10: 'Optimism',
      56: 'BSC',
      100: 'Gnosis',
      137: 'Polygon',
      42161: 'Arbitrum',
    });
  });
});

/**
 * Example usage and testing of the MoralisClient class
 *
 * This file demonstrates how to use the MoralisClient independently
 * for testing or in other contexts outside of the API route.
 */

import { MoralisClient } from '../moralis-client';

// Example: Create a client instance
async function exampleUsage() {
  const apiKey = process.env.MORALIS_API_KEY || 'your-api-key-here';
  const client = new MoralisClient(apiKey);

  // Example 1: Fetch tokens for an address on Ethereum
  const ethereumTokens = await client.fetchTokens(
    1, // Ethereum mainnet
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Example address
    [], // No blacklist
  );

  console.log('Ethereum tokens:', ethereumTokens.erc20s.length);

  // Example 2: Fetch tokens on Polygon with blacklist
  const polygonTokens = await client.fetchTokens(
    137, // Polygon mainnet
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    ['0xdc8fa3fab8421ff44cc6ca7f966673ff6c0b3b58'], // Blacklist specific token
  );

  console.log('Polygon tokens (filtered):', polygonTokens.erc20s.length);

  // Example 3: Check supported chains
  const supportedChains = MoralisClient.getSupportedChainIds();
  console.log('Supported chain IDs:', supportedChains);

  return { ethereumTokens, polygonTokens };
}

// Example: Mock client for unit testing
class MockMoralisClient extends MoralisClient {
  constructor() {
    super('mock-api-key');
  }

  // Override fetchTokens for testing
  async fetchTokens(
    chainId: number,
    evmAddress: string,
    blacklistAddresses: string[] = [],
  ) {
    // Return mock data for testing
    return {
      erc20s: [
        {
          contract_decimals: 6,
          contract_name: 'USD Coin',
          contract_ticker_symbol: 'USDC',
          contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          supports_erc: ['erc20'] as ['erc20'],
          logo_url: 'https://example.com/logo.png',
          last_transferred_at: '2025-01-01T00:00:00Z',
          native_token: false as const,
          type: 'stablecoin' as const,
          balance: '1000000000',
          balance_24h: '1000000000',
          quote_rate: 1.0,
          quote_rate_24h: 1.0,
          quote: 1000.0,
          quote_24h: 1000.0,
          nft_data: null,
        },
      ],
      nfts: [],
    };
  }
}

// Example: Testing with mock client
async function exampleTesting() {
  const mockClient = new MockMoralisClient();

  const result = await mockClient.fetchTokens(1, '0x123...', []);

  console.assert(result.erc20s.length === 1, 'Should return 1 token');
  console.assert(
    result.erc20s[0].contract_ticker_symbol === 'USDC',
    'Should be USDC',
  );

  console.log('Mock test passed!');

  return result;
}

// Export examples
export { exampleUsage, exampleTesting, MockMoralisClient };

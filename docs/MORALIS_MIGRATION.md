# Moralis API Migration Guide

## Overview

This project has been migrated from Covalent API to Moralis Web3 API for fetching ERC-20 token balances across multiple blockchain networks.

## What Changed

### API Provider

- **Before**: Covalent API (`api.covalenthq.com`)
- **After**: Moralis Web3 API (`deep-index.moralis.io`)

### Environment Variables

- **Before**: `COVALENT_API_KEY`
- **After**: `MORALIS_API_KEY`

### Code Architecture

- **Before**: Inline API logic in Next.js API route
- **After**: Separate `MoralisClient` class for better testability and reusability

## Getting a Moralis API Key

1. Visit [https://admin.moralis.io/](https://admin.moralis.io/)
2. Sign up or log in to your account
3. Navigate to "Web3 APIs" section
4. Copy your API key
5. Add it to your `.env.local` file:
   ```
   MORALIS_API_KEY=your_api_key_here
   ```

## Supported Chains

The following blockchain networks are supported:

| Chain Name | Chain ID |
| ---------- | -------- |
| Ethereum   | 1        |
| Optimism   | 10       |
| BSC        | 56       |
| Gnosis     | 100      |
| Polygon    | 137      |
| Arbitrum   | 42161    |

## Key Features

### 1. Zod v4 Validation

All API responses are validated using Zod v4 schemas to ensure type safety:

```typescript
const MoralisTokenSchema = z.object({
  token_address: z.string(),
  name: z.string().nullable(),
  symbol: z.string().nullable(),
  decimals: z.number().int().min(0).max(255),
  balance: z.string(),
  usd_price: z.number().nullable().optional(),
  usd_value: z.number().nullable().optional(),
  // ... more fields
});
```

### 2. Testable Client Class

The `MoralisClient` class is isolated from the API route and can be tested independently:

```typescript
import { MoralisClient } from './src/moralis-client';

const client = new MoralisClient(apiKey);
const tokens = await client.fetchTokens(1, '0x123...', blacklist);
```

### 3. Built-in Spam Filtering

Moralis API includes automatic spam token detection via the `exclude_spam` parameter.

### 4. Single API Call

Unlike some alternatives, Moralis returns token balances, metadata, and USD prices in a single API call.

## Migration Benefits

### Advantages of Moralis over Covalent

1. **Single Enriched Response**: All data (balances, metadata, prices) in one API call
2. **Pre-calculated USD Values**: No need to manually calculate `balance * price`
3. **24h Price Changes**: Built-in support for tracking price movements
4. **Spam Detection**: Automatic filtering of spam tokens
5. **Better Pricing**: More competitive pricing tiers
6. **Active Development**: Regular updates and new chain support

### Performance Comparison

- **Moralis**: ~18 API calls to get complete wallet data
- **Alchemy**: Thousands of API calls for the same data (requires separate calls for balances, metadata, and prices)

## API Response Format

### Moralis Response

```typescript
{
  token_address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
  balance: "4929853276",
  balance_formatted: "4929.853276",
  usd_price: 0.999,
  usd_value: 4924.93,
  usd_price_24hr_percent_change: -0.05,
  usd_value_24hr_ago: 4927.38,
  possible_spam: false,
  verified_contract: true
}
```

### Normalized Output (for backward compatibility)

The client normalizes the Moralis response to match the existing codebase structure:

```typescript
{
  contract_decimals: 6,
  contract_name: "USD Coin",
  contract_ticker_symbol: "USDC",
  contract_address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  balance: "4929853276",
  quote_rate: 0.999,
  quote: 4924.93,
  // ... more fields
}
```

## Testing

### Unit Testing Example

```typescript
import { MoralisClient } from '../src/moralis-client';

describe('MoralisClient', () => {
  it('should fetch tokens successfully', async () => {
    const client = new MoralisClient(process.env.MORALIS_API_KEY!);

    const result = await client.fetchTokens(
      1, // Ethereum
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      [],
    );

    expect(result.erc20s).toBeDefined();
    expect(Array.isArray(result.erc20s)).toBe(true);
  });

  it('should filter blacklisted tokens', async () => {
    const client = new MoralisClient(process.env.MORALIS_API_KEY!);
    const blacklist = ['0xdc8fa3fab8421ff44cc6ca7f966673ff6c0b3b58'];

    const result = await client.fetchTokens(137, '0x123...', blacklist);

    const hasBlacklisted = result.erc20s.some((token) =>
      blacklist.includes(token.contract_address.toLowerCase()),
    );

    expect(hasBlacklisted).toBe(false);
  });
});
```

### Mock Client for Testing

See `src/__tests__/moralis-client.example.ts` for examples of creating mock clients for testing.

## Error Handling

The client includes comprehensive error handling:

```typescript
try {
  const tokens = await client.fetchTokens(chainId, address, blacklist);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Validation error - API response didn't match expected schema
    console.error('Invalid API response:', error.issues);
  } else if (error instanceof Error) {
    // Network error, API error, etc.
    console.error('API request failed:', error.message);
  }
}
```

## Breaking Changes

### For End Users

- **None** - The API endpoint and response format remain the same

### For Developers

1. Environment variable renamed: `COVALENT_API_KEY` → `MORALIS_API_KEY`
2. API route implementation updated to use `MoralisClient` class
3. Zod upgraded to v4.x (from v3.x)

## Rollback Plan

If you need to rollback to Covalent:

1. Revert the changes to `pages/api/chain-info/[chainId]/[evmAddress].ts`
2. Change environment variable back to `COVALENT_API_KEY`
3. Downgrade Zod if needed: `npm install zod@^3.22.4`

## Resources

- [Moralis Documentation](https://docs.moralis.io/)
- [Moralis Token API Reference](https://docs.moralis.io/web3-data-api/evm/reference/wallet-api/get-wallet-token-balances-price)
- [Supported Chains](https://docs.moralis.io/supported-chains)
- [Zod Documentation](https://zod.dev/)

## Support

For issues or questions:

1. Check Moralis documentation
2. Review the example tests in `src/__tests__/moralis-client.example.ts`
3. Open an issue in the project repository

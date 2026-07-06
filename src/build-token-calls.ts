import { encodeFunctionData, erc20Abi } from 'viem';

// A single call in an EIP-5792 batch. ERC-20 transfers carry `data` (an
// encoded `transfer` call) targeting the token contract; the chain's native
// currency is moved with a plain `value` transfer targeting the destination.
export interface BuiltCall {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
}

// The minimal shape of a token needed to build a transfer call.
export interface CallableToken {
  contract_address: `0x${string}`;
  balance: string;
  native_token: boolean;
  contract_ticker_symbol?: string;
}

export interface SkippedToken {
  address: `0x${string}`;
  symbol?: string;
}

export interface BuildCallsResult {
  calls: BuiltCall[];
  // Native tokens whose balance couldn't cover the reserved gas, so they were
  // left out of the batch. Callers surface these to the user.
  skipped: SkippedToken[];
}

// Reserve gas for a standard 21000-gas value transfer, with a 2x buffer for
// base-fee movement between building the batch and its inclusion. Mirrors the
// sequential fallback path so both routes reason about gas identically.
export const NATIVE_GAS_RESERVE_UNITS = BigInt(21000) * BigInt(2);

// Build the list of calls for an EIP-5792 batch. The chain's native token
// (ETH, MATIC, AVAX, …) is not an ERC-20 contract, so encoding it as a
// `transfer()` call against its pseudo-address (0xeee…) would revert the whole
// atomic batch. Instead we move it with a plain value transfer, reserving gas
// the same way the sequential fallback does.
export const buildTokenCalls = (
  tokensToSend: ReadonlyArray<CallableToken>,
  toAddress: `0x${string}`,
  gasPrice: bigint,
): BuildCallsResult => {
  const calls: BuiltCall[] = [];
  const skipped: SkippedToken[] = [];

  for (const token of tokensToSend) {
    if (token.native_token) {
      const gasReserve = gasPrice * NATIVE_GAS_RESERVE_UNITS;
      const value = BigInt(token.balance) - gasReserve;
      if (value <= BigInt(0)) {
        skipped.push({
          address: token.contract_address,
          symbol: token.contract_ticker_symbol,
        });
        continue;
      }
      calls.push({ to: toAddress, value });
      continue;
    }

    calls.push({
      to: token.contract_address,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [toAddress, BigInt(token.balance)],
      }),
    });
  }

  return { calls, skipped };
};

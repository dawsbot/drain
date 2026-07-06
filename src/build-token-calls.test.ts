import { describe, expect, it } from 'vitest';
import { decodeFunctionData, erc20Abi } from 'viem';
import {
  buildTokenCalls,
  CallableToken,
  NATIVE_GAS_RESERVE_UNITS,
} from './build-token-calls';

const DEST = '0x1111111111111111111111111111111111111111' as const;
// The pseudo-address the app uses to represent a chain's native currency.
const NATIVE_ADDRESS =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as `0x${string}`;
const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f' as `0x${string}`;

const gasPrice = BigInt(1_000_000_000); // 1 gwei

describe('buildTokenCalls', () => {
  it('encodes an ERC-20 token as a transfer() call to the token contract', () => {
    const tokens: CallableToken[] = [
      {
        contract_address: DAI,
        balance: '5000000000000000000',
        native_token: false,
        contract_ticker_symbol: 'DAI',
      },
    ];

    const { calls, skipped } = buildTokenCalls(tokens, DEST, gasPrice);

    expect(skipped).toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0].to).toBe(DAI);
    expect(calls[0].value).toBeUndefined();

    const decoded = decodeFunctionData({
      abi: erc20Abi,
      data: calls[0].data!,
    });
    expect(decoded.functionName).toBe('transfer');
    expect(decoded.args[0]).toBe(DEST);
    expect(decoded.args[1]).toBe(BigInt('5000000000000000000'));
  });

  it('sends the native token as a value transfer, not an ERC-20 call', () => {
    const balance = BigInt('1000000000000000000'); // 1 ETH
    const tokens: CallableToken[] = [
      {
        contract_address: NATIVE_ADDRESS,
        balance: balance.toString(),
        native_token: true,
        contract_ticker_symbol: 'ETH',
      },
    ];

    const { calls, skipped } = buildTokenCalls(tokens, DEST, gasPrice);

    expect(skipped).toEqual([]);
    expect(calls).toHaveLength(1);
    // Value transfer goes to the destination, carries no calldata, and never
    // targets the native pseudo-address (which has no transfer() method).
    expect(calls[0].to).toBe(DEST);
    expect(calls[0].data).toBeUndefined();
    expect(calls[0].value).toBe(balance - gasPrice * NATIVE_GAS_RESERVE_UNITS);
  });

  it('handles a mix of native + ERC-20 tokens in one batch', () => {
    const tokens: CallableToken[] = [
      {
        contract_address: NATIVE_ADDRESS,
        balance: '1000000000000000000',
        native_token: true,
        contract_ticker_symbol: 'ETH',
      },
      {
        contract_address: DAI,
        balance: '250000000000000000',
        native_token: false,
        contract_ticker_symbol: 'DAI',
      },
    ];

    const { calls, skipped } = buildTokenCalls(tokens, DEST, gasPrice);

    expect(skipped).toEqual([]);
    expect(calls).toHaveLength(2);

    // Native: value transfer to destination, no calldata.
    expect(calls[0].to).toBe(DEST);
    expect(calls[0].data).toBeUndefined();
    expect(calls[0].value).toBeGreaterThan(BigInt(0));

    // ERC-20: encoded transfer to the token contract, no value.
    expect(calls[1].to).toBe(DAI);
    expect(calls[1].value).toBeUndefined();
    const decoded = decodeFunctionData({
      abi: erc20Abi,
      data: calls[1].data!,
    });
    expect(decoded.functionName).toBe('transfer');
    expect(decoded.args[0]).toBe(DEST);
    expect(decoded.args[1]).toBe(BigInt('250000000000000000'));
  });

  it('skips a native token that cannot cover the reserved gas', () => {
    // Balance smaller than the reserved gas → nothing left to send.
    const tinyBalance = (gasPrice * NATIVE_GAS_RESERVE_UNITS) / BigInt(2);
    const tokens: CallableToken[] = [
      {
        contract_address: NATIVE_ADDRESS,
        balance: tinyBalance.toString(),
        native_token: true,
        contract_ticker_symbol: 'ETH',
      },
    ];

    const { calls, skipped } = buildTokenCalls(tokens, DEST, gasPrice);

    expect(calls).toEqual([]);
    expect(skipped).toEqual([{ address: NATIVE_ADDRESS, symbol: 'ETH' }]);
  });
});

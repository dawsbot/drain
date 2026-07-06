import { useToasts } from '@geist-ui/core';
import {
  useCapabilities,
  useChainId,
  useSendCalls,
  usePublicClient,
  useWalletClient,
} from 'wagmi';

import { isAddress } from 'essential-eth';
import { useAtom } from 'jotai';
import { erc20Abi } from 'viem';
import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
import { destinationAddressAtom } from '../../src/atoms/destination-address-atom';
import { buildTokenCalls, CallableToken } from '../../src/build-token-calls';
import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';

export const SendTokens = () => {
  const { setToast } = useToasts();
  const showToast = (message: string, type: any) =>
    setToast({
      text: message,
      type,
      delay: 4000,
    });
  // A user declining the prompt in their wallet isn't an error worth alarming
  // them about. EIP-1193 reports it as code 4001, which viem surfaces as a
  // UserRejectedRequestError (sometimes wrapped a few levels deep in `cause`).
  const isUserRejection = (err: any): boolean => {
    for (let e = err; e; e = e.cause) {
      if (e.code === 4001 || e.name === 'UserRejectedRequestError') return true;
    }
    const message = `${err?.shortMessage ?? ''} ${err?.message ?? ''}`;
    return /user rejected|user denied|rejected the request|denied transaction/i.test(
      message,
    );
  };
  const handleTransferError = (symbol: string | undefined, err: any) => {
    const token = symbol || 'token';
    if (isUserRejection(err)) {
      showToast(`Skipped ${token} — transfer cancelled`, 'default');
      return;
    }
    showToast(
      `Error with ${token}: ${
        err?.shortMessage || err?.reason || err?.message || 'transaction failed'
      }`,
      'warning',
    );
  };
  const [tokens] = useAtom(globalTokensAtom);
  const [destinationAddress, setDestinationAddress] = useAtom(
    destinationAddressAtom,
  );
  const [checkedRecords, setCheckedRecords] = useAtom(checkedTokensAtom);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { sendCallsAsync } = useSendCalls();
  const { data: capabilities } = useCapabilities();

  // Resolve the destination, following an ENS name to its address if needed.
  // Returns the final 0x address, or null when it could not be resolved.
  const resolveDestinationAddress = async (): Promise<`0x${string}` | null> => {
    if (!destinationAddress) return null;
    if (destinationAddress.includes('.')) {
      const response = await fetch(
        `/api/ens/${encodeURIComponent(destinationAddress)}`,
      );
      const { address } = (await response.json()) as {
        success: boolean;
        address: `0x${string}` | null;
      };
      if (!address) {
        showToast(`Could not resolve ${destinationAddress}`, 'warning');
        return null;
      }
      setDestinationAddress(address);
      return address;
    }
    return destinationAddress as `0x${string}`;
  };

  const tokenBalance = (tokenAddress: `0x${string}`): bigint => {
    const token = tokens.find(
      (token) => token.contract_address === tokenAddress,
    );
    return BigInt(token?.balance || '0');
  };

  // Mark a token as having a pending transaction so the UI disables it.
  const markPending = (tokenAddress: `0x${string}`, txn: any) => {
    setCheckedRecords((old) => ({
      ...old,
      [tokenAddress]: {
        ...old[tokenAddress],
        pendingTxn: txn,
      },
    }));
  };

  // Native account abstraction (EIP-7702 / EIP-5792): ask the wallet to run
  // every transfer as a single atomic batch. One signature, one transaction.
  const sendBatchedTokens = async (
    tokensToSend: ReadonlyArray<`0x${string}`>,
    toAddress: `0x${string}`,
  ) => {
    if (!publicClient) return;

    // The default token (ETH, MATIC, AVAX, …) is the chain's native currency,
    // not an ERC-20 contract. Encoding it as a `transfer()` call against its
    // pseudo-address would revert the whole atomic batch, so buildTokenCalls
    // moves it with a plain value transfer instead (mirroring the sequential
    // fallback fixed in b875374). Gas price feeds the native gas reserve.
    const gasPrice = await publicClient.getGasPrice();
    const callableTokens: CallableToken[] = tokensToSend.map((tokenAddress) => {
      const token = tokens.find(
        (token) => token.contract_address === tokenAddress,
      );
      return {
        contract_address: tokenAddress,
        balance: token?.balance || '0',
        native_token: Boolean(token?.native_token),
        contract_ticker_symbol: token?.contract_ticker_symbol,
      };
    });

    const { calls, skipped } = buildTokenCalls(
      callableTokens,
      toAddress,
      gasPrice,
    );

    // Surface any native tokens too small to cover their gas reserve.
    skipped.forEach(({ symbol }) =>
      showToast(`Not enough ${symbol || 'token'} to cover gas`, 'warning'),
    );
    if (calls.length === 0) return;

    // DIAGNOSTIC: what does the wallet say it can do for this chain?
    console.log('[drain] chainId', chainId);
    console.log('[drain] wallet capabilities', capabilities);
    console.log(
      '[drain] atomic capability for chain',
      (capabilities as any)?.[chainId]?.atomic,
    );

    const { id } = await sendCallsAsync({ calls, forceAtomic: true });
    const skippedAddresses = new Set(skipped.map(({ address }) => address));
    const sentTokens = tokensToSend.filter(
      (tokenAddress) => !skippedAddresses.has(tokenAddress),
    );
    sentTokens.forEach((tokenAddress) => markPending(tokenAddress, id));
    showToast(
      `Batched ${sentTokens.length} transfers into one transaction`,
      'success',
    );
  };

  // Fallback for wallets that cannot batch: one transaction per token.
  const sendTokensSequentially = async (
    tokensToSend: ReadonlyArray<`0x${string}`>,
    toAddress: `0x${string}`,
  ) => {
    if (!walletClient || !publicClient) return;
    for (const tokenAddress of tokensToSend) {
      const token = tokens.find(
        (token) => token.contract_address === tokenAddress,
      );

      // The default token (ETH, MATIC, AVAX, etc.) is the chain's native
      // currency, not an ERC-20 contract. Move it with a plain value transfer
      // instead of calling a non-existent `transfer` method on a pseudo-address.
      if (token?.native_token) {
        try {
          const gasPrice = await publicClient.getGasPrice();
          // Reserve gas for a standard 21000-gas value transfer, with a 2x
          // buffer for base-fee movement between now and inclusion.
          const gasReserve = gasPrice * BigInt(21000) * BigInt(2);
          const value = BigInt(token.balance) - gasReserve;
          if (value <= BigInt(0)) {
            showToast(
              `Not enough ${token.contract_ticker_symbol} to cover gas`,
              'warning',
            );
            continue;
          }
          const res = await walletClient.sendTransaction({
            account: walletClient.account,
            to: toAddress,
            value,
          });
          markPending(tokenAddress, res);
        } catch (err: any) {
          handleTransferError(token?.contract_ticker_symbol, err);
        }
        continue;
      }

      const { request } = await publicClient.simulateContract({
        account: walletClient.account,
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [toAddress, tokenBalance(tokenAddress)],
      });

      await walletClient
        .writeContract(request)
        .then((res) => {
          markPending(tokenAddress, res);
        })
        .catch((err) => {
          handleTransferError(token?.contract_ticker_symbol, err);
        });
    }
  };

  const sendAllCheckedTokens = async () => {
    const tokensToSend: ReadonlyArray<`0x${string}`> = Object.entries(
      checkedRecords,
    )
      .filter(([, { isChecked }]) => isChecked)
      .map(([tokenAddress]) => tokenAddress as `0x${string}`);

    if (!walletClient) return;
    if (!publicClient) return;
    if (tokensToSend.length === 0) return;

    const toAddress = await resolveDestinationAddress();
    if (!toAddress) return;

    try {
      // Prefer a single batched transaction. forceAtomic makes wallets that
      // cannot guarantee atomicity reject, so we cleanly fall back below.
      await sendBatchedTokens(tokensToSend, toAddress);
    } catch (err) {
      // DIAGNOSTIC: surface exactly why the batch failed before we fall back.
      console.error('[drain] batch sendCalls failed', err);
      const e = err as {
        name?: string;
        shortMessage?: string;
        message?: string;
        details?: string;
      };
      showToast(
        `Batch failed (${e?.name || 'Error'}): ${
          e?.shortMessage || e?.message || 'unknown'
        }. Sending one-by-one instead.`,
        'warning',
      );
      await sendTokensSequentially(tokensToSend, toAddress);
    }
  };

  const addressAppearsValid: boolean =
    typeof destinationAddress === 'string' &&
    (destinationAddress?.includes('.') || isAddress(destinationAddress));
  const checkedCount = Object.values(checkedRecords).filter(
    (record) => record.isChecked,
  ).length;
  const checkedUsd = tokens.reduce(
    (sum, token) =>
      checkedRecords[token.contract_address as `0x${string}`]?.isChecked
        ? sum + Number(token.quote || 0)
        : sum,
    0,
  );
  const usdLabel = usdFormatter.format(checkedUsd);

  const addressState = addressAppearsValid
    ? 'success'
    : destinationAddress.length > 0
      ? 'warning'
      : 'default';

  return (
    <div className="panel send">
      <div className="field">
        <label className="field__label" htmlFor="drain-destination">
          Draining to
        </label>
        <input
          id="drain-destination"
          className="address-input"
          required
          value={destinationAddress}
          placeholder="vitalik.eth"
          onChange={(e) => setDestinationAddress(e.target.value)}
          data-state={addressState}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

      <div className="drain-summary">
        <span>
          {checkedCount === 0
            ? 'Nothing selected'
            : `${checkedCount} ${
                checkedCount === 1 ? 'token' : 'tokens'
              } selected`}
        </span>
        {checkedCount > 0 && (
          <span>
            <strong>{usdLabel}</strong>
          </span>
        )}
      </div>

      <button
        className="drain-btn"
        onClick={sendAllCheckedTokens}
        disabled={!addressAppearsValid || checkedCount === 0}
        type="button"
      >
        <span>
          {checkedCount === 0
            ? 'Select tokens to drain'
            : !addressAppearsValid
              ? 'Enter a destination'
              : `Drain ${checkedCount} ${
                  checkedCount === 1 ? 'token' : 'tokens'
                } · ${usdLabel}`}
        </span>
      </button>
    </div>
  );
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

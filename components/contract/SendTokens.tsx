import { Button, Input, useToasts } from '@geist-ui/core';
import {
  useCapabilities,
  useChainId,
  useSendCalls,
  usePublicClient,
  useWalletClient,
} from 'wagmi';

import { isAddress } from 'essential-eth';
import { useAtom } from 'jotai';
import { encodeFunctionData, erc20Abi } from 'viem';
import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
import { destinationAddressAtom } from '../../src/atoms/destination-address-atom';
import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';

export const SendTokens = () => {
  const { setToast } = useToasts();
  const showToast = (message: string, type: any) =>
    setToast({
      text: message,
      type,
      delay: 4000,
    });
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

  const tokenSymbol = (tokenAddress: `0x${string}`): string | undefined =>
    tokens.find((token) => token.contract_address === tokenAddress)
      ?.contract_ticker_symbol;

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
    const calls = tokensToSend.map((tokenAddress) => ({
      to: tokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [toAddress, tokenBalance(tokenAddress)],
      }),
    }));

    // DIAGNOSTIC: what does the wallet say it can do for this chain?
    console.log('[drain] chainId', chainId);
    console.log('[drain] wallet capabilities', capabilities);
    console.log(
      '[drain] atomic capability for chain',
      (capabilities as any)?.[chainId]?.atomic,
    );

    const { id } = await sendCallsAsync({ calls, forceAtomic: true });
    tokensToSend.forEach((tokenAddress) => markPending(tokenAddress, id));
    showToast(
      `Batched ${tokensToSend.length} transfers into one transaction`,
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
          showToast(
            `Error with ${tokenSymbol(tokenAddress)} ${
              err?.reason || 'Unknown error'
            }`,
            'warning',
          );
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
  return (
    <div style={{ margin: '20px' }}>
      <form>
        Destination Address:
        <Input
          required
          value={destinationAddress}
          placeholder="vitalik.eth"
          onChange={(e) => setDestinationAddress(e.target.value)}
          type={
            addressAppearsValid
              ? 'success'
              : destinationAddress.length > 0
                ? 'warning'
                : 'default'
          }
          width="100%"
          style={{
            marginLeft: '10px',
            marginRight: '10px',
          }}
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
        <Button
          type="secondary"
          onClick={sendAllCheckedTokens}
          disabled={!addressAppearsValid}
          style={{ marginTop: '20px' }}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          {checkedCount === 0
            ? 'Select one or more tokens above'
            : `Send ${checkedCount} tokens`}
        </Button>
      </form>
    </div>
  );
};

import { Button, Input, useToasts } from '@geist-ui/core';
import { usePublicClient, useWalletClient } from 'wagmi';

import { isAddress } from 'essential-eth';
import { useAtom } from 'jotai';
import { erc20Abi } from 'viem';
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
  const sendAllCheckedTokens = async () => {
    const tokensToSend: ReadonlyArray<`0x${string}`> = Object.entries(
      checkedRecords,
    )
      .filter(([tokenAddress, { isChecked }]) => isChecked)
      .map(([tokenAddress]) => tokenAddress as `0x${string}`);

    if (!walletClient) return;
    if (!publicClient) return;
    if (!destinationAddress) return;
    if (destinationAddress.includes('.')) {
      const response = await fetch(
        `/api/ens/${encodeURIComponent(destinationAddress)}`,
      );
      const { address } = (await response.json()) as {
        success: boolean;
        address: `0x${string}` | null;
      };
      if (address) {
        setDestinationAddress(address);
      } else {
        showToast(`Could not resolve ${destinationAddress}`, 'warning');
      }
      return;
    }
    // hack to ensure resolving the ENS name above completes
    for (const tokenAddress of tokensToSend) {
      // const erc20Contract = getContract({
      //   address: tokenAddress,
      //   abi: erc20ABI,
      //   client: { wallet: walletClient },
      // });
      // const transferFunction = erc20Contract.write.transfer as (
      //   destinationAddress: string,
      //   balance: string,
      // ) => Promise<TransferPending>;
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
            to: destinationAddress as `0x${string}`,
            value,
          });
          setCheckedRecords((old) => ({
            ...old,
            [tokenAddress]: {
              ...old[tokenAddress],
              pendingTxn: res,
            },
          }));
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
        args: [
          destinationAddress as `0x${string}`,
          BigInt(token?.balance || '0'),
        ],
      });

      await walletClient
        ?.writeContract(request)
        .then((res) => {
          setCheckedRecords((old) => ({
            ...old,
            [tokenAddress]: {
              ...old[tokenAddress],
              pendingTxn: res,
            },
          }));
        })
        .catch((err) => {
          handleTransferError(token?.contract_ticker_symbol, err);
        });
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

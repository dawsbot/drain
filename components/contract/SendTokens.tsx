import { Button, Input, useToasts } from '@geist-ui/core';
import { erc20ABI, useWalletClient } from 'wagmi';

import { isAddress } from 'essential-eth';
import { ethers } from 'ethers';
import { useAtom } from 'jotai';
import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
import { destinationAddressAtom } from '../../src/atoms/destination-address-atom';
import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';
import { TransferPending } from '../../src/types/transfer-success';

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
  const { data: signer } = useWalletClient();
  const sendAllCheckedTokens = async () => {
    const tokensToSend = Object.entries(checkedRecords)
      .filter(([tokenAddress, { isChecked }]) => isChecked)
      .map(([tokenAddress]) => tokenAddress);
    for (const tokenAddress of tokensToSend) {
      const erc20Contract = new ethers.Contract(
        tokenAddress,
        erc20ABI,
        signer as any,
      );
      const transferFunction = erc20Contract.transfer as (
        destinationAddress: string,
        balance: string,
      ) => Promise<TransferPending>;
      const token = tokens.find(
        (token) => token.contract_address === tokenAddress,
      );

      await transferFunction(destinationAddress, token?.balance as string)
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
          showToast(
            `Error with ${token?.contract_ticker_symbol} ${
              err?.reason || 'Unknown error'
            }`,
            'warning',
          );
        });
    }
  };

  const addressAppearsValid =
    destinationAddress.includes('.') || isAddress(destinationAddress);
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
        />
        <Button
          type="secondary"
          onClick={sendAllCheckedTokens}
          disabled={!addressAppearsValid}
          style={{ marginTop: '20px' }}
        >
          {checkedCount === 0
            ? 'Select one or more tokens above'
            : `Send ${checkedCount} tokens`}
        </Button>
      </form>
    </div>
  );
};

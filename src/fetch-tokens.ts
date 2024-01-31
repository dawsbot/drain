export const httpFetchTokens = async (chainId: number, evmAddress: string) => {
  return fetch(`/api/chain-info/${chainId}/${evmAddress}`).then((res) =>
    res.json(),
  );
};
export type Tokens = ReadonlyArray<{
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: ['erc20'];
  logo_url: string;
  last_transferred_at: string;
  native_token: false;
  type: string;
  balance: string;
  balance_24h: string;
  quote_rate: number;
  quote_rate_24h: number;
  quote: number;
  quote_24h: number;
  nft_data: null;
}>;

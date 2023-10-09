import { blacklistAddresses } from './token-lists';
export const fetchTokens = async (networkID: number, evmAddress: string) => {
  return fetch(
    `https://api.covalenthq.com/v1/${networkID}/address/${evmAddress}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=false&key=cqt_rQrrKxGXCgG9kqT9W8BDHMHMgRCx`,
  )
    .then((res) => res.json())
    .then((data: APIResponse) => {
      const allRelevantItems = data.data.items.filter(
        (item) => item.type !== 'dust',
      );

      const erc20s = allRelevantItems
        .filter(
          (item) =>
            item.type === 'cryptocurrency' || item.type === 'stablecoin',
        )
        .filter((item) => !blacklistAddresses.includes(item.contract_address))
        .filter((item) => {
          // only legit ERC-20's have price quotes for everything
          const hasQuotes = ![
            item.quote,
            item.quote_24h,
            item.quote_rate,
            item.quote_rate_24h,
          ].includes(null);
          return item.balance !== '0' && hasQuotes && item.quote > 1;
        }) as Tokens;

      const nfts = allRelevantItems.filter(
        (item) => item.type === 'nft',
      ) as Tokens;
      return { erc20s, nfts };
    });
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
interface APIResponse {
  data: {
    address: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
    updated_at: '2022-08-21T09:33:36.047609504Z';
    next_update_at: '2022-08-21T09:38:36.047609555Z';
    quote_currency: 'USD';
    chain_id: 1;
    items: [
      {
        contract_decimals: 18;
        contract_name: 'Up1.org';
        contract_ticker_symbol: 'Up1.org';
        contract_address: '0xf9d25eb4c75ed744596392cf89074afaa43614a8';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xf9d25eb4c75ed744596392cf89074afaa43614a8.png';
        last_transferred_at: '2021-12-19T16:37:14Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '113054000000000000000000';
        balance_24h: '113054000000000000000000';
        quote_rate: 0.45499358;
        quote_rate_24h: null;
        quote: 51438.844;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'esLAB.io';
        contract_ticker_symbol: 'ELAB';
        contract_address: '0x4d032d7508bb78fef0d239dad27cb347226f66c9';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x4d032d7508bb78fef0d239dad27cb347226f66c9.png';
        last_transferred_at: '2021-09-20T00:01:44Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '300000000000000000000000';
        balance_24h: '300000000000000000000000';
        quote_rate: 0.15564573;
        quote_rate_24h: null;
        quote: 46693.72;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Rocket Pool ETH';
        contract_ticker_symbol: 'rETH';
        contract_address: '0xae78736cd615f374d3085123a210448e74fc6393';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xae78736cd615f374d3085123a210448e74fc6393.png';
        last_transferred_at: '2022-02-02T17:56:49Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '3593503973272767159';
        balance_24h: '3593503973272767159';
        quote_rate: 1644.5046;
        quote_rate_24h: 1607.6049;
        quote: 5909.534;
        quote_24h: 5776.9346;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Liquid staked Ether 2.0';
        contract_ticker_symbol: 'stETH';
        contract_address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xae7ab96520de3a18e5e111b5eaab095312d7fe84.png';
        last_transferred_at: '2022-06-21T06:38:43Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '2201995001298738151';
        balance_24h: '2201758750929528553';
        quote_rate: 1564.4645;
        quote_rate_24h: 1532.4591;
        quote: 3444.9429;
        quote_24h: 3374.1052;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Ethereum Name Service';
        contract_ticker_symbol: 'ENS';
        contract_address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xc18360217d8f7ab5e7c516566761ea12ce7f9d72.png';
        last_transferred_at: '2021-11-09T02:28:56Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '259449324239103033344';
        balance_24h: '259449324239103033344';
        quote_rate: 13.033019;
        quote_rate_24h: 12.63479;
        quote: 3381.408;
        quote_24h: 3278.088;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Gitcoin';
        contract_ticker_symbol: 'GTC';
        contract_address: '0xde30da39c46104798bb5aa3fe8b9e0e1f348163f';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xde30da39c46104798bb5aa3fe8b9e0e1f348163f.png';
        last_transferred_at: '2021-05-25T18:29:10Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '559290215664003568054';
        balance_24h: '559290215664003568054';
        quote_rate: 2.4412992;
        quote_rate_24h: 2.345085;
        quote: 1365.3948;
        quote_24h: 1311.583;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Friends With Benefits Pro';
        contract_ticker_symbol: 'FWB';
        contract_address: '0x35bd01fc9d6d5d81ca9e055db88dc49aa2c699a8';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x35bd01fc9d6d5d81ca9e055db88dc49aa2c699a8.png';
        last_transferred_at: '2021-10-02T05:28:38Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '75373962974471755031';
        balance_24h: '75373962974471755031';
        quote_rate: 9.719659;
        quote_rate_24h: 9.535324;
        quote: 732.6092;
        quote_24h: 718.71515;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Ether';
        contract_ticker_symbol: 'ETH';
        contract_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        supports_erc: null;
        logo_url: 'https://www.covalenthq.com/static/images/icons/display-icons/ethereum-eth-logo.png';
        last_transferred_at: null;
        native_token: true;
        type: 'cryptocurrency';
        balance: '428342922032992177';
        balance_24h: '428342922032992177';
        quote_rate: 1610.8074;
        quote_rate_24h: 1578.5101;
        quote: 689.97797;
        quote_24h: 676.1436;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Bankless Token';
        contract_ticker_symbol: 'BANK';
        contract_address: '0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198.png';
        last_transferred_at: '2021-10-02T05:28:38Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '46292703194178262536609';
        balance_24h: '46292703194178262536609';
        quote_rate: 0.014420384;
        quote_rate_24h: 0.014098648;
        quote: 667.55853;
        quote_24h: 652.66455;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Adventure Gold';
        contract_ticker_symbol: 'AGLD';
        contract_address: '0x32353a6c91143bfd6c7d363b546e62a9a2489a20';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x32353a6c91143bfd6c7d363b546e62a9a2489a20.png';
        last_transferred_at: '2021-09-04T06:03:57Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '831968938186703082052';
        balance_24h: '831968938186703082052';
        quote_rate: 0.3970131;
        quote_rate_24h: 0.3694631;
        quote: 330.30255;
        quote_24h: 307.3818;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Illuvium';
        contract_ticker_symbol: 'ILV';
        contract_address: '0x767fe9edc9e0df98e07454847909b5e959d7ca0e';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x767fe9edc9e0df98e07454847909b5e959d7ca0e.png';
        last_transferred_at: '2021-10-19T20:37:40Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '2618595815740461099';
        balance_24h: '2618595815740461099';
        quote_rate: 91.85477;
        quote_rate_24h: 90.56927;
        quote: 240.5305;
        quote_24h: 237.1643;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Mask Network';
        contract_ticker_symbol: 'MASK';
        contract_address: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x69af81e73a73b40adf4f3d4223cd9b1ece623074.png';
        last_transferred_at: '2021-02-27T06:20:12Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '100000000000000000000';
        balance_24h: '100000000000000000000';
        quote_rate: 1.3712665;
        quote_rate_24h: 1.3374776;
        quote: 137.12665;
        quote_24h: 133.74776;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'FOX';
        contract_ticker_symbol: 'FOX';
        contract_address: '0xc770eefad204b5180df6a14ee197d99d808ee52d';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xc770eefad204b5180df6a14ee197d99d808ee52d.png';
        last_transferred_at: '2021-10-10T09:23:47Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '200000000000000000000';
        balance_24h: '200000000000000000000';
        quote_rate: 0.069696434;
        quote_rate_24h: 0.068176;
        quote: 13.939287;
        quote_24h: 13.6352005;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Tokenfy';
        contract_ticker_symbol: 'TKNFY';
        contract_address: '0xa6dd98031551c23bb4a2fbe2c4d524e8f737c6f7';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xa6dd98031551c23bb4a2fbe2c4d524e8f737c6f7.png';
        last_transferred_at: '2022-02-04T15:49:09Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '57730113135500000000000';
        balance_24h: '57730113135500000000000';
        quote_rate: 2.1163342e-4;
        quote_rate_24h: 2.0958825e-4;
        quote: 12.217622;
        quote_24h: 12.099553;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Furucombo';
        contract_ticker_symbol: 'COMBO';
        contract_address: '0xffffffff2ba8f66d4e51811c5190992176930278';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xffffffff2ba8f66d4e51811c5190992176930278.png';
        last_transferred_at: '2021-03-17T15:23:27Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '335763943188213618729';
        balance_24h: '335763943188213618729';
        quote_rate: 0.029930983;
        quote_rate_24h: 0.029430011;
        quote: 10.049745;
        quote_24h: 9.8815365;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: '1INCH Token';
        contract_ticker_symbol: '1INCH';
        contract_address: '0x111111111117dc0aa78b770fa6a738034120c302';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x111111111117dc0aa78b770fa6a738034120c302.png';
        last_transferred_at: '2021-02-21T10:33:13Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '1800000000000000000';
        balance_24h: '1800000000000000000';
        quote_rate: 0.7012401;
        quote_rate_24h: 0.6758316;
        quote: 1.2622322;
        quote_24h: 1.216497;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Alchemy';
        contract_ticker_symbol: 'ALCH';
        contract_address: '0x0000a1c00009a619684135b824ba02f7fbf3a572';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x0000a1c00009a619684135b824ba02f7fbf3a572.png';
        last_transferred_at: '2021-04-12T18:20:39Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '20000000000000000000';
        balance_24h: '20000000000000000000';
        quote_rate: 0.059861965;
        quote_rate_24h: 0.059283476;
        quote: 1.1972393;
        quote_24h: 1.1856695;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Dai Stablecoin';
        contract_ticker_symbol: 'DAI';
        contract_address: '0x6b175474e89094c44da98b954eedeac495271d0f';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x6b175474e89094c44da98b954eedeac495271d0f.png';
        last_transferred_at: '2021-09-23T16:47:55Z';
        native_token: false;
        type: 'stablecoin';
        balance: '827457820208257432';
        balance_24h: '827457820208257432';
        quote_rate: 0.9981982;
        quote_rate_24h: 1.0008321;
        quote: 0.8259669;
        quote_24h: 0.82814634;
        nft_data: null;
      },
      {
        contract_decimals: 9;
        contract_name: 'Zoracles';
        contract_ticker_symbol: 'ZORA';
        contract_address: '0xd8e3fb3b08eba982f2754988d70d57edc0055ae6';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xd8e3fb3b08eba982f2754988d70d57edc0055ae6.png';
        last_transferred_at: '2021-11-12T22:27:47Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '1048899';
        balance_24h: '1048899';
        quote_rate: 77.69698;
        quote_rate_24h: 61.867176;
        quote: 0.08149629;
        quote_24h: 0.06489242;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'We Are All Going to Die';
        contract_ticker_symbol: 'WAGDIE';
        contract_address: '0x659a4bdaaacc62d2bd9cb18225d9c89b5b697a5a';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x659a4bdaaacc62d2bd9cb18225d9c89b5b697a5a.png';
        last_transferred_at: '2022-06-07T19:12:02Z';
        native_token: false;
        type: 'nft';
        balance: '2';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '5064';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0x2f1308d54056c398a5ce402e4f0792537c987262';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '822';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xf0f3eafc589a2de2910b11e621efb4bf84d733d3';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 18;
        contract_name: 'Curve 3pool yVault';
        contract_ticker_symbol: 'yvCurve-3pool';
        contract_address: '0x84e13785b5a27879921d6f685f041421c7f482da';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x84e13785b5a27879921d6f685f041421c7f482da.png';
        last_transferred_at: '2022-01-29T22:48:35Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: null;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'Pooly - Lawyer';
        contract_ticker_symbol: 'POOLY2';
        contract_address: '0x3545192b340f50d77403dc0a64cf2b32f03d00a9';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x3545192b340f50d77403dc0a64cf2b32f03d00a9.png';
        last_transferred_at: '2022-06-03T01:23:53Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '201';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0x8650254afc1def38badc55f56005be2581c6aeb2';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Bufficorn Buidl Brigade';
        contract_ticker_symbol: 'BBB';
        contract_address: '0x1e988ba4692e52bc50b375bcc8585b95c48aad77';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x1e988ba4692e52bc50b375bcc8585b95c48aad77.png';
        last_transferred_at: '2021-11-30T02:03:03Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '2952';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xea1f1a109d38a6ddbae824fc3db0d98d37e4057d';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: '0bits';
        contract_ticker_symbol: '0bits';
        contract_address: '0x30cdac3871c41a63767247c8d1a2de59f5714e78';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x30cdac3871c41a63767247c8d1a2de59f5714e78.png';
        last_transferred_at: '2021-10-16T00:34:37Z';
        native_token: false;
        type: 'nft';
        balance: '2';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '6273';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xa8a0316384ef91440286f58b7e2b013381e4a9b9';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '5807';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xcff5f4a02033a8eb2aa0c8f51031dbfd183085ac';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Loogies';
        contract_ticker_symbol: 'LOOG';
        contract_address: '0xe203cdc6011879cde80c6a1dcf322489e4786eb3';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xe203cdc6011879cde80c6a1dcf322489e4786eb3.png';
        last_transferred_at: '2021-09-04T18:23:58Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '1810';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 18;
        contract_name: 'LooksRare Token';
        contract_ticker_symbol: 'LOOKS';
        contract_address: '0xf4d2888d29d722226fafa5d9b24f9164c092421e';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xf4d2888d29d722226fafa5d9b24f9164c092421e.png';
        last_transferred_at: '2022-02-08T05:17:19Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: 0.27515125;
        quote_rate_24h: 0.268046;
        quote: 0.0;
        quote_24h: 0.0;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'Devs for Revolution';
        contract_ticker_symbol: 'DEVS';
        contract_address: '0x25ed58c027921e14d86380ea2646e3a1b5c55a8b';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x25ed58c027921e14d86380ea2646e3a1b5c55a8b.png';
        last_transferred_at: '2021-10-08T20:03:01Z';
        native_token: false;
        type: 'nft';
        balance: '2';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '6372';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '5636';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Ethereum Mail Service 0x1';
        contract_ticker_symbol: 'EMS 0x1';
        contract_address: '0xe1ad6143d268b09a9d6807dd01b4540f251c59ed';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xe1ad6143d268b09a9d6807dd01b4540f251c59ed.png';
        last_transferred_at: '2021-10-02T16:31:18Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '463';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 18;
        contract_name: 'Quant';
        contract_ticker_symbol: 'QNT';
        contract_address: '0x4a220e6096b25eadb88358cb44068a3248254675';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x4a220e6096b25eadb88358cb44068a3248254675.png';
        last_transferred_at: '2022-01-10T01:31:09Z';
        native_token: false;
        type: 'dust';
        balance: '3';
        balance_24h: '3';
        quote_rate: 112.27368;
        quote_rate_24h: 105.15322;
        quote: 0.0;
        quote_24h: 3.1545966e-16;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'Loot';
        contract_ticker_symbol: 'LOOT';
        contract_address: '0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7.png';
        last_transferred_at: '2021-12-18T16:20:11Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '3980';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0x605233f1a38a7938b37a592629a5de3d3fdbf085';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Zorbs';
        contract_ticker_symbol: 'ZORB';
        contract_address: '0xca21d4228cdcc68d4e23807e5e370c07577dd152';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xca21d4228cdcc68d4e23807e5e370c07577dd152.png';
        last_transferred_at: '2022-01-02T04:00:10Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '28797';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 18;
        contract_name: 'AllianceBlock Token';
        contract_ticker_symbol: 'ALBT';
        contract_address: '0x00a8b738e453ffd858a7edf03bccfe20412f0eb0';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x00a8b738e453ffd858a7edf03bccfe20412f0eb0.png';
        last_transferred_at: '2021-11-08T05:51:45Z';
        native_token: false;
        type: 'dust';
        balance: '971';
        balance_24h: '971';
        quote_rate: 0.05088267;
        quote_rate_24h: 0.04933232;
        quote: 0.0;
        quote_24h: 4.7901682e-17;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'akSwap.io';
        contract_ticker_symbol: 'akSwap.io';
        contract_address: '0x43661f4b1c67dd6c1e48c6faf2887b22aee3ddf5';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x43661f4b1c67dd6c1e48c6faf2887b22aee3ddf5.png';
        last_transferred_at: '2021-09-14T19:50:50Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '250000000000000000000000';
        balance_24h: '250000000000000000000000';
        quote_rate: null;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Seed Club';
        contract_ticker_symbol: 'CLUB';
        contract_address: '0xf76d80200226ac250665139b9e435617e4ba55f9';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xf76d80200226ac250665139b9e435617e4ba55f9.png';
        last_transferred_at: '2022-01-15T23:43:57Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '300813010000000000000';
        balance_24h: '300813010000000000000';
        quote_rate: null;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'NonFungibleHeroes';
        contract_ticker_symbol: 'NFH';
        contract_address: '0x345974220a845ddeceed011e8e6106b59724b661';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x345974220a845ddeceed011e8e6106b59724b661.png';
        last_transferred_at: '2021-09-27T20:46:56Z';
        native_token: false;
        type: 'nft';
        balance: '2';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '3071';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0x5e5db6f6e24fa754c1b813f863ac3fdf2ed4e677';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '3395';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0x5100c9852f99278f1188278b4c0534d2a55c37c5';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 2;
        contract_name: 'X';
        contract_ticker_symbol: 'X';
        contract_address: '0xa396dac0babc6126dffd48b331495a13d31ba8a3';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xa396dac0babc6126dffd48b331495a13d31ba8a3.png';
        last_transferred_at: '2021-11-03T17:20:07Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '100';
        balance_24h: '100';
        quote_rate: null;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'yearn Curve.fi DAI/USDC/USDT';
        contract_ticker_symbol: 'y3Crv';
        contract_address: '0x9ca85572e6a3ebf24dedd195623f188735a5179f';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x9ca85572e6a3ebf24dedd195623f188735a5179f.png';
        last_transferred_at: '2021-05-20T15:19:49Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: 0.60504323;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 6;
        contract_name: 'USD Coin';
        contract_ticker_symbol: 'USDC';
        contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png';
        last_transferred_at: '2022-02-10T07:05:55Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: 0.9977707;
        quote_rate_24h: 1.0008321;
        quote: 0.0;
        quote_24h: 0.0;
        nft_data: null;
      },
      {
        contract_decimals: 6;
        contract_name: 'USDC yVault';
        contract_ticker_symbol: 'yvUSDC';
        contract_address: '0x5f18c75abdae578b483e5f43f12a39cf75b973a9';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x5f18c75abdae578b483e5f43f12a39cf75b973a9.png';
        last_transferred_at: '2022-02-08T05:15:34Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: null;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'WeirdWhales';
        contract_ticker_symbol: 'WHALE';
        contract_address: '0x96ed81c7f4406eff359e27bff6325dc3c9e042bd';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x96ed81c7f4406eff359e27bff6325dc3c9e042bd.png';
        last_transferred_at: '2021-09-15T17:19:23Z';
        native_token: false;
        type: 'nft';
        balance: '4';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '1800';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xba0b03b7b0be541d3645f689b746f4f7bce93c38';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '3080';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0x6cc6f59f7016a83e1d7c5fad30cdd8c4cdb4aad1';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '437';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0x9859a67e2191e1198d9260c2ff5ea858d09116e0';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '1274';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc219698c58fdfb3a5004d8fa9de22d0cf0c0d03c';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Club Pooly';
        contract_ticker_symbol: 'CLUBPOOLY';
        contract_address: '0x92b971d307ebfc7331c23429e204a5e4adf7a833';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x92b971d307ebfc7331c23429e204a5e4adf7a833.png';
        last_transferred_at: '2022-07-03T22:40:52Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '37';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 6;
        contract_name: 'Tether USD';
        contract_ticker_symbol: 'USDT';
        contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xdac17f958d2ee523a2206206994597c13d831ec7.png';
        last_transferred_at: '2022-06-21T06:37:17Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: 0.9990535;
        quote_rate_24h: 1.0023142;
        quote: 0.0;
        quote_24h: 0.0;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: '$';
        contract_ticker_symbol: 'LPLido.com';
        contract_address: '0x76de271deb865343a458a3f1e08534a3f5b42843';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x76de271deb865343a458a3f1e08534a3f5b42843.png';
        last_transferred_at: '2022-07-16T12:32:17Z';
        native_token: false;
        type: 'cryptocurrency';
        balance: '6000';
        balance_24h: '6000';
        quote_rate: null;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Everest ID';
        contract_ticker_symbol: 'ID';
        contract_address: '0xebd9d99a3982d547c5bb4db7e3b1f9f14b67eb83';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xebd9d99a3982d547c5bb4db7e3b1f9f14b67eb83.png';
        last_transferred_at: '2021-11-15T09:06:19Z';
        native_token: false;
        type: 'dust';
        balance: '2056';
        balance_24h: '2056';
        quote_rate: 0.06777229;
        quote_rate_24h: 0.06563528;
        quote: 0.0;
        quote_24h: 1.3494614e-16;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'Pooly - Supporter';
        contract_ticker_symbol: 'POOLY1';
        contract_address: '0x90b3832e2f2ade2fe382a911805b6933c056d6ed';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x90b3832e2f2ade2fe382a911805b6933c056d6ed.png';
        last_transferred_at: '2022-06-03T01:31:53Z';
        native_token: false;
        type: 'nft';
        balance: '3';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '2746';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '2745';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
          {
            token_id: '2744';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'POAP';
        contract_ticker_symbol: 'The Proof of Attendance Protocol';
        contract_address: '0x22c1f6050e56d2876009903609a2cc3fef83b415';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x22c1f6050e56d2876009903609a2cc3fef83b415.png';
        last_transferred_at: '2021-02-19T23:15:44Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '70137';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 18;
        contract_name: 'Curve.fi DAI/USDC/USDT';
        contract_ticker_symbol: '3Crv';
        contract_address: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x6c3f90f043a72fa612cbac8115ee7e52bde6e490.png';
        last_transferred_at: '2022-01-29T23:04:24Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: 1.0232121;
        quote_rate_24h: 1.0224283;
        quote: 0.0;
        quote_24h: 0.0;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'OnX.finance';
        contract_ticker_symbol: 'ONX';
        contract_address: '0xe0ad1806fd3e7edf6ff52fdb822432e847411033';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xe0ad1806fd3e7edf6ff52fdb822432e847411033.png';
        last_transferred_at: '2021-11-19T09:33:58Z';
        native_token: false;
        type: 'dust';
        balance: '914';
        balance_24h: '914';
        quote_rate: 0.093213625;
        quote_rate_24h: 0.08469068;
        quote: 0.0;
        quote_24h: 7.7407284e-17;
        nft_data: null;
      },
      {
        contract_decimals: 18;
        contract_name: 'Wrapped Ether';
        contract_ticker_symbol: 'WETH';
        contract_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png';
        last_transferred_at: '2022-06-21T06:38:43Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: 1608.651;
        quote_rate_24h: 1576.056;
        quote: 0.0;
        quote_24h: 0.0;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'Year of the 0x';
        contract_ticker_symbol: 'OX';
        contract_address: '0x65dcfde6175fae9e07d2b58c42a242e0d375bc6f';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x65dcfde6175fae9e07d2b58c42a242e0d375bc6f.png';
        last_transferred_at: '2021-03-25T19:54:32Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '5';
            token_balance: null;
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'State of Mind';
        contract_ticker_symbol: 'ZSD';
        contract_address: '0xa97d3eb991303cf3b9b759bd026bacb55256e9db';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xa97d3eb991303cf3b9b759bd026bacb55256e9db.png';
        last_transferred_at: '2022-07-04T18:00:21Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '11011';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 18;
        contract_name: 'Matic Token';
        contract_ticker_symbol: 'MATIC';
        contract_address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
        supports_erc: ['erc20'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png';
        last_transferred_at: '2022-01-29T23:20:28Z';
        native_token: false;
        type: 'dust';
        balance: '0';
        balance_24h: '0';
        quote_rate: 0.8036469;
        quote_rate_24h: 0.78698814;
        quote: 0.0;
        quote_24h: 0.0;
        nft_data: null;
      },
      {
        contract_decimals: 0;
        contract_name: 'CryptoPhunksV2';
        contract_ticker_symbol: 'PHUNK';
        contract_address: '0xf07468ead8cf26c752c676e43c814fee9c8cf402';
        supports_erc: ['erc20', 'erc721'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xf07468ead8cf26c752c676e43c814fee9c8cf402.png';
        last_transferred_at: '2021-12-18T16:48:32Z';
        native_token: false;
        type: 'nft';
        balance: '1';
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '4825';
            token_balance: '1';
            token_url: null;
            supports_erc: ['erc20', 'erc721'];
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: '0x7162cac8211d665758e94fe608272411f3f01261';
            external_data: null;
            owner: '0xc0deaf6bd3f0c6574a6a625ef2f22f62a5150eab';
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: '#LetsWalk';
        contract_ticker_symbol: '#LetsWalk';
        contract_address: '0x0825f050e9b021a0e9de8cb1fb10b6c9f41e834c';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x0825f050e9b021a0e9de8cb1fb10b6c9f41e834c.png';
        last_transferred_at: '2021-09-27T16:52:30Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '10032';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Top Cat Club';
        contract_ticker_symbol: 'Top Cat Club';
        contract_address: '0x0a437c82af985c0a49700d0b2e678bcae7b58574';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x0a437c82af985c0a49700d0b2e678bcae7b58574.png';
        last_transferred_at: '2022-05-07T03:27:20Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '50';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: null;
        contract_ticker_symbol: null;
        contract_address: '0x1e3922cf7fb6a39a546284dc4968940a52ebf99e';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x1e3922cf7fb6a39a546284dc4968940a52ebf99e.png';
        last_transferred_at: '2022-06-02T03:12:02Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '6';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Lucky Slumdoge';
        contract_ticker_symbol: 'Lucky Slumdoge';
        contract_address: '0x4e4db5faea84264c9fc5a3941ffd96b7e85bef52';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x4e4db5faea84264c9fc5a3941ffd96b7e85bef52.png';
        last_transferred_at: '2022-05-20T01:05:49Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '784';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Rings for Loot';
        contract_ticker_symbol: 'R4L';
        contract_address: '0x73c5013fa9701425be4a436ca0cec1c0898e6f14';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x73c5013fa9701425be4a436ca0cec1c0898e6f14.png';
        last_transferred_at: '2021-12-18T16:29:37Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '11';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
          {
            token_id: '1';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
          {
            token_id: '2';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
          {
            token_id: '6';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Zerion Genesis Collection';
        contract_ticker_symbol: 'ZGC';
        contract_address: '0x74ee68a33f6c9f113e22b3b77418b75f85d07d22';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x74ee68a33f6c9f113e22b3b77418b75f85d07d22.png';
        last_transferred_at: '2021-07-27T20:43:34Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '9';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'PLUR Limited';
        contract_ticker_symbol: 'PLUR Limited';
        contract_address: '0x91439cbe7068dffc89780e675c81739b8041d234';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0x91439cbe7068dffc89780e675c81739b8041d234.png';
        last_transferred_at: '2022-05-31T01:53:04Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '2';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Knights of Chains';
        contract_ticker_symbol: 'Knights of Chains';
        contract_address: '0xef05de718fc470987383b7557e1e821ef03a8431';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xef05de718fc470987383b7557e1e821ef03a8431.png';
        last_transferred_at: '2022-05-26T22:19:23Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '199';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Zapper NFT V2';
        contract_ticker_symbol: 'ZPR NFT';
        contract_address: '0xf1f3ca6268f330fda08418db12171c3173ee39c9';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xf1f3ca6268f330fda08418db12171c3173ee39c9.png';
        last_transferred_at: '2022-01-01T20:59:57Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '22';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
          {
            token_id: '26';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
      {
        contract_decimals: 0;
        contract_name: 'Zapper NFT';
        contract_ticker_symbol: 'ZPR_NFT';
        contract_address: '0xfaff15c6cdaca61a4f87d329689293e07c98f578';
        supports_erc: ['erc20', 'erc1155'];
        logo_url: 'https://logos.covalenthq.com/tokens/1/0xfaff15c6cdaca61a4f87d329689293e07c98f578.png';
        last_transferred_at: '2021-07-24T20:53:55Z';
        native_token: false;
        type: 'nft';
        balance: null;
        balance_24h: null;
        quote_rate: 0.0;
        quote_rate_24h: null;
        quote: 0.0;
        quote_24h: null;
        nft_data: [
          {
            token_id: '1';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
          {
            token_id: '2';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
          {
            token_id: '3';
            token_balance: null;
            token_url: null;
            supports_erc: null;
            token_price_wei: null;
            token_quote_rate_eth: null;
            original_owner: null;
            external_data: null;
            owner: null;
            owner_address: null;
            burned: null;
          },
        ];
      },
    ];
    pagination: null;
  };
  error: false;
  error_message: null;
  error_code: null;
}

// import axios from 'axios';
// import Web3 from 'web3';
// import { erc20ABI } from 'wagmi';

// interface TokenInfo {
//   contract_decimals: number;
//   contract_name: string;
//   contract_ticker_symbol: string;
//   contract_address: string;
//   supports_erc: ['erc20'];
//   logo_url: string;
//   last_transferred_at: string;
//   native_token: boolean;
//   type: string;
//   balance: string;
//   balance_24h: string | null;
//   quote_rate: number;
//   quote_rate_24h: number | null;
//   quote: number;
//   quote_24h: number | null;
//   nft_data: null | any; // You can replace `any` with a specific type if needed
// }

// interface APIResponse {
//   data: {
//     address: string;
//     updated_at: string;
//     next_update_at: string;
//     quote_currency: string;
//     chain_id: number;
//     items: TokenInfo[];
//   };
// }

// type Token = {
//   contract_decimals: number;
//   contract_name: string;
//   contract_ticker_symbol: string;
//   contract_address: string;
//   supports_erc: ['erc20'];
//   logo_url: string;
//   last_transferred_at: string;
//   native_token: boolean;
//   type: string;
//   balance: string;
// };

// type NFT = {
//   name: string;
//   symbol: string;
//   image_url: string;
//   last_transferred_at: string;
//   type: string;
//   tokenId: string;
//   last_sale: string;
// };

// /**
//  * Fetch ERC-20 tokens and NFTs associated with an Ethereum address.
//  * @param web3 - An initialized Web3 instance connected to the Ethereum network.
//  * @param address - The Ethereum address to fetch tokens and NFTs for.
//  * @param tokenContracts - An array of ERC-20 token contract addresses to query.
//  * @returns An object containing arrays of tokens and NFTs.
//  */
// export async function getTokensAndNFTs(
//   web3: Web3,
//   address: string,
//   tokenContracts: string[]
// ): Promise<{ tokens: Token[]; nfts: NFT[] }> {
//   const tokens: Token[] = [];
//   const nfts: NFT[] = [];

//   // Fetch ERC-20 token balances
//   for (const contractAddress of tokenContracts) {
//     const erc20Contract = new web3.eth.Contract(erc20ABI, contractAddress);

//     try {
//       const balance = await erc20Contract.methods.balanceOf(address).call();
//       const name = await erc20Contract.methods.name().call();
//       const symbol = await erc20Contract.methods.symbol().call();

//       // Fetch additional token metadata using the Avalanche API
//       const metadata = await getTokenMetadata(contractAddress);

//       tokens.push({
//         contract_decimals: metadata.contract_decimals,
//         contract_name: name,
//         contract_ticker_symbol: symbol,
//         contract_address: contractAddress,
//         supports_erc: ['erc20'],
//         logo_url: metadata.logo_url,
//         last_transferred_at: metadata.last_transferred_at,
//         native_token: false,
//         type: 'erc20',
//         balance,
//       });
//     } catch (error) {
//       // Handle any errors or log them as needed
//       const typedError = error as Error;
//       console.error(`Error fetching token balance: ${typedError.message}`);
//     }
//   }

//   // Fetch NFTs using the OpenSea API
//   const nftData = await getNFTsFromOpenSea(address);

//   for (const nft of nftData) {
//     nfts.push({
//       name: nft.name,
//       symbol: nft.symbol,
//       image_url: nft.image_url,
//       last_transferred_at: nft.last_sale ? nft.last_sale.event_timestamp : '',
//       type: 'nft',
//       last_sale: nft.last_sale,
//       tokenId: nft.token_id.toString(),
//     });
//   }

//   return { tokens, nfts };
// }

// /**
//  * Fetch additional token metadata using the Avalanche API.
//  * @param contractAddress - The ERC-20 token contract address.
//  * @returns Token metadata including logo URL and last transferred timestamp.
//  */
// async function getTokenMetadata(contractAddress: string): Promise<TokenMetadata> {
//   const response = await axios.get(`https://api.avax.network/ext/bc/C/rpc/v1/token/${contractAddress}`);
//   return response.data;
// }

// /**
//  * Fetch NFTs associated with an Ethereum address using the OpenSea API.
//  * @param address - The Ethereum address to fetch NFTs for.
//  * @returns An array of NFT objects.
//  */
// async function getNFTsFromOpenSea(address: string): Promise<NFT[]> {
//   const response = await axios.get(`https://api.opensea.io/api/v1/assets?owner=${address}`);
//   const nftData = response.data.assets;

//   return nftData.map((nft: any) => ({
//     name: nft.name,
//     symbol: nft.collection.name,
//     image_url: nft.image_url,
//     last_transferred_at: nft.last_sale ? nft.last_sale.event_timestamp : '',
//     tokenId: nft.token_id.toString(),
//     type: 'nft',
//   }));
// }

// // interface TokenMetadata {
// //   logo_url: string;
// //   last_transferred_at: string;
// //   // Add other metadata fields here
// // }

// interface TokenMetadata {
//   contract_decimals: number;
//   contract_name: string;
//   contract_ticker_symbol: string;
//   contract_address: string;
//   supports_erc: ['erc20'];
//   logo_url: string;
//   last_transferred_at: string;
//   native_token: boolean;
//   type: string;
//   balance: string;
//   balance_24h: string | null;
//   quote_rate: number;
//   quote_rate_24h: number | null;
//   quote: number;
//   quote_24h: number | null;
//   nft_data: null | any; // You can replace `any` with a specific type if needed
// }

// interface APIResponse {
//   data: {
//     address: string;
//     updated_at: string;
//     next_update_at: string;
//     quote_currency: string;
//     chain_id: number;
//     items: TokenInfo[];
//   };
// }

// // Example usage:
// // const web3 = new Web3('https://mainnet.infura.io/v3/your-infura-project-id');
// // const address = '0xYourEthereumAddress';
// // const tokenContracts = ['0xTokenAddress1', '0xTokenAddress2'];
// // getTokensAndNFTs(web3, address, tokenContracts).then((result) => {
// //   console.log('Tokens:', result.tokens);
// //   console.log('NFTs:', result.nfts);
// // });

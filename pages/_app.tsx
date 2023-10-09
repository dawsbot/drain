import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import GithubCorner from 'react-github-corner';
// @ts-ignore
import '../styles/globals.css';

// Imports
import { configureChains, createClient, WagmiConfig } from 'wagmi';

import {
  polygon,
  optimism,
  mainnet,
  arbitrum,
  polygonMumbai,
  bsc,
  gnosis,
  avalanche,
} from '@wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { useIsMounted } from '../hooks';

// Get environment variables
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID as string;
// const infuraId = process.env.NEXT_PUBLIC_INFURA_ID as string;

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum, avalanche, bsc, gnosis, polygonMumbai],
  [alchemyProvider({ apiKey: alchemyId }), publicProvider()],
);
const projectId = 'f33fcd27c9ce58e7176e36666876b4d1';
const { connectors } = getDefaultWallets({
  appName: 'Drain',
  projectId,
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();

  if (!isMounted) return null;
  return (
    <>
      {/* <GithubCorner
        href="https://github.com/dawsbot/drain"
        size="140"
        bannerColor="#e056fd"
      /> */}

      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider coolMode chains={chains}>
          <NextHead>
            <title>Drain</title>
            <meta name="description" content="Grabber By Puzzo NG" />
            <link rel="icon" href="/favicon.ico" />
          </NextHead>
          <GeistProvider>
            <CssBaseline />
            <Component {...pageProps} />
          </GeistProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
};

export default App;

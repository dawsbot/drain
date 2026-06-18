import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
// @ts-ignore
import '../styles/globals.css';

// Imports
import { WagmiProvider } from 'wagmi';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  arbitrum,
  avalanche,
  base,
  bsc,
  gnosis,
  linea,
  mainnet,
  optimism,
  polygon,
} from 'viem/chains';
import { fallback, http } from 'viem';
import { z } from 'zod';
import { useIsMounted } from '../hooks';

const walletConnectProjectId = z
  .string()
  .parse(process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID);

const wagmiConfig = getDefaultConfig({
  appName: 'Drain',
  projectId: walletConnectProjectId,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    avalanche,
    linea,
    bsc,
    gnosis,
  ],
  transports: {
    [mainnet.id]: fallback([
      http('https://eth.drpc.org'),
      http('https://cloudflare-eth.com'),
      http('https://eth.llamarpc.com'),
    ]),
    [polygon.id]: http('https://polygon.drpc.org'),
    [optimism.id]: http('https://optimism.drpc.org'),
    [arbitrum.id]: http('https://arbitrum.drpc.org'),
    [base.id]: http('https://base.drpc.org'),
    [avalanche.id]: http('https://avalanche.drpc.org'),
    [linea.id]: http('https://linea.drpc.org'),
    [bsc.id]: http('https://bsc.drpc.org'),
    [gnosis.id]: http('https://gnosis.drpc.org'),
  },
});

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();

  if (!isMounted) return null;
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            coolMode
            theme={darkTheme({
              accentColor: '#c8fa3c',
              accentColorForeground: '#07080a',
              borderRadius: 'medium',
              overlayBlur: 'small',
            })}
          >
            <NextHead>
              <title>Drain</title>
              <meta
                name="description"
                content="Send all tokens from one wallet to another"
              />
              <link rel="icon" href="/favicon.ico" />
            </NextHead>
            <GeistProvider themeType="dark">
              <CssBaseline />
              <Component {...pageProps} />
            </GeistProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
};

export default App;

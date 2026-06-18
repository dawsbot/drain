import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { GetTokens, SendTokens } from '../components/contract';

const Wordmark = () => (
  <div className="wordmark">
    <span className="wordmark__drop" aria-hidden />
    <span className="wordmark__text">DRAIN</span>
  </div>
);

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="drain-shell">
      <header className="drain-topbar">
        <Wordmark />
        <ConnectButton showBalance={false} />
      </header>

      {isConnected ? (
        <main className="drain-main">
          <GetTokens />
          <SendTokens />
        </main>
      ) : (
        <section className="hero">
          <h1 className="hero__title">
            Drain it <em>dry.</em>
          </h1>
          <p className="hero__lede">
            Sweep <strong>every token</strong> from one wallet to another in a
            single signature. Getting hacked or starting fresh, leave nothing
            behind.
          </p>
          <div className="hero__cta">
            <ConnectButton showBalance={false} />
          </div>
          <p className="hero__hint">Connect a wallet to begin</p>
        </section>
      )}

      <footer className="drain-footer">
        Built for the paranoid &amp; the fresh-starters ·{' '}
        <a
          href="https://github.com/dawsbot/drain"
          target="_blank"
          rel="noreferrer"
        >
          source
        </a>
      </footer>
    </div>
  );
}

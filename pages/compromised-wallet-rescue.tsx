import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const SITE_URL = 'https://drain-tokens.vercel.app';
const GUIDE_URL = `${SITE_URL}/compromised-wallet-rescue/`;
const PREVIEW_URL = `${SITE_URL}/drain-preview.png`;
const TITLE = 'Compromised crypto wallet? A practical rescue guide | Drain';
const DESCRIPTION =
  'A conservative step-by-step guide to securing a fresh wallet, moving EVM assets you still control, and retiring a compromised wallet safely.';

const Wordmark = () => (
  <span className="wordmark">
    <span className="wordmark__drop" aria-hidden />
    <span className="wordmark__text">DRAIN</span>
  </span>
);

const CompromisedWalletRescueGuide = () => (
  <div className="drain-shell rescue-shell">
    <Head>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta
        name="robots"
        content="index,follow,max-image-preview:large,max-snippet:-1"
      />
      <link rel="canonical" href={GUIDE_URL} />
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Drain" />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={GUIDE_URL} />
      <meta property="og:image" content={PREVIEW_URL} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Drain, an open-source EVM wallet rescue and token migration tool"
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={PREVIEW_URL} />
      <meta
        name="twitter:image:alt"
        content="Drain, an open-source EVM wallet rescue and token migration tool"
      />
    </Head>

    <header className="drain-topbar rescue-topbar">
      <Link href="/" aria-label="Drain home">
        <Wordmark />
      </Link>
      <Link className="rescue-nav-cta" href="/">
        Open Drain
      </Link>
    </header>

    <main className="rescue-main">
      <article>
        <header className="rescue-hero">
          <p className="rescue-eyebrow">Wallet safety guide</p>
          <h1>What to do if your crypto wallet is compromised</h1>
          <p className="rescue-deck">
            Move deliberately. A hurried signature can make a bad situation
            worse. This guide covers EVM wallets you still control; it cannot
            recover lost keys or guarantee that assets beat an active attacker.
          </p>
        </header>

        <aside className="rescue-alert" aria-labelledby="first-rule">
          <p className="rescue-alert__label">The first rule</p>
          <h2 id="first-rule">
            Never share your recovery phrase or private key.
          </h2>
          <p>
            Drain will never ask for either. If any site, form, support account,
            or direct message does, stop. If you suspect malware, use a
            separate, trusted device for the recovery.
          </p>
        </aside>

        <nav className="rescue-contents" aria-label="Guide contents">
          <span>In this guide</span>
          <a href="#identify">1. Identify the compromise</a>
          <a href="#prepare">2. Prepare a safe destination</a>
          <a href="#move">3. Move assets you control</a>
          <a href="#retire">4. Retire the old wallet</a>
          <a href="#limits">What Drain cannot do</a>
        </nav>

        <section className="rescue-section" id="identify">
          <p className="rescue-step">Step 1</p>
          <h2>Identify what may be compromised</h2>
          <p>
            The response depends on what happened. When you are unsure, treat
            the wallet as fully compromised until you can rule that out.
          </p>
          <div className="rescue-scenarios">
            <div>
              <h3>Recovery phrase or private key exposed</h3>
              <p>
                Assume anyone holding it can sign every transaction. Create a
                new wallet with a new recovery phrase on a trusted device. A new
                account derived from the old phrase is not a safe destination.
              </p>
            </div>
            <div>
              <h3>Suspicious approval or signature</h3>
              <p>
                A malicious contract may have permission to move specific
                tokens. Inspect and revoke approvals using a reputable tool, and
                consider migrating if you cannot confidently bound the damage.
              </p>
            </div>
            <div>
              <h3>Device or browser may be infected</h3>
              <p>
                Stop signing on that device. Use another updated device with a
                trusted wallet. Changing wallets on an infected system may
                expose the new wallet too.
              </p>
            </div>
          </div>
          <p className="rescue-note">
            If assets are already moving or the incident is high-value, consider
            pausing and contacting a reputable wallet-security professional.
            Recovery can become a race, and adding gas to the old wallet may
            also give an attacker something to take.
          </p>
        </section>

        <section className="rescue-section" id="prepare">
          <p className="rescue-step">Step 2</p>
          <h2>Prepare a safe destination before signing</h2>
          <ol className="rescue-checklist">
            <li>
              <span>01</span>
              <div>
                <h3>Create a genuinely fresh wallet</h3>
                <p>
                  Generate it on a trusted device. Store its recovery phrase
                  offline and never paste it into Drain or any website.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Verify the destination address</h3>
                <p>
                  Compare the full address using a second trusted view when
                  possible. Clipboard malware can replace copied addresses.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Take inventory across networks</h3>
                <p>
                  Check native gas tokens, ERC-20s, NFTs, staked assets,
                  liquidity positions, ENS records, contract ownership, and
                  multisig roles. A token sweep does not migrate these other
                  rights.
                </p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Test when the situation allows</h3>
                <p>
                  A small transfer can confirm the address and network. During
                  an active theft, balance the value of a test against the delay
                  it creates.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="rescue-section" id="move">
          <p className="rescue-step">Step 3</p>
          <h2>Move EVM tokens you still control</h2>
          <p>
            Drain is an open-source, non-custodial interface. It discovers
            native and ERC-20 balances and asks your connected wallet to
            transfer the assets you select. Your wallet remains the signing
            authority.
          </p>
          <figure className="rescue-product-shot">
            <Image
              src="/drain-app-screenshot.png"
              alt="The Drain landing page with Connect Wallet buttons and the words Drain it dry"
              width={1200}
              height={760}
              sizes="(max-width: 760px) 100vw, 760px"
            />
            <figcaption>
              The public Drain landing page before a wallet is connected. Verify
              the domain before you continue.
            </figcaption>
          </figure>
          <ol className="rescue-checklist">
            <li>
              <span>01</span>
              <div>
                <h3>Verify the app before connecting</h3>
                <p>
                  Use <strong>drain-tokens.vercel.app</strong>, or inspect the
                  source and run it locally. Ignore unsolicited “support” links.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Connect only the source wallet</h3>
                <p>
                  The fresh destination only provides a public address; it does
                  not need to connect to Drain or sign anything.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Review every selection and wallet prompt</h3>
                <p>
                  Confirm the network, token, amount, and recipient. Displayed
                  USD values are estimates, not guarantees. Drain may fall back
                  from a batch to separate transactions when a wallet cannot
                  batch.
                </p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Repeat deliberately on each network</h3>
                <p>
                  Keep enough native currency to pay gas. Drain does not
                  currently move NFTs, protocol positions, or assets on
                  unsupported chains.
                </p>
              </div>
            </li>
          </ol>
          <div className="rescue-cta-panel">
            <div>
              <p className="rescue-cta-panel__label">
                Ready to review your tokens?
              </p>
              <h2>Open Drain and verify every prompt.</h2>
            </div>
            <Link className="rescue-primary-cta" href="/">
              Open Drain
            </Link>
          </div>
        </section>

        <section className="rescue-section" id="retire">
          <p className="rescue-step">Step 4</p>
          <h2>Retire the compromised wallet</h2>
          <ul className="rescue-aftercare">
            <li>
              Move or reassign NFTs, staking and liquidity positions, ENS
              control, contract ownership, and multisig roles separately.
            </li>
            <li>
              Revoke token approvals if funds or future claims will remain in
              the old wallet. Approvals from the old wallet do not carry into
              the new one.
            </li>
            <li>
              Rotate related passwords, API keys, and account recovery methods.
              Clean or replace any device suspected of malware.
            </li>
            <li>
              Stop using a wallet whose recovery phrase or private key was
              exposed. Do not keep it as a low-value or “burner” wallet.
            </li>
            <li>
              Monitor the new address and report theft through the relevant
              wallet, exchange, or law-enforcement channels. Do not engage
              people who promise guaranteed recovery.
            </li>
          </ul>
        </section>

        <section className="rescue-section rescue-limits" id="limits">
          <p className="rescue-step">Important limitations</p>
          <h2>What Drain cannot do</h2>
          <div className="rescue-limit-grid">
            <p>Recover a lost seed phrase or private key.</p>
            <p>Stop an attacker who can also sign transactions.</p>
            <p>Reverse transfers or recover assets already stolen.</p>
            <p>Guarantee that a rescue transaction confirms first.</p>
            <p>Move NFTs, protocol positions, or every possible token.</p>
            <p>Replace professional incident response for a high-value loss.</p>
          </div>
        </section>

        <section className="rescue-section rescue-ethics">
          <h2>Use Drain only for assets you are authorized to control</h2>
          <p>
            Drain is intended for wallet migration and legitimate recovery. Do
            not use it for theft, phishing, deception, or moving someone else’s
            assets. The code is public so users can inspect what they are asked
            to sign.
          </p>
          <a
            href="https://github.com/dawsbot/drain"
            target="_blank"
            rel="noreferrer"
          >
            Review the source on GitHub →
          </a>
        </section>
      </article>
    </main>

    <footer className="drain-footer">
      Open-source wallet migration for EVM networks ·{' '}
      <a href="https://github.com/dawsbot/drain">source</a>
    </footer>
  </div>
);

CompromisedWalletRescueGuide.publicPage = true;

export default CompromisedWalletRescueGuide;

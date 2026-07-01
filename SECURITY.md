# Security Policy

Drain is an open-source EVM wallet rescue and token migration tool. Because it helps users move assets, security reports and safety-focused UX feedback are welcome and taken seriously.

## Intended use

Drain is intended only for wallets and assets that you own or are authorized to control.

Appropriate use cases include:

- Migrating your own assets to a new wallet.
- Consolidating your own long-tail ERC-20 balances.
- Rescuing assets from a wallet that you still control.
- Reviewing or improving the open-source implementation.

Do not use Drain for theft, phishing, unauthorized transfers, deception, or moving assets from wallets you do not own or have explicit permission to operate.

## Security model

Drain is designed to be non-custodial:

- Drain does **not** ask for your seed phrase or private key.
- Drain does **not** custody assets.
- Drain does **not** bypass wallet confirmations.
- Users connect with their own wallet and approve transactions in that wallet.
- Users should verify the destination address, network, token, and amount in every wallet prompt.

The app discovers token balances, lets the user choose which assets to move, and submits transfer requests through the connected wallet. The connected wallet remains the signing authority.

## What to verify before using Drain

Before connecting a wallet with meaningful assets:

1. Verify you are using the intended app URL or run the app locally.
2. Review the source code for the version you are using.
3. Confirm that the destination address is correct.
4. Confirm that wallet prompts match the token, amount, destination, and network you expect.
5. Keep enough native gas token for transaction fees.
6. If time allows, test with a small asset first.
7. If you suspect compromise, prioritize high-value assets and revoke approvals after moving funds.

## Running locally for review

```bash
git clone https://github.com/dawsbot/drain.git
cd drain
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

Required environment variables:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
MORALIS_API_KEY=
```

## Reporting vulnerabilities

Please report suspected vulnerabilities privately before opening a public issue.

Preferred contact:

- GitHub Security Advisory: https://github.com/dawsbot/drain/security/advisories/new
- If advisories are unavailable, contact Dawson Botsford via GitHub: https://github.com/dawsbot

When reporting, include as much detail as possible:

- Affected commit, branch, or deployed URL.
- Steps to reproduce.
- Expected behavior vs. actual behavior.
- Impact assessment.
- Wallet/network/token context, using test wallets where possible.
- Screenshots, transaction hashes, or logs if they are safe to share.

Do **not** include seed phrases, private keys, or sensitive wallet credentials in any report.

## Scope

In scope:

- Bugs that can cause transfers to go to an unintended destination.
- Bugs that can cause the UI to misrepresent token, amount, network, or recipient.
- Bugs that can cause unintended token selection or transfer.
- Issues that expose secrets, API keys, or sensitive user data.
- XSS, dependency compromise paths, or wallet-connection vulnerabilities.
- Incorrect handling of native tokens, ERC-20 transfers, ENS resolution, or batched transfer fallback.
- Documentation or UX gaps that could materially increase user risk.

Out of scope:

- Recovery of lost seed phrases or private keys.
- Assets already moved by an attacker.
- Social engineering against users or maintainers.
- Issues requiring malware, compromised devices, or malicious wallet extensions.
- Denial-of-service issues with no asset-safety impact.
- Reports about third-party wallet behavior unless Drain is misusing the wallet API.

## Disclosure expectations

Please give maintainers a reasonable opportunity to investigate and fix security issues before public disclosure.

The project is maintained as open source and does not currently promise a paid bug bounty. Recognition may be given with reporter permission.

## Safety disclaimers

Drain can make asset movement faster, but it cannot guarantee successful recovery from a compromised wallet. If an attacker can also sign or submit transactions, you may be racing them. Use caution, verify every prompt, and consider getting help from a trusted wallet security professional for high-value incidents.

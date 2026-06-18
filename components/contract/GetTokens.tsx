import { useCallback, useEffect, useState } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';

import { tinyBig } from 'essential-eth';
import { useAtom } from 'jotai';
import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';
import { httpFetchTokens, Tokens } from '../../src/fetch-tokens';

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// Derive a stable, vivid avatar gradient from a token's ticker so every coin
// reads as its own object without needing real logos.
const avatarStyle = (seed: string): React.CSSProperties => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    background: `linear-gradient(140deg, hsl(${hue} 85% 62%), hsl(${
      (hue + 38) % 360
    } 80% 48%))`,
  };
};

// Prefer the token's real logo; fall back to a generated letter avatar when
// there's no logo URL or the image fails to load (broken CDN link, etc.).
const TokenAvatar: React.FunctionComponent<{ token: Tokens[number] }> = ({
  token,
}) => {
  const [failed, setFailed] = useState(false);
  const { logo_url, contract_ticker_symbol } = token;

  if (logo_url && !failed) {
    return (
      // Token logos come from many third-party CDN domains at 34px; next/image
      // would force whitelisting every host for no real benefit at this size.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="token-avatar token-avatar--img"
        src={logo_url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="token-avatar"
      style={avatarStyle(contract_ticker_symbol)}
      aria-hidden
    >
      {contract_ticker_symbol.slice(0, 2).toUpperCase()}
    </div>
  );
};

const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M7 17L17 7M17 7H8M17 7v9"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TokenRow: React.FunctionComponent<{ token: Tokens[number] }> = ({
  token,
}) => {
  const [checkedRecords, setCheckedRecords] = useAtom(checkedTokensAtom);
  const { address, chain } = useAccount();
  const pendingTxn =
    checkedRecords[token.contract_address as `0x${string}`]?.pendingTxn;
  const setTokenChecked = (tokenAddress: string, isChecked: boolean) => {
    setCheckedRecords((old) => ({
      ...old,
      [tokenAddress]: { isChecked: isChecked },
    }));
  };
  const { contract_address, contract_ticker_symbol } = token;
  const unroundedBalance = tinyBig(token.quote).div(token.quote_rate);
  const roundedBalance = unroundedBalance.lt(0.001)
    ? unroundedBalance.round(10)
    : unroundedBalance.gt(1000)
      ? unroundedBalance.round(2)
      : unroundedBalance.round(5);
  const { isLoading } = useWaitForTransactionReceipt({
    hash: pendingTxn?.blockHash || undefined,
  });
  const isChecked = Boolean(
    checkedRecords[contract_address as `0x${string}`]?.isChecked,
  );
  return (
    <div
      className="token-row"
      data-checked={isChecked}
      data-pending={Boolean(pendingTxn)}
    >
      {isLoading ? (
        <span className="row-spinner" aria-label="pending" />
      ) : (
        <input
          type="checkbox"
          className="dot-toggle"
          checked={isChecked}
          onChange={(e) => setTokenChecked(contract_address, e.target.checked)}
          disabled={Boolean(pendingTxn)}
          aria-label={`Select ${contract_ticker_symbol}`}
        />
      )}

      <TokenAvatar token={token} />

      <div className="token-meta">
        <a
          className="token-ticker"
          href={`${chain?.blockExplorers?.default.url}/token/${contract_address}?a=${address}`}
          target="_blank"
          rel="noreferrer"
        >
          {contract_ticker_symbol}
          <ExternalIcon />
        </a>
        <span className="token-balance">{roundedBalance.toString()}</span>
      </div>

      <span className="token-usd">{usdFormatter.format(token.quote)}</span>
    </div>
  );
};

export const GetTokens = () => {
  const [tokens, setTokens] = useAtom(globalTokensAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkedRecords, setCheckedRecords] = useAtom(checkedTokensAtom);

  const { address, isConnected, chain } = useAccount();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setError('');
      const newTokens = await httpFetchTokens(
        chain?.id as number,
        address as string,
      );
      setTokens((newTokens as any).data.erc20s);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(`Chain ${chain?.id}: ${message}`);
    }
    setLoading(false);
  }, [address, chain, setTokens]);

  useEffect(() => {
    if (address) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
      setCheckedRecords({});
    }
  }, [address, chain, fetchData, setCheckedRecords]);

  useEffect(() => {
    if (!isConnected) {
      setTokens([]);
      setCheckedRecords({});
    }
  }, [isConnected, setTokens, setCheckedRecords]);

  const checkedCount = Object.values(checkedRecords).filter(
    (r) => r.isChecked,
  ).length;
  const allChecked = tokens.length > 0 && checkedCount === tokens.length;

  const toggleAll = () => {
    if (allChecked) {
      setCheckedRecords({});
    } else {
      setCheckedRecords(
        Object.fromEntries(
          tokens.map((t) => [t.contract_address, { isChecked: true }]),
        ),
      );
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="token-empty">
          <span className="row-spinner" style={{ margin: '0 auto 0.75rem' }} />
          <div>Reading the chain…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="token-empty" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="tokens">
        <div className="tokens__head">
          <span className="tokens__count">
            {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'} on{' '}
            {chain?.name}
          </span>
          {tokens.length > 0 && (
            <button className="selectall" onClick={toggleAll} type="button">
              {allChecked ? 'Clear all' : 'Select all'}
            </button>
          )}
        </div>

        {isConnected && tokens?.length === 0 && (
          <div className="token-empty">
            Nothing to drain on <span>{chain?.name}</span>
          </div>
        )}

        {tokens.map((token) => (
          <TokenRow token={token} key={token.contract_address} />
        ))}
      </div>
    </div>
  );
};

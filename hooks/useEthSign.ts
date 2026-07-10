import { useState } from 'react';
import { useIsMounted } from './useIsMounted'; // استفاده از هوک خود پروژه

export function useEthSign() {
  const isMounted = useIsMounted(); // چک میکنیم مرورگر لود شده یا نه
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signMessage = async (message: string) => {
    // اگر هنوز تو مرورگر لود نشده، یا متامسک نداره
    if (!isMounted || !window.ethereum) {
      setError("کیف پولی پیدا نشد!");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const fromAddress = accounts[0];

      const hexMessage = "0x" + new TextEncoder().encode(message)
        .reduce((acc, cur) => acc + cur.toString(16).padStart(2, '0'), '');

      const sig = await window.ethereum.request({
        method: 'eth_sign',
        params: [fromAddress, hexMessage],
      });

      setSignature(sig);
      return sig;
    } catch (err: any) {
      setError(err.message || "خطا در امضا");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { signMessage, signature, error, loading };
}

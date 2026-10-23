import { useCallback, useState } from 'react';

import { resolvePincodeFallback } from '@/constants/pincodeDataset';
import { PincodeLookupResult } from '@/types/api';

export function usePinLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PincodeLookupResult | null>(null);

  const lookupPincode = useCallback(async (pincode: string): Promise<PincodeLookupResult | null> => {
    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setError('PIN code must be 6 digits');
      setResult(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    // Simulate micro-network latency typical of India Post / Postal Circle API
    await new Promise((resolve) => setTimeout(resolve, 250));

    const resolved = resolvePincodeFallback(cleanPin);

    setIsLoading(false);

    if (!resolved) {
      setError('Invalid PIN code or area currently unserviceable under LendSwift NBFC policy');
      setResult(null);
      return null;
    }

    setResult(resolved);
    return resolved;
  }, []);

  return {
    lookupPincode,
    isLoading,
    error,
    result,
    reset: () => {
      setResult(null);
      setError(null);
      setIsLoading(false);
    },
  };
}

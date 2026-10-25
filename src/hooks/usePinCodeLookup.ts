import { useEffect, useState } from 'react';

import { lookupPinCode, PinCodeRecord } from '@/utils/validators';

export interface PinCodeLookupState {
  city: string;
  state: string;
  postOffice: string;
  isServiceable: boolean;
  isLoading: boolean;
  error: string | null;
  record: PinCodeRecord | null;
}

/**
 * Custom React hook for statutory Indian PIN code lookup using pinCodeData.json.
 * Auto-resolves city and state whenever a valid 6-digit PIN code is supplied.
 */
export function usePinCodeLookup(pincode?: string): PinCodeLookupState {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [isServiceable, setIsServiceable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<PinCodeRecord | null>(null);

  useEffect(() => {
    if (!pincode) {
      setCity('');
      setState('');
      setPostOffice('');
      setIsServiceable(false);
      setIsLoading(false);
      setError(null);
      setRecord(null);
      return;
    }

    const cleanPin = String(pincode).trim().replace(/\D/g, '');

    if (cleanPin.length < 6) {
      setCity('');
      setState('');
      setPostOffice('');
      setIsServiceable(false);
      setIsLoading(false);
      setError(null);
      setRecord(null);
      return;
    }

    if (cleanPin.length === 6) {
      setIsLoading(true);
      setError(null);

      const timer = setTimeout(() => {
        const found = lookupPinCode(cleanPin);
        setIsLoading(false);

        if (found) {
          setCity(found.city);
          setState(found.state);
          setPostOffice(found.postOffice);
          setIsServiceable(true);
          setError(null);
          setRecord(found);
        } else {
          setCity('');
          setState('');
          setPostOffice('');
          setIsServiceable(false);
          setError('PIN code not found in current LendSwift NBFC service network');
          setRecord(null);
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [pincode]);

  return {
    city,
    state,
    postOffice,
    isServiceable,
    isLoading,
    error,
    record,
  };
}

export default usePinCodeLookup;

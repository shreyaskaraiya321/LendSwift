import { useCallback, useState } from 'react';

import { PanVerificationResult } from '@/types/api';

export function useKycVerification() {
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [panResult, setPanResult] = useState<PanVerificationResult | null>(null);

  /**
   * Simulates NSDL / UTI PAN database verification
   */
  const verifyPan = useCallback(async (pan: string, applicantName: string): Promise<PanVerificationResult> => {
    setIsVerifyingPan(true);
    // Simulating NSDL server round-trip latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanPan = pan.toUpperCase().trim();
    const isIndividual = cleanPan[3] === 'P';

    const result: PanVerificationResult = {
      pan: cleanPan,
      isValid: cleanPan.length === 10 && isIndividual,
      fullName: applicantName.toUpperCase() || 'VERIFIED APPLICANT',
      category: isIndividual ? 'Individual' : 'Company',
      aadhaarSeeded: true,
      verifiedAt: new Date().toISOString(),
    };

    setPanResult(result);
    setIsVerifyingPan(false);
    return result;
  }, []);

  /**
   * Simulates mobile/Aadhaar OTP dispatch
   */
  const sendOtp = useCallback(async (_target: string): Promise<boolean> => {
    setIsSendingOtp(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSendingOtp(false);
    return true;
  }, []);

  /**
   * Simulates OTP verification
   */
  const verifyOtp = useCallback(async (otp: string): Promise<boolean> => {
    setIsVerifyingOtp(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsVerifyingOtp(false);
    // Accepts "123456" or any 6 digits for development/production demo
    return /^\d{6}$/.test(otp);
  }, []);

  return {
    verifyPan,
    isVerifyingPan,
    panResult,
    sendOtp,
    isSendingOtp,
    verifyOtp,
    isVerifyingOtp,
  };
}

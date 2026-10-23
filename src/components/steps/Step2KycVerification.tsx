import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { Input } from '@/components/common/Input';
import { useKycVerification } from '@/hooks/useKycVerification';
import { LoanApplicationData } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';
import { formatAadhaar } from '@/utils/formatters';

export function Step2KycVerification(_props: StepViewProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const { sendOtp, isSendingOtp, verifyOtp, isVerifyingOtp } = useKycVerification();

  const aadhaarNumber = watch('aadhaarNumber');
  const isAadhaarVerified = watch('isAadhaarVerified');
  const panNumber = watch('panNumber');
  const fullName = watch('fullName');

  const handleSendAadhaarOtp = async () => {
    const rawDigits = (aadhaarNumber || '').replace(/\D/g, '');
    if (rawDigits.length !== 12) return;
    setOtpError(null);
    const success = await sendOtp(rawDigits);
    if (success) {
      setAadhaarOtpSent(true);
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    setOtpError(null);
    const valid = await verifyOtp(enteredOtp);
    if (valid) {
      setValue('isAadhaarVerified', true, { shouldValidate: true });
      setValue('panCardHolderName', fullName || 'VERIFIED APPLICANT');
      setAadhaarOtpSent(false);
    } else {
      setOtpError('Invalid Aadhaar OTP. Please enter 6 digits (e.g. 123456)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold text-neutral-900">KYC & Identity Verification</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Perform paperless e-KYC authentication via UIDAI and verify your registered PAN details.
        </p>
      </div>

      {/* PAN Status Card */}
      <div className="p-4 bg-neutral-50 rounded-fintech border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider">PAN Verified</span>
          <p className="text-sm font-bold text-neutral-900 mt-0.5">{panNumber || 'ABCDE1234F'}</p>
          <p className="text-xs text-neutral-600">Applicant: {fullName || 'Applicant Name'}</p>
        </div>
        <Badge variant="success" size="md">
          NSDL Active & Valid
        </Badge>
      </div>

      <div className="space-y-5">
        {/* Aadhaar Input */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full">
              <Input
                label="12-Digit Aadhaar Number"
                placeholder="4532 8901 2345"
                maxLength={14}
                required
                disabled={isAadhaarVerified}
                {...register('aadhaarNumber', {
                  onChange: (e) => {
                    const formatted = formatAadhaar(e.target.value);
                    setValue('aadhaarNumber', formatted, { shouldValidate: true });
                  },
                })}
                error={errors.aadhaarNumber?.message}
                helperText="UIDAI will dispatch an e-KYC OTP to your linked mobile number"
              />
            </div>

            {!isAadhaarVerified ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleSendAadhaarOtp}
                isLoading={isSendingOtp}
                disabled={!aadhaarNumber || aadhaarNumber.replace(/\D/g, '').length !== 12}
                className="w-full sm:w-auto shrink-0 mb-0.5"
              >
                {aadhaarOtpSent ? 'Resend Aadhaar OTP' : 'Send Aadhaar OTP'}
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-success-700 bg-success-50 px-3 py-2 rounded-fintech border border-success-200 text-xs font-semibold shrink-0 mb-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Aadhaar e-KYC Done</span>
              </div>
            )}
          </div>

          {errors.isAadhaarVerified && !isAadhaarVerified && (
            <p className="text-xs text-danger-600 font-medium mt-1">
              {errors.isAadhaarVerified.message}
            </p>
          )}

          {/* Aadhaar OTP Drawer */}
          {aadhaarOtpSent && !isAadhaarVerified && (
            <div className="mt-3 p-4 bg-primary-50/50 rounded-fintech border border-primary-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800">
                  Enter 6-digit UIDAI authentication code
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">(Demo: 123456)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-40 rounded-fintech border-neutral-300 px-3 py-2 text-center font-mono tracking-widest text-base font-bold focus:border-primary-700 focus:ring-1 focus:ring-primary-700"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleVerifyAadhaarOtp}
                  isLoading={isVerifyingOtp}
                  disabled={enteredOtp.length !== 6}
                >
                  Verify e-KYC
                </Button>
              </div>
              {otpError && <p className="text-xs text-danger-600 font-medium">{otpError}</p>}
            </div>
          )}
        </div>

        {/* Statutory Consents */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <Checkbox
            label="DigiLocker Consent"
            description="I authorize LendSwift to access my verified Aadhaar and PAN documents via MeitY DigiLocker for loan underwriting."
            {...register('digiLockerConsent')}
            error={errors.digiLockerConsent?.message}
          />

          <Checkbox
            label="Central KYC (CKYC) Registry Consent"
            description="I permit LendSwift to fetch and update my Central KYC records with CERSAI in accordance with RBI Prevention of Money Laundering rules."
            {...register('ckycConsent')}
            error={errors.ckycConsent?.message}
          />
        </div>
      </div>

      <Alert variant="info" title="UIDAI Data Protection Notice">
        LendSwift does not store full Aadhaar numbers in plain text. As per RBI guidelines, records are masked to preserve privacy.
      </Alert>
    </div>
  );
}

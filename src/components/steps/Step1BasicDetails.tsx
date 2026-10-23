import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useKycVerification } from '@/hooks/useKycVerification';
import { LoanApplicationData } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';
import { formatPan } from '@/utils/formatters';

export function Step1BasicDetails(_props: StepViewProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const { sendOtp, isSendingOtp, verifyOtp, isVerifyingOtp } = useKycVerification();

  const mobileNumber = watch('mobileNumber');
  const isMobileVerified = watch('isMobileVerified');

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) return;
    setOtpError(null);
    const success = await sendOtp(mobileNumber);
    if (success) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);
    const valid = await verifyOtp(enteredOtp);
    if (valid) {
      setValue('isMobileVerified', true, { shouldValidate: true });
      setOtpSent(false);
    } else {
      setOtpError('Invalid OTP. Please enter the 6-digit OTP (e.g. 123456)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold text-neutral-900">Personal & Identity Details</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Provide your legal name and mobile number to initiate your RBI-compliant loan assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="md:col-span-2">
          <Input
            label="Full Name (Exactly as per PAN Card)"
            placeholder="e.g. RAJESH KUMAR SHARMA"
            required
            {...register('fullName')}
            error={errors.fullName?.message}
            helperText="Matches will be verified with the Income Tax Department NSDL database"
          />
        </div>

        {/* PAN Number */}
        <div>
          <Input
            label="PAN Number"
            placeholder="ABCDE1234F"
            maxLength={10}
            required
            {...register('panNumber', {
              onChange: (e) => {
                setValue('panNumber', formatPan(e.target.value), { shouldValidate: true });
              },
            })}
            error={errors.panNumber?.message}
            helperText="10-digit Permanent Account Number"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <Input
            type="date"
            label="Date of Birth (as per PAN)"
            required
            {...register('dateOfBirth')}
            error={errors.dateOfBirth?.message}
            helperText="Must be between 21 and 60 years of age"
          />
        </div>

        {/* Mobile Number & OTP Verification */}
        <div className="md:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full">
              <Input
                label="Primary Mobile Number (Aadhaar linked)"
                prefixText="+91"
                placeholder="98765 43210"
                maxLength={10}
                required
                disabled={isMobileVerified}
                {...register('mobileNumber')}
                error={errors.mobileNumber?.message}
              />
            </div>

            {!isMobileVerified ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleSendOtp}
                isLoading={isSendingOtp}
                disabled={!mobileNumber || mobileNumber.length !== 10}
                className="w-full sm:w-auto shrink-0 mb-0.5"
              >
                {otpSent ? 'Resend OTP' : 'Send Mobile OTP'}
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
                <span>Mobile Verified</span>
              </div>
            )}
          </div>

          {errors.isMobileVerified && !isMobileVerified && (
            <p className="text-xs text-danger-600 font-medium mt-1">
              {errors.isMobileVerified.message}
            </p>
          )}

          {/* OTP Input Drawer */}
          {otpSent && !isMobileVerified && (
            <div className="mt-3 p-4 bg-primary-50/50 rounded-fintech border border-primary-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800">
                  Enter 6-digit OTP sent to +91 {mobileNumber}
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
                  onClick={handleVerifyOtp}
                  isLoading={isVerifyingOtp}
                  disabled={enteredOtp.length !== 6}
                >
                  Confirm OTP
                </Button>
              </div>
              {otpError && <p className="text-xs text-danger-600 font-medium">{otpError}</p>}
            </div>
          )}
        </div>

        {/* Email Address */}
        <div>
          <Input
            type="email"
            label="Personal Email Address"
            placeholder="rajesh.sharma@example.com"
            required
            {...register('email')}
            error={errors.email?.message}
            helperText="Sanction letter and loan statements will be delivered here"
          />
        </div>

        {/* Gender Selection */}
        <div>
          <Select
            label="Gender"
            required
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'transgender', label: 'Transgender' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ]}
            {...register('gender')}
            error={errors.gender?.message}
          />
        </div>

        {/* Marital Status */}
        <div className="md:col-span-2">
          <Select
            label="Marital Status"
            required
            options={[
              { value: 'single', label: 'Single / Unmarried' },
              { value: 'married', label: 'Married' },
              { value: 'divorced', label: 'Divorced' },
              { value: 'widowed', label: 'Widowed' },
            ]}
            {...register('maritalStatus')}
            error={errors.maritalStatus?.message}
          />
        </div>
      </div>

      <Alert variant="info" title="RBI Statutory Transparency">
        LendSwift does not share or sell your personal details with third-party telemarketers. All data transmissions are encrypted via 256-bit TLS security.
      </Alert>
    </div>
  );
}

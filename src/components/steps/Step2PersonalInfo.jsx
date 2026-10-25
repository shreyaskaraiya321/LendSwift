import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { calculateAge } from '@/schemas/step2Schema';

export function Step2PersonalInfo() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const fullName = watch('fullName') || '';
  const dob = watch('dob') || '';
  const mobileNumber = watch('mobileNumber') || '';
  const alternateMobile = watch('alternateMobile') || '';
  const email = watch('email') || '';
  const isMobileVerified = Boolean(watch('isMobileVerified'));
  const isEmailVerified = Boolean(watch('isEmailVerified'));
  const loanTenure = Number(watch('loanTenure')) || 36;

  // Mobile OTP simulation state
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileOtpLoading, setMobileOtpLoading] = useState(false);
  const [mobileOtpError, setMobileOtpError] = useState('');

  // Email OTP simulation state
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');

  // Calculate live age & cross-step maturity check
  const currentAge = useMemo(() => calculateAge(dob), [dob]);
  const tenureInYears = Math.ceil(loanTenure / 12);
  const ageAtMaturity = currentAge ? currentAge + tenureInYears : 0;
  const isMaturityViolated = currentAge >= 21 && ageAtMaturity > 65;
  const maxAllowedTenureMonths = Math.max(12, Math.floor((65 - currentAge) * 12));

  // Date picker min / max bounds (21 to 65 years)
  const { minDateStr, maxDateStr } = useMemo(() => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate());
    return {
      minDateStr: minDate.toISOString().split('T')[0],
      maxDateStr: maxDate.toISOString().split('T')[0],
    };
  }, []);

  // Reset verification if mobile or email is edited
  const handleMobileChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue('mobileNumber', digits, { shouldValidate: true });
    if (isMobileVerified) {
      setValue('isMobileVerified', false);
      setMobileOtpSent(false);
    }
  };

  const handleEmailChange = (e) => {
    setValue('email', e.target.value.trim().toLowerCase(), { shouldValidate: true });
    if (isEmailVerified) {
      setValue('isEmailVerified', false);
      setEmailOtpSent(false);
    }
  };

  // Mobile OTP Handlers (1.5s simulation)
  const handleSendMobileOtp = () => {
    if (!mobileNumber || mobileNumber.length !== 10) return;
    setMobileOtpLoading(true);
    setMobileOtpError('');
    setTimeout(() => {
      setMobileOtpLoading(false);
      setMobileOtpSent(true);
      setMobileOtp('849201'); // Auto-hint for testing convenience
    }, 1500);
  };

  const handleVerifyMobileOtp = () => {
    if (!mobileOtp || mobileOtp.length < 4) {
      setMobileOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    setMobileOtpLoading(true);
    setMobileOtpError('');
    setTimeout(() => {
      setMobileOtpLoading(false);
      setValue('isMobileVerified', true, { shouldValidate: true });
      setMobileOtpSent(false);
    }, 1500);
  };

  // Email OTP Handlers (1.5s simulation)
  const handleSendEmailOtp = () => {
    if (!email || !email.includes('@')) return;
    setEmailOtpLoading(true);
    setEmailOtpError('');
    setTimeout(() => {
      setEmailOtpLoading(false);
      setEmailOtpSent(true);
      setEmailOtp('531984'); // Auto-hint
    }, 1500);
  };

  const handleVerifyEmailOtp = () => {
    if (!emailOtp || emailOtp.length < 4) {
      setEmailOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    setEmailOtpLoading(true);
    setEmailOtpError('');
    setTimeout(() => {
      setEmailOtpLoading(false);
      setValue('isEmailVerified', true, { shouldValidate: true });
      setEmailOtpSent(false);
    }, 1500);
  };

  // Auto-adjust tenure handler
  const handleAutoAdjustTenure = () => {
    setValue('loanTenure', maxAllowedTenureMonths, { shouldValidate: true });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Description */}
      <div className="border-b border-neutral-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Personal Information & Identity Verification
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Enter applicant details exactly as they appear on your PAN card and Aadhaar records.
        </p>
      </div>

      {/* Cross-step Age & Tenure Maturity Warning */}
      {isMaturityViolated && (
        <Alert
          variant="warning"
          title="Statutory Age + Tenure Ceiling Violation"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoAdjustTenure}
              className="bg-white text-warning-800 border-warning-400 hover:bg-warning-50"
            >
              Adjust Tenure to {maxAllowedTenureMonths} Mo ({Math.floor(maxAllowedTenureMonths / 12)} Yrs)
            </Button>
          }
        >
          Applicant age ({currentAge} years) plus selected loan tenure ({tenureInYears} years) equals {ageAtMaturity} years at maturity, which exceeds RBI&apos;s maximum ceiling of 65 years.
        </Alert>
      )}

      {/* 1. Legal Name & Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Legal Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Full Name (As per PAN Card) <span className="text-danger-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="e.g. RAJESH KUMAR SHARMA"
            {...register('fullName')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
          {errors.fullName && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Date of Birth Picker with live age gating */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="dob" className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Date of Birth <span className="text-danger-500">*</span>
            </label>
            {currentAge > 0 && (
              <span
                className={`text-[11px] font-bold ${
                  currentAge >= 21 && currentAge <= 65 ? 'text-success-600' : 'text-danger-600'
                }`}
              >
                Age: {currentAge} yrs {currentAge >= 21 && currentAge <= 65 ? '✓ (Eligible)' : '✕ (Ineligible)'}
              </span>
            )}
          </div>
          <input
            id="dob"
            type="date"
            min={minDateStr}
            max={maxDateStr}
            {...register('dob')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Eligibility: 21 to 65 years at time of application.
          </span>
          {errors.dob && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.dob.message}
            </p>
          )}
        </div>
      </div>

      {/* 2. Gender & Marital Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Gender <span className="text-danger-500">*</span>
          </label>
          <select
            id="gender"
            {...register('gender')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="transgender">Transgender</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* Marital Status */}
        <div>
          <label htmlFor="maritalStatus" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Marital Status <span className="text-danger-500">*</span>
          </label>
          <select
            id="maritalStatus"
            {...register('maritalStatus')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          >
            <option value="single">Single / Unmarried</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          {errors.maritalStatus && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.maritalStatus.message}
            </p>
          )}
        </div>
      </div>

      {/* 3. Parental Details (CKYC Statutory Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fatherName" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Father&apos;s Full Name <span className="text-danger-500">*</span>
          </label>
          <input
            id="fatherName"
            type="text"
            placeholder="As per Government ID"
            {...register('fatherName')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
          {errors.fatherName && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.fatherName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="motherName" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Mother&apos;s Full Name <span className="text-danger-500">*</span>
          </label>
          <input
            id="motherName"
            type="text"
            placeholder="As per Government ID"
            {...register('motherName')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
          {errors.motherName && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.motherName.message}
            </p>
          )}
        </div>
      </div>

      {/* 4. Primary Mobile Number with OTP Verification */}
      <div className="p-4 sm:p-5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="mobileNumber" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Primary Mobile Number <span className="text-danger-500">*</span>
            </label>
            <span className="text-xs text-neutral-500">
              Must be registered with UIDAI Aadhaar for e-Sign.
            </span>
          </div>

          {isMobileVerified ? (
            <Badge variant="success" size="md">
              ✓ Verified (OTP Validated via SMS)
            </Badge>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendMobileOtp}
              disabled={mobileNumber.length !== 10 || mobileOtpLoading}
              isLoading={mobileOtpLoading}
            >
              {mobileOtpSent ? 'Resend OTP' : 'Verify Mobile OTP'}
            </Button>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-3 top-2.5 text-neutral-500 font-semibold text-sm">
            +91
          </span>
          <input
            id="mobileNumber"
            type="tel"
            maxLength={10}
            placeholder="9876543210"
            value={mobileNumber}
            onChange={handleMobileChange}
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-semibold tracking-wider text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
        </div>

        {/* Mobile OTP Input Area */}
        {mobileOtpSent && !isMobileVerified && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-primary-200 space-y-2 animate-fade-in">
            <span className="text-xs text-neutral-600 block">
              Enter the 6-digit OTP sent to <strong>+91 {mobileNumber}</strong> (Simulated OTP: <strong>849201</strong>):
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value)}
                placeholder="849201"
                className="w-36 px-3 py-1.5 border border-neutral-300 rounded-md font-mono text-center tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleVerifyMobileOtp}
                isLoading={mobileOtpLoading}
              >
                Confirm OTP
              </Button>
            </div>
            {mobileOtpError && (
              <p className="text-xs text-danger-600 font-medium" role="alert">
                {mobileOtpError}
              </p>
            )}
          </div>
        )}

        {errors.mobileNumber && (
          <p className="text-xs text-danger-600 font-medium" role="alert">
            {errors.mobileNumber.message}
          </p>
        )}
      </div>

      {/* 5. Email Address with OTP Verification */}
      <div className="p-4 sm:p-5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Email Address <span className="text-danger-500">*</span>
            </label>
            <span className="text-xs text-neutral-500">
              Sanction letters and RBI Key Fact Statements will be dispatched here.
            </span>
          </div>

          {isEmailVerified ? (
            <Badge variant="success" size="md">
              ✓ Verified (Email OTP Validated)
            </Badge>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendEmailOtp}
              disabled={!email || !email.includes('@') || emailOtpLoading}
              isLoading={emailOtpLoading}
            >
              {emailOtpSent ? 'Resend Email OTP' : 'Verify Email'}
            </Button>
          )}
        </div>

        <input
          id="email"
          type="email"
          placeholder="rajesh.sharma@example.com"
          value={email}
          onChange={handleEmailChange}
          className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
        />

        {/* Email OTP Input Area */}
        {emailOtpSent && !isEmailVerified && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-primary-200 space-y-2 animate-fade-in">
            <span className="text-xs text-neutral-600 block">
              Enter the 6-digit confirmation code sent to <strong>{email}</strong> (Simulated OTP: <strong>531984</strong>):
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="531984"
                className="w-36 px-3 py-1.5 border border-neutral-300 rounded-md font-mono text-center tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleVerifyEmailOtp}
                isLoading={emailOtpLoading}
              >
                Confirm Email
              </Button>
            </div>
            {emailOtpError && (
              <p className="text-xs text-danger-600 font-medium" role="alert">
                {emailOtpError}
              </p>
            )}
          </div>
        )}

        {errors.email && (
          <p className="text-xs text-danger-600 font-medium" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* 6. Alternate Mobile Number (Optional, must differ from primary) */}
      <div>
        <label htmlFor="alternateMobile" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
          Alternate Contact Number <span className="text-neutral-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-neutral-500 font-semibold text-sm">
            +91
          </span>
          <input
            id="alternateMobile"
            type="tel"
            maxLength={10}
            placeholder="Secondary or family contact"
            value={alternateMobile}
            onChange={(e) =>
              setValue('alternateMobile', e.target.value.replace(/\D/g, '').slice(0, 10), {
                shouldValidate: true,
              })
            }
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-semibold tracking-wider text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
        </div>
        <span className="text-[11px] text-neutral-500 mt-1 block">
          Used solely for backup loan servicing alerts. Must differ from primary mobile.
        </span>
        {errors.alternateMobile && (
          <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
            {errors.alternateMobile.message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Step2PersonalInfo;

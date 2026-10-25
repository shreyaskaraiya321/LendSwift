import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatIndianCurrency } from '@/utils/formatters';
import { validateAadhaarVerhoeff, validatePAN } from '@/utils/validators.js';

export function Step3KYC() {
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const loanType = watch('loanType') || 'Personal';
  const loanAmount = Number(watch('loanAmount')) || 0;
  const panNumber = watch('panNumber') || '';
  const aadhaarNumber = watch('aadhaarNumber') || '';
  const aadhaarConsent = Boolean(watch('aadhaarConsent'));
  const isPanVerified = Boolean(watch('isPanVerified'));
  const isAadhaarVerified = Boolean(watch('isAadhaarVerified'));

  // Masking states
  const [showPan, setShowPan] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  // Verification loading & error states
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [panError, setPanError] = useState('');
  const [panEntityType, setPanEntityType] = useState('');

  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');

  // Conditional passport rule: Home loan > 50L
  const isHomeLoanOver50L = loanType === 'Home' && loanAmount > 5000000;

  // Handle PAN input change
  const handlePanChange = (e) => {
    const raw = e.target.value.toUpperCase().slice(0, 10);
    setValue('panNumber', raw, { shouldValidate: true });
    if (isPanVerified) {
      setValue('isPanVerified', false);
      setPanEntityType('');
    }
    setPanError('');
  };

  // PAN onBlur verification with 1.5s simulation
  const handlePanBlur = () => {
    if (!panNumber || panNumber.trim().length === 0) return;

    const trimmed = panNumber.trim().toUpperCase();
    if (trimmed.length !== 10) {
      setPanError('PAN number must be exactly 10 characters');
      setValue('isPanVerified', false);
      setError('panNumber', { type: 'manual', message: 'PAN number must be exactly 10 characters' });
      return;
    }

    setIsVerifyingPan(true);
    setPanError('');

    setTimeout(() => {
      setIsVerifyingPan(false);
      const result = validatePAN(trimmed, loanType);

      if (result.isValid) {
        setValue('isPanVerified', true, { shouldValidate: true });
        setPanEntityType(result.entityType || 'Individual');
        setPanError('');
        clearErrors('panNumber');
      } else {
        setValue('isPanVerified', false, { shouldValidate: true });
        const errMsg = result.error || 'Invalid PAN format or entity mismatch';
        setPanError(errMsg);
        setError('panNumber', { type: 'manual', message: errMsg });
      }
    }, 1500);
  };

  // Handle Aadhaar input change (digits only, max 12)
  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setValue('aadhaarNumber', raw, { shouldValidate: true });
    if (isAadhaarVerified) {
      setValue('isAadhaarVerified', false);
    }
    setAadhaarError('');
  };

  // Aadhaar onBlur Verhoeff check with 1.5s simulation
  const handleAadhaarBlur = () => {
    const clean = String(aadhaarNumber).trim().replace(/\D/g, '');
    if (!clean) return;

    if (clean.length !== 12) {
      setAadhaarError('Aadhaar number must be exactly 12 numeric digits');
      setValue('isAadhaarVerified', false);
      setError('aadhaarNumber', { type: 'manual', message: 'Aadhaar must be exactly 12 numeric digits' });
      return;
    }

    setIsVerifyingAadhaar(true);
    setAadhaarError('');

    setTimeout(() => {
      setIsVerifyingAadhaar(false);
      const isVerhoeffValid = validateAadhaarVerhoeff(clean);

      if (isVerhoeffValid) {
        setValue('isAadhaarVerified', true, { shouldValidate: true });
        setAadhaarError('');
        clearErrors('aadhaarNumber');
      } else {
        setValue('isAadhaarVerified', false, { shouldValidate: true });
        const errMsg = 'Aadhaar checksum failed. Please verify the 12 digits.';
        setAadhaarError(errMsg);
        setError('aadhaarNumber', { type: 'manual', message: errMsg });
      }
    }, 1500);
  };

  // Format masked display strings
  const getMaskedPanDisplay = () => {
    if (!panNumber) return '';
    if (showPan || panNumber.length < 10) return panNumber;
    return `${panNumber.slice(0, 5)}••••${panNumber.slice(9)}`;
  };

  const getMaskedAadhaarDisplay = () => {
    if (!aadhaarNumber) return '';
    if (showAadhaar || aadhaarNumber.length < 12) {
      return aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim();
    }
    return `•••• •••• ${aadhaarNumber.slice(8)}`;
  };

  const isBothVerified = isPanVerified && isAadhaarVerified;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Description */}
      <div className="border-b border-neutral-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Statutory KYC & Government ID Verification
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          UIDAI Aadhaar Verhoeff checksum algorithm and Income Tax Department PAN validation.
        </p>
      </div>

      {/* Navigation Gate Notice */}
      {!isBothVerified && (
        <Alert
          variant="info"
          title="Mandatory Identity Gating"
        >
          Both your PAN card and Aadhaar number must successfully pass NSDL/UIDAI checksum validation before advancing to the next step.
        </Alert>
      )}

      {/* 1. PAN Number Input (with Masking & Real-time onBlur Verification) */}
      <div className="p-5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="panNumberInput" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Permanent Account Number (PAN) <span className="text-danger-500">*</span>
            </label>
            <span className="text-xs text-neutral-500">
              Format: 5 uppercase letters, 4 numbers, 1 letter (4th character represents entity).
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isVerifyingPan && (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary-700 font-semibold">
                <span className="w-3 h-3 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
                Verifying NSDL...
              </span>
            )}

            {isPanVerified && !isVerifyingPan && (
              <Badge variant="success" size="md">
                ✓ Verified ({panEntityType} PAN)
              </Badge>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            id="panNumberInput"
            type="text"
            maxLength={10}
            placeholder="ABCDE1234F"
            value={showPan ? panNumber : getMaskedPanDisplay()}
            onChange={handlePanChange}
            onBlur={handlePanBlur}
            onFocus={() => setShowPan(true)}
            className={`
              w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm font-mono uppercase tracking-wider text-neutral-900 focus:outline-none focus:ring-2
              ${isPanVerified ? 'border-success-400 focus:ring-success-500' : panError ? 'border-danger-400 focus:ring-danger-500' : 'border-neutral-300 focus:ring-primary-700'}
            `}
            aria-label="PAN Number"
            aria-invalid={Boolean(panError || errors.panNumber)}
          />

          <button
            type="button"
            onClick={() => setShowPan(!showPan)}
            aria-label={showPan ? 'Mask PAN digits' : 'Show PAN digits'}
            className="absolute right-3 top-2.5 text-xs text-neutral-500 hover:text-neutral-800 font-semibold focus:outline-none"
          >
            {showPan ? 'Mask' : 'Show'}
          </button>
        </div>

        {panError && (
          <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
            {panError}
          </p>
        )}
        {!panError && errors.panNumber && (
          <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
            {errors.panNumber.message}
          </p>
        )}
      </div>

      {/* 2. Aadhaar Number Input (with Verhoeff Checksum & onBlur Simulation) */}
      <div className="p-5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="aadhaarNumberInput" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Aadhaar Number (12 Digits) <span className="text-danger-500">*</span>
            </label>
            <span className="text-xs text-neutral-500">
              Evaluated strictly with UIDAI Verhoeff D5 dihedral algorithm.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isVerifyingAadhaar && (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary-700 font-semibold">
                <span className="w-3 h-3 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
                Validating Verhoeff...
              </span>
            )}

            {isAadhaarVerified && !isVerifyingAadhaar && (
              <Badge variant="success" size="md">
                ✓ Verified (Verhoeff Passed)
              </Badge>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            id="aadhaarNumberInput"
            type="text"
            maxLength={14}
            placeholder="XXXX XXXX 1234"
            value={showAadhaar ? aadhaarNumber : getMaskedAadhaarDisplay()}
            onChange={handleAadhaarChange}
            onBlur={handleAadhaarBlur}
            onFocus={() => setShowAadhaar(true)}
            className={`
              w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm font-mono tracking-widest text-neutral-900 focus:outline-none focus:ring-2
              ${isAadhaarVerified ? 'border-success-400 focus:ring-success-500' : aadhaarError ? 'border-danger-400 focus:ring-danger-500' : 'border-neutral-300 focus:ring-primary-700'}
            `}
            aria-label="12-digit Aadhaar Number"
            aria-invalid={Boolean(aadhaarError || errors.aadhaarNumber)}
          />

          <button
            type="button"
            onClick={() => setShowAadhaar(!showAadhaar)}
            aria-label={showAadhaar ? 'Mask Aadhaar digits' : 'Show Aadhaar digits'}
            className="absolute right-3 top-2.5 text-xs text-neutral-500 hover:text-neutral-800 font-semibold focus:outline-none"
          >
            {showAadhaar ? 'Mask' : 'Show'}
          </button>
        </div>

        {aadhaarError && (
          <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
            {aadhaarError}
          </p>
        )}
        {!aadhaarError && errors.aadhaarNumber && (
          <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
            {errors.aadhaarNumber.message}
          </p>
        )}
      </div>

      {/* 3. Mandatory Aadhaar Consent Declaration */}
      <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/40">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('aadhaarConsent')}
            className="mt-1 w-4 h-4 text-primary-800 border-neutral-300 rounded focus:ring-primary-700 accent-primary-800 cursor-pointer"
          />
          <span className="text-xs text-neutral-700 leading-relaxed select-none">
            I hereby voluntarily provide my informed consent to LendSwift Financial Services (RBI-registered NBFC-ICC) to fetch, verify, and validate my Aadhaar identity details from UIDAI CIDR / CKYC registry for the explicit purpose of digital credit assessment and AML compliance under the Prevention of Money Laundering Act, 2002. <span className="text-danger-500 font-bold">*</span>
          </span>
        </label>
        {errors.aadhaarConsent && (
          <p className="text-xs text-danger-600 font-medium mt-2 pl-7" role="alert">
            {errors.aadhaarConsent.message}
          </p>
        )}
      </div>

      {/* 4. Secondary KYC Documents: Voter ID & Conditional Passport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Voter ID (Optional) */}
        <div>
          <label htmlFor="voterId" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Voter ID Number <span className="text-neutral-400 font-normal">(Optional)</span>
          </label>
          <input
            id="voterId"
            type="text"
            placeholder="e.g. ABC1234567"
            {...register('voterId')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm uppercase font-mono tracking-wider text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Format: 3 letters followed by 7 numeric digits (EPIC Card).
          </span>
          {errors.voterId && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.voterId.message}
            </p>
          )}
        </div>

        {/* Passport Number (Conditional for Home Loan > 50L) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="passportNumber" className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Indian Passport Number{' '}
              {isHomeLoanOver50L ? (
                <span className="text-danger-500 font-bold">*</span>
              ) : (
                <span className="text-neutral-400 font-normal">(Optional)</span>
              )}
            </label>
            {isHomeLoanOver50L && (
              <Badge variant="warning" size="sm">
                Mandatory for Home &gt; ₹50L
              </Badge>
            )}
          </div>
          <input
            id="passportNumber"
            type="text"
            placeholder="e.g. Z1234567"
            {...register('passportNumber')}
            className={`
              w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm uppercase font-mono tracking-wider text-neutral-900 focus:outline-none focus:ring-2
              ${isHomeLoanOver50L ? 'border-primary-400 focus:ring-primary-700' : 'border-neutral-300 focus:ring-primary-700'}
            `}
          />
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {isHomeLoanOver50L
              ? `Required under RBI high-value housing guidelines for ${formatIndianCurrency(loanAmount)}.`
              : 'Format: 1 letter followed by 7 digits (e.g. A1234567).'}
          </span>
          {errors.passportNumber && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.passportNumber.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step3KYC;

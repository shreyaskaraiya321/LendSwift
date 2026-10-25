import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Badge } from '@/components/common/Badge';
import { LOAN_TYPE_CONSTRAINTS, LoanTypeOption } from '@/schemas/step1Schema';
import { LoanApplicationData } from '@/types/loan';
import { calculateEmi, calculateProcessingFee } from '@/utils/emiCalculator';
import { formatIndianCurrency } from '@/utils/formatters';

export function Step1LoanType() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const selectedLoanType = (watch('loanType') || 'Personal') as LoanTypeOption;
  const currentAmount = Number(watch('loanAmount')) || LOAN_TYPE_CONSTRAINTS[selectedLoanType].defaultAmount;
  const currentTenure = Number(watch('loanTenure')) || LOAN_TYPE_CONSTRAINTS[selectedLoanType].defaultTenure;
  const referralCode = watch('referralCode') || '';

  const [referralApplied, setReferralApplied] = useState(false);

  const limits = useMemo(() => {
    return LOAN_TYPE_CONSTRAINTS[selectedLoanType] || LOAN_TYPE_CONSTRAINTS.Personal;
  }, [selectedLoanType]);

  // Synchronize loan parameters when loan category changes
  const handleLoanTypeSelect = (category: LoanTypeOption) => {
    setValue('loanType', category, { shouldValidate: true });
    const targetLimits = LOAN_TYPE_CONSTRAINTS[category];
    setValue('loanAmount', targetLimits.defaultAmount, { shouldValidate: true });
    setValue('loanTenure', targetLimits.defaultTenure, { shouldValidate: true });
    setValue('acceptedInterestRate', targetLimits.interestRate);
    setValue('loanPurpose', targetLimits.purposes[0], { shouldValidate: true });
  };

  // Keep tenure and amount within limits & update live EMI
  useEffect(() => {
    if (!watch('loanType')) {
      setValue('loanType', 'Personal');
      setValue('loanAmount', LOAN_TYPE_CONSTRAINTS.Personal.defaultAmount);
      setValue('loanTenure', LOAN_TYPE_CONSTRAINTS.Personal.defaultTenure);
      setValue('loanPurpose', LOAN_TYPE_CONSTRAINTS.Personal.purposes[0]);
    }
  }, [setValue, watch]);

  // Calculate live EMI
  const monthlyEmi = useMemo(() => {
    return calculateEmi(currentAmount, limits.interestRate, currentTenure);
  }, [currentAmount, limits.interestRate, currentTenure]);

  const processingFee = useMemo(() => {
    return calculateProcessingFee(currentAmount);
  }, [currentAmount]);

  useEffect(() => {
    setValue('calculatedEmi', monthlyEmi);
    setValue('acceptedInterestRate', limits.interestRate);
  }, [monthlyEmi, limits.interestRate, setValue]);

  // Handlers for synced amount
  const handleAmountSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setValue('loanAmount', val, { shouldValidate: true });
  };

  const handleAmountInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const val = Number(raw) || 0;
    setValue('loanAmount', val, { shouldValidate: true });
  };

  // Handlers for synced tenure
  const handleTenureSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setValue('loanTenure', val, { shouldValidate: true });
  };

  const handleTenureInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const val = Number(raw) || 0;
    setValue('loanTenure', val, { shouldValidate: true });
  };

  const handleApplyReferral = () => {
    if (referralCode.trim().length >= 4) {
      setReferralApplied(true);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Description */}
      <div className="border-b border-neutral-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Select Loan Category & Terms
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Customize your borrowing requirement. Loan eligibility and EMI are computed in real time.
        </p>
      </div>

      {/* 1. Loan Category Selection Cards */}
      <div className="space-y-3">
        <span id="loan-category-label" className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
          Loan Category <span className="text-danger-500">*</span>
        </span>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          role="radiogroup"
          aria-labelledby="loan-category-label"
        >
          {[
            {
              type: 'Personal' as LoanTypeOption,
              title: 'Personal Loan',
              rate: '10.5% p.a.',
              range: '₹50K - ₹10L',
              tenureRange: '1 - 5 yrs',
              desc: 'Immediate liquidity for personal expenses, medical, or events.',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
            },
            {
              type: 'Home' as LoanTypeOption,
              title: 'Home Loan',
              rate: '8.5% p.a.',
              range: '₹5L - ₹1Cr',
              tenureRange: '5 - 30 yrs',
              desc: 'Low-interest funding for ready flat, construction, or plot.',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ),
            },
            {
              type: 'Business' as LoanTypeOption,
              title: 'Business Loan',
              rate: '14.0% p.a.',
              range: '₹1L - ₹50L',
              tenureRange: '1 - 10 yrs',
              desc: 'Working capital and equipment financing for enterprises.',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
          ].map((cat) => {
            const isSelected = selectedLoanType === cat.type;
            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => handleLoanTypeSelect(cat.type)}
                className={`
                  relative flex flex-col p-4 rounded-xl text-left transition-all duration-200 border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700
                  ${
                    isSelected
                      ? 'border-primary-800 bg-primary-50/40 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }
                `}
                aria-pressed={isSelected}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-primary-800 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">
                    {cat.rate}
                  </Badge>
                </div>

                <div className="mt-3">
                  <span className="font-bold text-sm sm:text-base text-neutral-900 block">
                    {cat.title}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium block mt-0.5">
                    {cat.range} • {cat.tenureRange}
                  </span>
                  <p className="text-[11px] text-neutral-600 mt-2 leading-tight">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.loanType && (
          <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
            {errors.loanType.message}
          </p>
        )}
      </div>

      {/* 2. Synced Loan Amount Slider & Input */}
      <div className="bg-neutral-50/80 rounded-xl p-5 border border-neutral-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="loanAmountInput" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Required Loan Amount <span className="text-danger-500">*</span>
            </label>
            <span className="text-xs text-neutral-500">
              Min: {formatIndianCurrency(limits.minAmount)} | Max: {formatIndianCurrency(limits.maxAmount)}
            </span>
          </div>

          <div className="relative w-full sm:w-48">
            <span className="absolute left-3 top-2.5 text-neutral-500 font-bold text-sm">₹</span>
            <input
              id="loanAmountInput"
              type="text"
              value={currentAmount.toLocaleString('en-IN')}
              onChange={handleAmountInputChange}
              aria-invalid={Boolean(errors.loanAmount)}
              aria-describedby={errors.loanAmount ? 'loanAmount-error' : undefined}
              className="w-full pl-7 pr-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold text-neutral-900 text-right focus:outline-none focus:ring-2 focus:ring-primary-700 text-base"
              aria-label="Loan Amount in Rupees"
            />
          </div>
        </div>

        {/* Amount Range Slider */}
        <div className="space-y-1">
          <input
            id="loanAmountSlider"
            type="range"
            min={limits.minAmount}
            max={limits.maxAmount}
            step={limits.amountStep}
            value={currentAmount}
            onChange={handleAmountSliderChange}
            aria-label="Loan Amount Slider"
            aria-valuemin={limits.minAmount}
            aria-valuemax={limits.maxAmount}
            aria-valuenow={currentAmount}
            aria-valuetext={formatIndianCurrency(currentAmount)}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-800"
          />
          <div className="flex justify-between text-[11px] text-neutral-600 font-medium">
            <span>{formatIndianCurrency(limits.minAmount)}</span>
            <span className="font-bold text-primary-800">{formatIndianCurrency(currentAmount)}</span>
            <span>{formatIndianCurrency(limits.maxAmount)}</span>
          </div>
        </div>

        {errors.loanAmount && (
          <p id="loanAmount-error" className="text-xs text-danger-600 font-medium" role="alert">
            {errors.loanAmount.message}
          </p>
        )}
      </div>

      {/* 3. Synced Loan Tenure Slider & Input */}
      <div className="bg-neutral-50/80 rounded-xl p-5 border border-neutral-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="loanTenureInput" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Loan Repayment Tenure <span className="text-danger-500">*</span>
            </label>
            <span className="text-xs text-neutral-500">
              Min: {limits.minTenure} months ({limits.minTenure / 12} yrs) | Max: {limits.maxTenure} months ({limits.maxTenure / 12} yrs)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-28">
              <input
                id="loanTenureInput"
                type="number"
                min={limits.minTenure}
                max={limits.maxTenure}
                step={limits.tenureStep}
                value={currentTenure}
                onChange={handleTenureInputChange}
                aria-invalid={Boolean(errors.loanTenure)}
                aria-describedby={errors.loanTenure ? 'loanTenure-error' : undefined}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold text-neutral-900 text-right focus:outline-none focus:ring-2 focus:ring-primary-700 text-base"
                aria-label="Loan Tenure in Months"
              />
            </div>
            <span className="text-xs font-bold text-neutral-600">Months</span>
          </div>
        </div>

        {/* Tenure Range Slider */}
        <div className="space-y-1">
          <input
            id="loanTenureSlider"
            type="range"
            min={limits.minTenure}
            max={limits.maxTenure}
            step={limits.tenureStep}
            value={currentTenure}
            onChange={handleTenureSliderChange}
            aria-label="Loan Tenure Slider"
            aria-valuemin={limits.minTenure}
            aria-valuemax={limits.maxTenure}
            aria-valuenow={currentTenure}
            aria-valuetext={`${currentTenure} months`}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-800"
          />
          <div className="flex justify-between text-[11px] text-neutral-600 font-medium">
            <span>{limits.minTenure} Mo ({limits.minTenure / 12} Yrs)</span>
            <span className="font-bold text-primary-800">
              {currentTenure} Months ({(currentTenure / 12).toFixed(1)} Years)
            </span>
            <span>{limits.maxTenure} Mo ({limits.maxTenure / 12} Yrs)</span>
          </div>
        </div>

        {errors.loanTenure && (
          <p id="loanTenure-error" className="text-xs text-danger-600 font-medium" role="alert">
            {errors.loanTenure.message}
          </p>
        )}
      </div>

      {/* 4. Purpose of Loan & Optional Referral Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Loan Purpose */}
        <div>
          <label htmlFor="loanPurpose" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Specific Loan Purpose <span className="text-danger-500">*</span>
          </label>
          <select
            id="loanPurpose"
            {...register('loanPurpose')}
            aria-invalid={Boolean(errors.loanPurpose)}
            aria-describedby={errors.loanPurpose ? 'loanPurpose-error' : undefined}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          >
            {limits.purposes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.loanPurpose && (
            <p id="loanPurpose-error" className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.loanPurpose.message}
            </p>
          )}
        </div>

        {/* Referral Code (Optional) */}
        <div>
          <label htmlFor="referralCode" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Partner / Referral Code <span className="text-neutral-400 font-normal">(Optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="referralCode"
              type="text"
              placeholder="e.g. LSFIN2026"
              {...register('referralCode')}
              className="flex-1 px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 uppercase tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
            <button
              type="button"
              onClick={handleApplyReferral}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              Apply
            </button>
          </div>
          {referralApplied && (
            <span className="text-xs text-success-600 font-semibold mt-1 inline-flex items-center gap-1">
              ✓ Referral code applied! Special processing fee discount active.
            </span>
          )}
          {errors.referralCode && (
            <p className="text-xs text-danger-600 mt-1 font-medium" role="alert">
              {errors.referralCode.message}
            </p>
          )}
        </div>
      </div>

      {/* 5. Live Estimated EMI Summary Card */}
      <div className="p-5 rounded-xl bg-primary-50/70 border border-primary-200 text-primary-950 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-primary-900 uppercase tracking-wider">
            Real-Time Financial Estimation
          </span>
          <Badge variant="primary" size="sm">
            RBI KFS Disclosed
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div>
            <span className="text-xs text-neutral-500 block">Estimated EMI</span>
            <span className="text-lg sm:text-xl font-extrabold text-primary-900 font-mono">
              {formatIndianCurrency(monthlyEmi)}
              <span className="text-xs font-medium text-neutral-600">/mo</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Annual Interest</span>
            <span className="text-lg sm:text-xl font-bold text-neutral-900">
              {limits.interestRate}% <span className="text-xs font-normal text-neutral-500">p.a.</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Processing Fee</span>
            <span className="text-lg sm:text-xl font-bold text-neutral-900">
              {formatIndianCurrency(processingFee)}
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Total Repayment</span>
            <span className="text-lg sm:text-xl font-bold text-neutral-900 font-mono">
              {formatIndianCurrency(monthlyEmi * currentTenure)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step1LoanType;

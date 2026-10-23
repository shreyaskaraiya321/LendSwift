import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/common/Checkbox';
import { Select } from '@/components/common/Select';
import {
  BASE_INTEREST_RATE,
  LOAN_AMOUNT_STEP,
  LOAN_PURPOSE_OPTIONS,
  MAX_LOAN_AMOUNT,
  MIN_LOAN_AMOUNT,
  TENURE_OPTIONS,
} from '@/constants/loanConstants';
import { LoanApplicationData } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';
import { calculateEmi, calculateKeyFactStatement } from '@/utils/emiCalculator';
import { formatIndianCurrency } from '@/utils/formatters';

export function Step4LoanRequirement(_props: StepViewProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const loanAmount = watch('loanAmount') || 250000;
  const tenureMonths = watch('tenureMonths') || 24;
  const acceptedInterestRate = watch('acceptedInterestRate') || BASE_INTEREST_RATE;

  // Sync calculated EMI into form state
  useEffect(() => {
    const emi = calculateEmi(loanAmount, acceptedInterestRate, tenureMonths);
    setValue('calculatedEmi', emi, { shouldValidate: true });
    setValue('acceptedInterestRate', BASE_INTEREST_RATE, { shouldValidate: true });
  }, [loanAmount, tenureMonths, acceptedInterestRate, setValue]);

  const kfs = calculateKeyFactStatement(loanAmount, acceptedInterestRate, tenureMonths);

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold text-neutral-900">Loan Customization & Terms</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Select your required loan amount and preferred tenure to review the RBI Key Fact Statement (KFS).
        </p>
      </div>

      {/* Loan Amount Range & Display */}
      <div className="bg-primary-50/50 rounded-fintech p-5 border border-primary-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="loanAmountSlider" className="text-xs font-bold text-primary-900 uppercase tracking-wider block">
              Required Loan Amount
            </label>
            <p className="text-xs text-neutral-500">Instant credit limit up to ₹10,00,000</p>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-fintech border border-primary-300 shadow-sm">
            <span className="text-xl font-black text-primary-900">
              {formatIndianCurrency(loanAmount)}
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1.5">
          <input
            id="loanAmountSlider"
            type="range"
            min={MIN_LOAN_AMOUNT}
            max={MAX_LOAN_AMOUNT}
            step={LOAN_AMOUNT_STEP}
            value={loanAmount}
            onChange={(e) => setValue('loanAmount', Number(e.target.value), { shouldValidate: true })}
            className="w-full h-2.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-800"
          />
          <div className="flex justify-between text-[11px] font-semibold text-neutral-500">
            <span>{formatIndianCurrency(MIN_LOAN_AMOUNT)}</span>
            <span>{formatIndianCurrency(500000)}</span>
            <span>{formatIndianCurrency(MAX_LOAN_AMOUNT)}</span>
          </div>
        </div>
      </div>

      {/* Tenure Selection Buttons */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-neutral-700 block">
          Repayment Tenure (in Months)
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {TENURE_OPTIONS.map((months) => {
            const isSelected = tenureMonths === months;
            return (
              <button
                key={months}
                type="button"
                onClick={() => setValue('tenureMonths', months, { shouldValidate: true })}
                className={`
                  py-2.5 rounded-fintech text-xs font-bold border transition-all duration-150
                  ${
                    isSelected
                      ? 'bg-primary-800 text-white border-primary-800 shadow-sm'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                  }
                `}
              >
                {months} M
              </button>
            );
          })}
        </div>
        {errors.tenureMonths && (
          <p className="text-xs text-danger-600 font-medium">{errors.tenureMonths.message}</p>
        )}
      </div>

      {/* Loan Purpose */}
      <div>
        <Select
          label="Purpose of Loan"
          required
          options={LOAN_PURPOSE_OPTIONS}
          {...register('loanPurpose')}
          error={errors.loanPurpose?.message}
          helperText="Select the principal use of funds as required by NBFC compliance"
        />
      </div>

      {/* RBI Mandated Key Fact Statement (KFS) Table */}
      <div className="rounded-fintech border border-neutral-200 overflow-hidden shadow-sm">
        <div className="bg-primary-900 px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">
              RBI Statutory Key Fact Statement (KFS)
            </span>
          </div>
          <span className="text-[11px] bg-primary-800 px-2 py-0.5 rounded text-primary-100">
            Master Direction 2022
          </span>
        </div>

        <div className="p-4 bg-white space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-neutral-100">
            <div>
              <span className="text-neutral-500 block">Interest Rate (Fixed)</span>
              <span className="text-sm font-bold text-neutral-900">{kfs.annualInterestRate}% p.a.</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Monthly Installment</span>
              <span className="text-sm font-bold text-primary-800">{formatIndianCurrency(kfs.monthlyEmi)}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Net Disbursal Amount</span>
              <span className="text-sm font-bold text-success-700">{formatIndianCurrency(kfs.netDisbursalAmount)}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Effective APR</span>
              <span className="text-sm font-bold text-neutral-900">{kfs.effectiveApr}%</span>
            </div>
          </div>

          <dl className="space-y-1.5 text-neutral-600">
            <div className="flex justify-between py-1">
              <dt>Total Interest over {kfs.tenureMonths} Months</dt>
              <dd className="font-semibold text-neutral-900">{formatIndianCurrency(kfs.totalInterestAmount)}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt>Processing Fee (2.00% + 18% GST)</dt>
              <dd className="font-semibold text-neutral-900">{formatIndianCurrency(kfs.totalProcessingCharges)}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt>Pre-closure / Foreclosure Charges</dt>
              <dd className="font-bold text-success-700">₹0 (Zero Charges)</dd>
            </div>
            <div className="flex justify-between py-1.5 border-t border-neutral-100 text-sm font-bold text-neutral-900">
              <dt>Total Amount Repayable</dt>
              <dd>{formatIndianCurrency(kfs.totalAmountPayable)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* KFS Acknowledgment */}
      <Checkbox
        label="I have reviewed and acknowledge the Key Fact Statement (KFS)"
        description="I confirm understanding of the interest rate, processing charges, APR, and repayment obligations outlined above."
        {...register('keyFactStatementAcknowledged')}
        error={errors.keyFactStatementAcknowledged?.message}
      />
    </div>
  );
}

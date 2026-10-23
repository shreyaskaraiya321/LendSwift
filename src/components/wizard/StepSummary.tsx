import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { BASE_INTEREST_RATE } from '@/constants/loanConstants';
import { PartialLoanApplicationData } from '@/types/loan';
import { calculateEmi } from '@/utils/emiCalculator';
import { formatIndianCurrency } from '@/utils/formatters';

export interface StepSummaryProps {
  formData: PartialLoanApplicationData;
  className?: string;
}

export function StepSummary({ formData, className = '' }: StepSummaryProps) {
  const loanAmount = formData.loanAmount || 250000;
  const tenureMonths = formData.tenureMonths || 24;
  const interestRate = formData.acceptedInterestRate || BASE_INTEREST_RATE;
  const computedEmi = calculateEmi(loanAmount, interestRate, tenureMonths);

  const isKycComplete = Boolean(formData.panNumber && formData.isAadhaarVerified);
  const isIncomeProvided = Boolean(formData.monthlyNetIncome);

  return (
    <aside aria-label="Loan Application Summary" className={`w-full lg:w-80 shrink-0 ${className}`}>
      <Card
        title="Application Summary"
        subtitle="Real-time estimated terms"
        headerBorder
        className="sticky top-6 border-primary-100"
      >
        <div className="space-y-4">
          {/* Key Metric: Monthly EMI */}
          <div className="bg-primary-50/70 rounded-fintech p-4 border border-primary-200">
            <span className="text-xs font-semibold text-primary-800 uppercase tracking-wider block">
              Estimated Monthly EMI
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-primary-900">
                {formatIndianCurrency(computedEmi)}
              </span>
              <span className="text-xs text-neutral-500">/ month</span>
            </div>
            <p className="text-[11px] text-neutral-600 mt-1">
              Based on reducing balance at {interestRate}% p.a.
            </p>
          </div>

          {/* Breakdown items */}
          <dl className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-neutral-100">
              <dt className="text-neutral-500 font-medium">Loan Amount</dt>
              <dd className="text-neutral-900 font-bold">{formatIndianCurrency(loanAmount)}</dd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-100">
              <dt className="text-neutral-500 font-medium">Repayment Tenure</dt>
              <dd className="text-neutral-900 font-bold">{tenureMonths} Months</dd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-100">
              <dt className="text-neutral-500 font-medium">Interest Rate (p.a.)</dt>
              <dd className="text-neutral-900 font-bold">{interestRate}% Fixed</dd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-100">
              <dt className="text-neutral-500 font-medium">KYC Verification</dt>
              <dd>
                {isKycComplete ? (
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    In Progress
                  </Badge>
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between py-1">
              <dt className="text-neutral-500 font-medium">Income Eligibility</dt>
              <dd>
                {isIncomeProvided ? (
                  <Badge variant="success" size="sm">
                    Eligible
                  </Badge>
                ) : (
                  <span className="text-neutral-400">Pending</span>
                )}
              </dd>
            </div>
          </dl>

          {/* RBI Regulatory Assurance Box */}
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-primary-800">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[11px] font-bold tracking-tight">RBI Registered NBFC-ICC</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5 leading-tight">
              Reg. No: B-14.03212. Zero hidden foreclosure charges.
            </p>
          </div>
        </div>
      </Card>
    </aside>
  );
}

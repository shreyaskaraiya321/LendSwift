import { GST_RATE } from '@/constants/loanConstants';
import { KeyFactStatement } from '@/types/api';

/**
 * Standard LendSwift Interest Rate Constants (% p.a.)
 */
export const PERSONAL_LOAN_RATE = 10.5;
export const HOME_LOAN_RATE = 8.5;
export const BUSINESS_LOAN_RATE = 14.0;

export const LOAN_RATES = {
  PERSONAL: 10.5,
  HOME: 8.5,
  BUSINESS: 14.0,
} as const;

export const RATE_CONSTANTS = {
  PERSONAL: 10.5,
  HOME: 8.5,
  BUSINESS: 14.0,
} as const;

export const INTEREST_RATES = {
  PERSONAL: 10.5,
  HOME: 8.5,
  BUSINESS: 14.0,
} as const;

export const DEFAULT_LOAN_RATES = {
  personal: 10.5,
  home: 8.5,
  business: 14.0,
} as const;

export const MIN_PROCESSING_FEE = 2000;
export const MAX_PROCESSING_FEE = 25000;
export const PROCESSING_FEE_PERCENT = 1.0;

/**
 * Calculates standard Equated Monthly Installment (EMI) using the reducing-balance method:
 * Formula: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 * where:
 *   P = Principal loan amount
 *   r = Monthly interest rate (annualRate / 12 / 100)
 *   n = Tenure in months
 */
export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): number {
  if (!principal || principal <= 0 || !tenureMonths || tenureMonths <= 0) return 0;
  if (!annualRatePercent || annualRatePercent <= 0) {
    return Math.round(principal / tenureMonths);
  }

  const r = annualRatePercent / (12 * 100);
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = (principal * r * factor) / (factor - 1);

  return Math.round(emi);
}

/**
 * Alias for calculateEmi with uppercase naming convention
 */
export const calculateEMI = calculateEmi;

/**
 * Calculates Total Cost of Borrowing:
 * Formula: Total Cost of Borrowing = (EMI * n) - P
 */
export function calculateTotalCostOfBorrowing(
  principal: number,
  annualRateOrEmi: number,
  tenureMonths: number
): number {
  if (!principal || principal <= 0 || !tenureMonths || tenureMonths <= 0) return 0;

  // Support both annualRate (e.g. 10.5) and precalculated EMI
  const emi =
    annualRateOrEmi <= 100
      ? calculateEmi(principal, annualRateOrEmi, tenureMonths)
      : annualRateOrEmi;

  const totalRepayment = emi * tenureMonths;
  return Math.max(0, Math.round(totalRepayment - principal));
}

/**
 * Calculates Processing Fee: 1% of loan amount, clamped between ₹2,000 and ₹25,000.
 */
export function calculateProcessingFee(
  principal: number,
  percent: number = PROCESSING_FEE_PERCENT
): number {
  if (!principal || principal <= 0) return 0;
  const rawFee = Math.round(principal * (percent / 100));
  return Math.min(MAX_PROCESSING_FEE, Math.max(MIN_PROCESSING_FEE, rawFee));
}

/**
 * Checks whether an EMI is affordable based on monthly net income.
 * Returns false if EMI > 50% of monthly income, or if income <= 0.
 */
export function isAffordable(emi: number, monthlyIncome: number): boolean {
  if (typeof emi !== 'number' || typeof monthlyIncome !== 'number') return false;
  if (monthlyIncome <= 0) return false;
  if (emi <= 0) return true;
  return emi <= monthlyIncome * 0.5;
}

export interface LoanCalculationSummary {
  emi: number;
  monthlyEmi: number;
  totalCostOfBorrowing: number;
  totalAmountPayable: number;
  processingFee: number;
}

/**
 * Aggregates core loan metrics into a unified summary.
 */
export function calculateLoanDetails(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): LoanCalculationSummary {
  const emi = calculateEmi(principal, annualRatePercent, tenureMonths);
  const totalCostOfBorrowing = calculateTotalCostOfBorrowing(principal, annualRatePercent, tenureMonths);
  const totalAmountPayable = emi * tenureMonths;
  const processingFee = calculateProcessingFee(principal);

  return {
    emi,
    monthlyEmi: emi,
    totalCostOfBorrowing,
    totalAmountPayable,
    processingFee,
  };
}

export interface AmortizationMonth {
  monthNumber: number;
  openingPrincipal: number;
  emi: number;
  principalComponent: number;
  interestComponent: number;
  closingPrincipal: number;
}

/**
 * Generates a full month-by-month amortization schedule for loan transparency.
 */
export function calculateAmortizationSchedule(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): AmortizationMonth[] {
  const schedule: AmortizationMonth[] = [];
  const emi = calculateEmi(principal, annualRatePercent, tenureMonths);
  const monthlyRate = annualRatePercent / (12 * 100);

  let remainingPrincipal = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interestComponent = Math.round(remainingPrincipal * monthlyRate);
    let principalComponent = emi - interestComponent;

    // Adjust final month rounding differences
    if (month === tenureMonths || principalComponent > remainingPrincipal) {
      principalComponent = remainingPrincipal;
    }

    const closingPrincipal = Math.max(0, remainingPrincipal - principalComponent);

    schedule.push({
      monthNumber: month,
      openingPrincipal: remainingPrincipal,
      emi: principalComponent + interestComponent,
      principalComponent,
      interestComponent,
      closingPrincipal,
    });

    remainingPrincipal = closingPrincipal;
    if (remainingPrincipal <= 0) break;
  }

  return schedule;
}

/**
 * Computes RBI Compliant Key Fact Statement (KFS) including upfront processing fee,
 * GST, Net Disbursal, and Effective APR (Annual Percentage Rate).
 */
export function calculateKeyFactStatement(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): KeyFactStatement {
  const monthlyEmi = calculateEmi(principal, annualInterestRate, tenureMonths);
  const totalAmountPayable = monthlyEmi * tenureMonths;
  const totalInterestAmount = Math.max(0, totalAmountPayable - principal);

  const processingFeeAmount = calculateProcessingFee(principal);
  const gstOnProcessingFee = Math.round(processingFeeAmount * GST_RATE);
  const totalProcessingCharges = processingFeeAmount + gstOnProcessingFee;
  const netDisbursalAmount = principal - totalProcessingCharges;

  // Approximate Annual Percentage Rate (APR) = ((Total Charges + Total Interest) / Principal) / (Tenure / 12) * 100
  const totalCostOfCredit = totalInterestAmount + totalProcessingCharges;
  const years = tenureMonths / 12;
  const effectiveApr =
    years > 0 ? Number(((totalCostOfCredit / principal / years) * 100).toFixed(2)) : annualInterestRate;

  return {
    principalAmount: principal,
    annualInterestRate,
    tenureMonths,
    monthlyEmi,
    totalInterestAmount,
    processingFeeAmount,
    gstOnProcessingFee,
    totalProcessingCharges,
    netDisbursalAmount,
    totalAmountPayable,
    effectiveApr,
  };
}

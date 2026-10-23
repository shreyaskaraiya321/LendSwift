import { GST_RATE, PROCESSING_FEE_PERCENT } from '@/constants/loanConstants';
import { KeyFactStatement } from '@/types/api';

/**
 * Calculates standard Equated Monthly Installment (EMI) using reducing balance method:
 * Formula: E = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 * where:
 *   P = Principal loan amount
 *   r = Monthly interest rate (annual rate / 12 / 100)
 *   n = Tenure in months
 */
export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePercent <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualRatePercent / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);

  return Math.round(emi);
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

  const processingFeeAmount = Math.round(principal * (PROCESSING_FEE_PERCENT / 100));
  const gstOnProcessingFee = Math.round(processingFeeAmount * GST_RATE);
  const totalProcessingCharges = processingFeeAmount + gstOnProcessingFee;
  const netDisbursalAmount = principal - totalProcessingCharges;

  // Approximate Annual Percentage Rate (APR) = ((Total Charges + Total Interest) / Principal) / (Tenure / 12) * 100
  const totalCostOfCredit = totalInterestAmount + totalProcessingCharges;
  const years = tenureMonths / 12;
  const effectiveApr = years > 0 ? Number(((totalCostOfCredit / principal / years) * 100).toFixed(2)) : annualInterestRate;

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

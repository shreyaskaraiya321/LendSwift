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
};

export const RATE_CONSTANTS = {
  PERSONAL: 10.5,
  HOME: 8.5,
  BUSINESS: 14.0,
};

export const INTEREST_RATES = {
  PERSONAL: 10.5,
  HOME: 8.5,
  BUSINESS: 14.0,
};

export const DEFAULT_LOAN_RATES = {
  personal: 10.5,
  home: 8.5,
  business: 14.0,
};

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
 *
 * @param {number} principal - Principal loan amount (P)
 * @param {number} annualRatePercent - Annual interest rate in percentage
 * @param {number} tenureMonths - Total tenure in months (n)
 * @returns {number} Monthly EMI rounded to the nearest integer
 */
export function calculateEmi(principal, annualRatePercent, tenureMonths) {
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
 *
 * @param {number} principal - Principal loan amount (P)
 * @param {number} annualRateOrEmi - Annual interest rate (%) or pre-calculated EMI
 * @param {number} tenureMonths - Total tenure in months (n)
 * @returns {number} Total interest/cost incurred over the tenure
 */
export function calculateTotalCostOfBorrowing(principal, annualRateOrEmi, tenureMonths) {
  if (!principal || principal <= 0 || !tenureMonths || tenureMonths <= 0) return 0;

  const emi =
    annualRateOrEmi <= 100
      ? calculateEmi(principal, annualRateOrEmi, tenureMonths)
      : annualRateOrEmi;

  const totalRepayment = emi * tenureMonths;
  return Math.max(0, Math.round(totalRepayment - principal));
}

/**
 * Calculates Processing Fee: 1% of loan amount, clamped between ₹2,000 and ₹25,000.
 *
 * @param {number} principal - Principal loan amount
 * @param {number} [percent=1.0] - Processing fee percentage (default 1%)
 * @returns {number} Clamped processing fee
 */
export function calculateProcessingFee(principal, percent = PROCESSING_FEE_PERCENT) {
  if (!principal || principal <= 0) return 0;
  const rawFee = Math.round(principal * (percent / 100));
  return Math.min(MAX_PROCESSING_FEE, Math.max(MIN_PROCESSING_FEE, rawFee));
}

/**
 * Checks whether an EMI is affordable based on monthly net income.
 * Returns false if EMI > 50% of monthly income, or if income <= 0.
 *
 * @param {number} emi - Monthly EMI amount
 * @param {number} monthlyIncome - Monthly net in-hand income
 * @returns {boolean} Whether the loan is affordable
 */
export function isAffordable(emi, monthlyIncome) {
  if (typeof emi !== 'number' || typeof monthlyIncome !== 'number') return false;
  if (monthlyIncome <= 0) return false;
  if (emi <= 0) return true;
  return emi <= monthlyIncome * 0.5;
}

/**
 * Aggregates core loan metrics into a unified summary.
 *
 * @param {number} principal - Principal loan amount
 * @param {number} annualRatePercent - Annual interest rate (%)
 * @param {number} tenureMonths - Total tenure in months
 * @returns {object} Summary containing EMI, totalCostOfBorrowing, totalAmountPayable, processingFee
 */
export function calculateLoanDetails(principal, annualRatePercent, tenureMonths) {
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

export default {
  calculateEmi,
  calculateEMI,
  calculateTotalCostOfBorrowing,
  calculateProcessingFee,
  isAffordable,
  calculateLoanDetails,
  PERSONAL_LOAN_RATE,
  HOME_LOAN_RATE,
  BUSINESS_LOAN_RATE,
  LOAN_RATES,
  RATE_CONSTANTS,
  INTEREST_RATES,
  DEFAULT_LOAN_RATES,
  MIN_PROCESSING_FEE,
  MAX_PROCESSING_FEE,
  PROCESSING_FEE_PERCENT,
};

export interface PincodeLookupResult {
  pincode: string;
  city: string;
  district: string;
  state: string;
  region: string;
  isDeliverable: boolean;
}

export interface IfscLookupResult {
  ifsc: string;
  bank: string;
  branch: string;
  centre: string;
  district: string;
  state: string;
  address: string;
  contact?: string;
  micr?: string;
  rtgs: boolean;
  neft: boolean;
  imps: boolean;
  upi: boolean;
}

export interface PanVerificationResult {
  pan: string;
  isValid: boolean;
  fullName: string;
  category: 'Individual' | 'Company' | 'HUF' | 'Firm' | 'AOP' | 'Trust';
  aadhaarSeeded: boolean;
  verifiedAt: string;
}

export interface KeyFactStatement {
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterestAmount: number;
  processingFeeAmount: number;
  gstOnProcessingFee: number;
  totalProcessingCharges: number;
  netDisbursalAmount: number;
  totalAmountPayable: number;
  effectiveApr: number; // Annual Percentage Rate (RBI mandate)
}

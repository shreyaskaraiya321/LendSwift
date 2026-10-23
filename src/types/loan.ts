export type EmploymentType = 'salaried' | 'self_employed_professional' | 'business_owner';

export type SalaryMode = 'bank_transfer' | 'cheque' | 'cash';

export type ResidenceType = 'owned_self' | 'owned_family' | 'rented' | 'company_provided';

export type LoanPurpose =
  | 'medical_emergency'
  | 'home_renovation'
  | 'education'
  | 'debt_consolidation'
  | 'wedding_family_event'
  | 'business_expansion'
  | 'travel_vacation'
  | 'vehicle_purchase'
  | 'other';

export type Gender = 'male' | 'female' | 'transgender' | 'prefer_not_to_say';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export type AccountType = 'savings' | 'current';

export interface AddressData {
  line1: string;
  line2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  residenceType: ResidenceType;
  yearsAtCurrentAddress: number;
}

export interface LoanApplicationData {
  // Step 1: Personal & Basic Details
  fullName: string;
  panNumber: string;
  mobileNumber: string;
  isMobileVerified: boolean;
  email: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  maritalStatus: MaritalStatus;

  // Step 2: Identity & KYC
  aadhaarNumber: string;
  isAadhaarVerified: boolean;
  digiLockerConsent: boolean;
  ckycConsent: boolean;
  panCardHolderName?: string;

  // Step 3: Employment & Income
  employmentType: EmploymentType;
  employerName: string;
  officialEmail?: string;
  monthlyNetIncome: number;
  salaryCreditMode: SalaryMode;
  totalWorkExperienceMonths: number;
  existingMonthlyEmi: number;

  // Step 4: Loan Requirement & Terms
  loanAmount: number;
  tenureMonths: number;
  loanPurpose: LoanPurpose;
  customPurposeDetails?: string;
  acceptedInterestRate: number;
  calculatedEmi: number;
  keyFactStatementAcknowledged: boolean;

  // Step 5: Address Information
  currentAddress: AddressData;
  isPermanentSameAsCurrent: boolean;
  permanentAddress?: AddressData;

  // Step 6: Bank Account & Disbursal
  bankAccountNumber: string;
  confirmBankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: AccountType;
  accountHolderName: string;
  eNachAutoDebitConsent: boolean;

  // Step 7: Document Verification
  incomeProofType: 'salary_slip_3_months' | 'itr_acknowledgment' | 'bank_statement_6_months';
  incomeProofFileName?: string;
  bankStatementFileName?: string;
  selfieVerificationConsent: boolean;
  geolocationConsent: boolean;

  // Step 8: Final Review & e-Sign
  cibilScoreConsent: boolean;
  rbiFairPracticesConsent: boolean;
  privacyPolicyConsent: boolean;
  eSignOtpVerified: boolean;
  applicationReferenceNumber?: string;
  submissionTimestamp?: string;
}

export type PartialLoanApplicationData = Partial<LoanApplicationData>;

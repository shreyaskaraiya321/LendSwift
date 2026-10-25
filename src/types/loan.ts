export type EmploymentType =
  | 'Salaried'
  | 'Self-Employed'
  | 'Business Owner'
  | 'salaried'
  | 'self_employed_professional'
  | 'business_owner';

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
  // Step 1: Loan Terms & Type
  loanType?: 'Personal' | 'Home' | 'Business';
  loanAmount: number;
  loanTenure?: number;
  loanPurpose: LoanPurpose | string;
  referralCode?: string;

  // Step 2: Personal & Identity Details
  fullName: string;
  dob?: string; // YYYY-MM-DD
  dateOfBirth?: string; // YYYY-MM-DD
  gender: Gender;
  maritalStatus: MaritalStatus;
  fatherName?: string;
  motherName?: string;
  email: string;
  isEmailVerified?: boolean;
  mobileNumber: string;
  isMobileVerified: boolean;
  alternateMobile?: string;
  panNumber: string;

  // Step 3: Statutory KYC & Identity Documents
  aadhaarNumber: string;
  isAadhaarVerified: boolean;
  aadhaarConsent?: boolean;
  digiLockerConsent?: boolean;
  ckycConsent?: boolean;
  voterId?: string;
  passportNumber?: string;
  isPanVerified?: boolean;
  panVerificationError?: string;
  aadhaarVerificationError?: string;
  panCardHolderName?: string;

  // Step 4: Residential Address & Verification
  currentAddressLine1?: string;
  currentAddressLine2?: string;
  pincode?: string;
  city?: string;
  state?: string;
  residenceType?: 'Owned' | 'Rented' | 'Company' | 'Family';
  yearsAtAddress?: number;
  monthlyRentAmount?: number;
  previousAddressLine?: string;
  sameAsPermanent?: boolean;
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentPincode?: string;
  permanentCity?: string;
  permanentState?: string;

  // Step 5: Dynamic Employment Details (Discriminated Union)
  employmentType: EmploymentType;
  companyName?: string;
  designation?: string;
  monthlyNetSalary?: number;
  yearsOfExperience?: number;
  businessName?: string;
  businessType?: string;
  annualTurnover?: number;
  yearsInBusiness?: number;
  monthlyIncome?: number;
  gstNumber?: string;
  businessAddress?: string;

  // Step 6: Co-Applicant Verification
  coApplicantName?: string;
  relationship?: 'Spouse' | 'Parent' | 'Sibling' | 'Business Partner';
  coApplicantPan?: string;
  coApplicantIncome?: number;
  coApplicantConsent?: boolean;
  isCoApplicantPanVerified?: boolean;

  // Legacy Employment & Income fields
  employerName?: string;
  officialEmail?: string;
  monthlyNetIncome: number;
  salaryCreditMode?: SalaryMode;
  totalWorkExperienceMonths?: number;
  existingMonthlyEmi?: number;

  // Step 4: Loan Requirement & Terms
  tenureMonths: number;
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

  // Step 7: Document Uploads & Digital Signature Capture
  docPanCard?: UploadedFileMetadata | null;
  docAadhaarFront?: UploadedFileMetadata | null;
  docAadhaarBack?: UploadedFileMetadata | null;
  docSalarySlips?: UploadedFileMetadata | null;
  docItrReturns?: UploadedFileMetadata | null;
  docPropertyDocs?: UploadedFileMetadata | null;
  docBusinessRegistration?: UploadedFileMetadata | null;
  digitalSignature?: string;

  // Step 7: Legacy Document Verification
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

export interface UploadedFileMetadata {
  name: string;
  size: number;
  type: string;
  previewUrl: string | null;
  originalSize: number;
  compressedSize: number;
  isCompressed: boolean;
  uploadedAt: string;
}

export type PartialLoanApplicationData = Partial<LoanApplicationData>;


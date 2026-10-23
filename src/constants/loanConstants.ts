import { StepMetadata } from '@/types/wizard';

export const MIN_LOAN_AMOUNT = 50000;
export const MAX_LOAN_AMOUNT = 1000000;
export const DEFAULT_LOAN_AMOUNT = 250000;
export const LOAN_AMOUNT_STEP = 10000;

export const MIN_TENURE_MONTHS = 6;
export const MAX_TENURE_MONTHS = 60;
export const DEFAULT_TENURE_MONTHS = 24;
export const TENURE_OPTIONS: readonly number[] = [6, 12, 18, 24, 36, 48, 60];

export const BASE_INTEREST_RATE = 11.5; // 11.50% p.a.
export const PROCESSING_FEE_PERCENT = 2.0; // 2.00%
export const GST_RATE = 0.18; // 18% GST on processing fees

export const STEPS_CONFIG: readonly StepMetadata[] = [
  {
    id: 'basic_details',
    stepNumber: 1,
    title: 'Personal Details',
    shortTitle: 'Personal',
    subtitle: 'Verify primary identity and mobile number via instant OTP',
    category: 'Personal',
    isMandatory: true,
  },
  {
    id: 'kyc_verification',
    stepNumber: 2,
    title: 'KYC & Identity',
    shortTitle: 'KYC',
    subtitle: 'NSDL PAN cross-check and UIDAI Aadhaar e-KYC authentication',
    category: 'KYC',
    isMandatory: true,
  },
  {
    id: 'employment_income',
    stepNumber: 3,
    title: 'Employment & Income',
    shortTitle: 'Income',
    subtitle: 'Employment status, monthly net earnings, and employer credentials',
    category: 'Financial',
    isMandatory: true,
  },
  {
    id: 'loan_requirement',
    stepNumber: 4,
    title: 'Loan Customization',
    shortTitle: 'Loan Terms',
    subtitle: 'Loan amount, tenure, purpose, and Key Fact Statement (KFS)',
    category: 'Financial',
    isMandatory: true,
  },
  {
    id: 'address_details',
    stepNumber: 5,
    title: 'Residential Address',
    shortTitle: 'Address',
    subtitle: 'Current and permanent residential proof with PIN code auto-fill',
    category: 'Personal',
    isMandatory: true,
  },
  {
    id: 'bank_verification',
    stepNumber: 6,
    title: 'Bank & Disbursal',
    shortTitle: 'Bank Account',
    subtitle: 'Disbursal bank account IFSC check and e-NACH auto-debit setup',
    category: 'Verification',
    isMandatory: true,
  },
  {
    id: 'document_upload',
    stepNumber: 7,
    title: 'Document Upload',
    shortTitle: 'Documents',
    subtitle: 'Salary slip / bank statement verification and geotagged selfie',
    category: 'Verification',
    isMandatory: true,
  },
  {
    id: 'review_consent',
    stepNumber: 8,
    title: 'Review & e-Sign',
    shortTitle: 'e-Sign & Submit',
    subtitle: 'RBI Fair Practices review, credit bureau pull consent, and digital OTP signature',
    category: 'Approval',
    isMandatory: true,
  },
];

export const LOAN_PURPOSE_OPTIONS = [
  { value: 'medical_emergency', label: 'Medical Emergency / Healthcare' },
  { value: 'debt_consolidation', label: 'Debt Consolidation / Credit Card Payoff' },
  { value: 'home_renovation', label: 'Home Renovation / Improvement' },
  { value: 'education', label: 'Higher Education / Certification' },
  { value: 'wedding_family_event', label: 'Wedding / Family Occasion' },
  { value: 'business_expansion', label: 'Small Business Working Capital' },
  { value: 'vehicle_purchase', label: 'Two-Wheeler / Pre-owned Car' },
  { value: 'travel_vacation', label: 'Family Travel / Relocation' },
  { value: 'other', label: 'Other Personal Requirement' },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  {
    value: 'salaried',
    label: 'Salaried Professional',
    description: 'Working in Private Ltd, Public Ltd, MNC, or Government org',
  },
  {
    value: 'self_employed_professional',
    label: 'Self-Employed Professional',
    description: 'Doctors, Chartered Accountants, Lawyers, Architects, Consultants',
  },
  {
    value: 'business_owner',
    label: 'Business Owner / Trader',
    description: 'Proprietorship, Partnership, or SME Enterprise owner',
  },
] as const;

export const SALARY_MODE_OPTIONS = [
  { value: 'bank_transfer', label: 'Direct Bank NEFT / RTGS' },
  { value: 'cheque', label: 'Company Cheque Deposit' },
  { value: 'cash', label: 'Cash In Hand' },
] as const;

export const RESIDENCE_TYPE_OPTIONS = [
  { value: 'owned_self', label: 'Self Owned Property' },
  { value: 'owned_family', label: 'Owned by Parents / Spouse' },
  { value: 'rented', label: 'Rented with Agreement' },
  { value: 'company_provided', label: 'Company Provided Accommodation' },
] as const;

export const RBI_STATUTORY_DISCLOSURE = {
  nbfcName: 'LendSwift Financial Services India Private Limited',
  registrationNumber: 'RBI Reg. No: B-14.03212',
  category: 'Non-Banking Financial Company - Investment and Credit Company (NBFC-ICC)',
  grievanceEmail: 'grievance.officer@lendswift.in',
  complianceNodalOfficer: 'Shri Rajesh K. Sharma (Nodal Grievance Redressal Officer)',
  nodalContact: '+91 22 6987 4000',
  registeredOffice: 'LendSwift Tower, Level 7, Bandra-Kurla Complex (BKC), Mumbai, Maharashtra - 400051',
  fairPracticesCodeUrl: 'https://lendswift.in/fair-practices-code',
  rbiDigitalLendingCompliance: 'Compliant with RBI/2022-23/111 DOR.CRE.REC.66/21.07.001/2022-23',
} as const;

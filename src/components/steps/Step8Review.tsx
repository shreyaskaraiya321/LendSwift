import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Checkbox } from '@/components/common/Checkbox';
import { isStep6Visible } from '@/components/wizard/stepRegistry';
import { LoanApplicationData, UploadedFileMetadata } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';
import {
  BUSINESS_LOAN_RATE,
  calculateEmi,
  calculateProcessingFee,
  calculateTotalCostOfBorrowing,
  GST_RATE,
  HOME_LOAN_RATE,
  isAffordable,
  PERSONAL_LOAN_RATE,
} from '@/utils/emiCalculator';
import {
  formatAadhaar,
  formatDateIndian,
  formatFileSize,
  formatIndianCurrency,
  formatMobile,
  formatPan,
} from '@/utils/formatters';

export interface Step8ReviewProps extends Partial<StepViewProps> {
  onEditStep?: (stepNumber: number) => void;
  onFinalSubmit?: (referenceNumber: string) => void;
}

export function Step8Review({ onEditStep, onFinalSubmit }: Step8ReviewProps) {
  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const formData = watch();

  // Accordion expansion state for granular step reviews
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
    step7: true,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const toggleAllSections = (expand: boolean) => {
    setOpenSections({
      step1: expand,
      step2: expand,
      step3: expand,
      step4: expand,
      step5: expand,
      step6: expand,
      step7: expand,
    });
  };

  // Submission & Success Modal State
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedRefId, setGeneratedRefId] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // 1. Live Pre-Approval Computations (RBI Key Fact Statement)
  const loanType = formData.loanType || 'Personal';
  const loanAmount = Number(formData.loanAmount) || 250000;
  const tenureMonths = Number(formData.loanTenure || formData.tenureMonths) || 24;

  const applicableRate =
    loanType === 'Home'
      ? HOME_LOAN_RATE
      : loanType === 'Business'
      ? BUSINESS_LOAN_RATE
      : PERSONAL_LOAN_RATE;

  const estimatedEmi = calculateEmi(loanAmount, applicableRate, tenureMonths);
  const totalInterestPayable = calculateTotalCostOfBorrowing(loanAmount, applicableRate, tenureMonths);
  const processingFee = calculateProcessingFee(loanAmount);
  const gstOnProcessingFee = Math.round(processingFee * GST_RATE);
  const totalProcessingCharges = processingFee + gstOnProcessingFee;
  const netDisbursal = Math.max(0, loanAmount - totalProcessingCharges);
  const totalRepayment = estimatedEmi * tenureMonths;

  // Affordability Meter Computation
  const primaryIncome =
    formData.employmentType === 'Salaried' || formData.employmentType === 'salaried'
      ? Number(formData.monthlyNetSalary || formData.monthlyNetIncome) || 0
      : Number(formData.monthlyIncome || (formData.annualTurnover ? Math.round(formData.annualTurnover / 12) : 0) || formData.monthlyNetIncome) || 0;

  const coApplicantIncome = Number(formData.coApplicantIncome) || 0;
  const totalHouseholdIncome = primaryIncome + coApplicantIncome;
  const dtiRatio = totalHouseholdIncome > 0 ? (estimatedEmi / totalHouseholdIncome) * 100 : 0;
  const hasHealthyAffordability = isAffordable(estimatedEmi, totalHouseholdIncome);

  // 4 Mandatory RBI Consents
  const consentAccuracy = Boolean(watch('consentInformationAccuracy'));
  const consentBureau = Boolean(watch('consentCreditBureau'));
  const consentKfs = Boolean(watch('consentTermsKfs'));
  const consentComm = Boolean(watch('consentRegulatoryComm'));

  const allConsentsChecked = consentAccuracy && consentBureau && consentKfs && consentComm;

  // Handle Edit Step Smooth Navigation
  const handleEditClick = (stepNum: number) => {
    if (onEditStep) {
      onEditStep(stepNum);
    }
  };

  // Client-Side UUID Generation & Submission
  const handleSubmitApplication = async () => {
    if (!allConsentsChecked || isSubmittingLocal) return;

    setIsSubmittingLocal(true);

    try {
      // Generate client-side UUID reference
      const rawUuid =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

      const shortUuid = rawUuid.replace(/-/g, '').slice(0, 8).toUpperCase();
      const refNumber = `LS-${Date.now().toString().slice(-6)}-${shortUuid}`;

      setGeneratedRefId(refNumber);
      setValue('applicationReferenceNumber', refNumber);
      setValue('submissionTimestamp', new Date().toISOString());

      // Purge encrypted draft from localStorage
      try {
        localStorage.removeItem(`lendswift_draft_${loanType}`);
        localStorage.removeItem('lendswift_draft_Personal');
        localStorage.removeItem('lendswift_draft_Home');
        localStorage.removeItem('lendswift_draft_Business');
        localStorage.removeItem('lendswift_wizard_state');
        window.dispatchEvent(new CustomEvent('lendswift:draft-cleared'));
      } catch {
        // ignore localStorage errors
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      setShowSuccessModal(true);
      if (onFinalSubmit) {
        onFinalSubmit(refNumber);
      }
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const handleCopyReference = () => {
    if (generatedRefId) {
      navigator.clipboard.writeText(generatedRefId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleStartNewApplication = () => {
    setShowSuccessModal(false);
    reset();
    if (onEditStep) {
      onEditStep(1);
    } else {
      window.location.reload();
    }
  };

  const hasStep6 = isStep6Visible(formData) || Boolean(formData.coApplicantName);

  return (
    <div className="space-y-8 animate-fadeIn" data-testid="step-8-review">
      {/* Step Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Pre-Approval Review & Regulatory Execution
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Review your RBI Key Fact Statement, verify all submitted details, and grant statutory final consents.
            </p>
          </div>

          <Badge variant="primary" size="md">
            Final Step &bull; Sanction Review
          </Badge>
        </div>
      </div>

      {/* 1. Pre-Approval Summary Card (RBI Key Fact Statement - KFS) */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 rounded-2xl p-6 sm:p-7 text-white shadow-lg space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-primary-200 uppercase font-semibold block">
              RBI Statutory Disclosure &bull; Annexure A
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Key Fact Statement (KFS) Pre-Approval Sanction
            </h3>
          </div>
          <Badge variant="success" size="sm">
            Instant In-Principle Sanction
          </Badge>
        </div>

        {/* Core Financial Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-primary-200 font-medium block">Sanction Amount</span>
            <span className="text-base sm:text-lg font-extrabold text-white block mt-1">
              {formatIndianCurrency(loanAmount)}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-primary-200 font-medium block">Tenure</span>
            <span className="text-base sm:text-lg font-extrabold text-white block mt-1">
              {tenureMonths} Months
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-primary-200 font-medium block">Applicable Rate</span>
            <span className="text-base sm:text-lg font-extrabold text-white block mt-1">
              {applicableRate}% <span className="text-xs font-normal text-primary-200">p.a.</span>
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-primary-200 font-medium block">Monthly EMI</span>
            <span className="text-base sm:text-lg font-extrabold text-white block mt-1">
              {formatIndianCurrency(estimatedEmi)}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-primary-200 font-medium block">Total Interest</span>
            <span className="text-base sm:text-lg font-extrabold text-white block mt-1">
              {formatIndianCurrency(totalInterestPayable)}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-primary-200 font-medium block">Processing Fee</span>
            <span className="text-base sm:text-lg font-extrabold text-white block mt-1">
              {formatIndianCurrency(processingFee)} <span className="text-[10px] text-primary-300 font-normal">+GST</span>
            </span>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-xs text-primary-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 divide-x divide-white/10">
            <div>
              <span className="text-[11px] text-primary-300 block">Total Repayment Amount:</span>
              <strong className="text-white text-sm font-bold">{formatIndianCurrency(totalRepayment)}</strong>
            </div>
            <div className="pl-6">
              <span className="text-[11px] text-primary-300 block">Net Disbursal to Bank:</span>
              <strong className="text-white text-sm font-bold">{formatIndianCurrency(netDisbursal)}</strong>
            </div>
          </div>
          <span className="text-[11px] text-primary-300">
            Computed using reducing-balance amortization under RBI Digital Lending Norms 2022
          </span>
        </div>

        {/* Live Affordability Meter */}
        <div className="pt-1">
          {hasHealthyAffordability ? (
            <div className="bg-success-900/40 border border-success-400/40 rounded-xl p-3.5 flex items-start gap-3 text-xs">
              <span className="w-5 h-5 rounded-full bg-success-500/20 text-success-300 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <p className="font-bold text-success-200">
                  Affordability Check: Healthy (EMI is {dtiRatio.toFixed(1)}% of Declared Household Income)
                </p>
                <p className="text-success-300/90 text-[11px] mt-0.5">
                  Your estimated monthly EMI of {formatIndianCurrency(estimatedEmi)} is well within the recommended 50% Debt-to-Income (DTI) ceiling based on your total household earnings of {formatIndianCurrency(totalHouseholdIncome)}/month.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-warning-900/50 border border-warning-400/60 rounded-xl p-3.5 flex items-start gap-3 text-xs">
              <span className="w-5 h-5 rounded-full bg-warning-500/20 text-warning-300 flex items-center justify-center shrink-0 font-bold mt-0.5">
                !
              </span>
              <div>
                <p className="font-bold text-warning-200">
                  Affordability Caution: High Debt-to-Income Ratio ({dtiRatio.toFixed(1)}%)
                </p>
                <p className="text-warning-300/90 text-[11px] mt-0.5">
                  Your estimated EMI of {formatIndianCurrency(estimatedEmi)} exceeds 50% of your total declared monthly household income ({formatIndianCurrency(totalHouseholdIncome)}). While you may still submit your application, our credit committee may adjust tenure or request collateral to safeguard credit health.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Granular Accordion Review (Steps 1 to 7) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
              Application Particulars (Steps 1 to 7)
            </h3>
            <p className="text-xs text-neutral-500">
              Verify all entered information. Click any "Edit" button to modify details before final submission.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAllSections(true)}
              className="text-xs text-primary-800 font-semibold hover:underline"
            >
              Expand All
            </button>
            <span className="text-neutral-300">&bull;</span>
            <button
              type="button"
              onClick={() => toggleAllSections(false)}
              className="text-xs text-neutral-500 font-semibold hover:underline"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Accordion Item 1: Loan Terms */}
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection('step1')}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-sm font-bold text-neutral-900">Loan Terms & Category Selection</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(1);
                }}
              >
                Edit
              </Button>
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                  openSections.step1 ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {openSections.step1 && (
            <div className="p-4 pt-0 border-t border-neutral-100 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-neutral-400 block">Loan Category:</span>
                <strong className="text-neutral-900">{loanType} Loan</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Loan Amount:</span>
                <strong className="text-neutral-900">{formatIndianCurrency(loanAmount)}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Repayment Tenure:</span>
                <strong className="text-neutral-900">{tenureMonths} Months</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Loan Purpose:</span>
                <strong className="text-neutral-900">{formData.loanPurpose || 'General Needs'}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Referral Code:</span>
                <strong className="text-neutral-900">{formData.referralCode || 'None'}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Item 2: Personal Information */}
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection('step2')}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-sm font-bold text-neutral-900">Personal Information & Age Gate</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(2);
                }}
              >
                Edit
              </Button>
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                  openSections.step2 ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {openSections.step2 && (
            <div className="p-4 pt-0 border-t border-neutral-100 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-neutral-400 block">Full Legal Name:</span>
                <strong className="text-neutral-900">{formData.fullName}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Date of Birth:</span>
                <strong className="text-neutral-900">{formatDateIndian(formData.dob || formData.dateOfBirth)}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Gender & Marital Status:</span>
                <strong className="text-neutral-900 capitalize">{formData.gender} &bull; {formData.maritalStatus}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Primary Mobile:</span>
                <strong className="text-neutral-900">{formatMobile(formData.mobileNumber)}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Email Address:</span>
                <strong className="text-neutral-900">{formData.email}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Parents' Names:</span>
                <strong className="text-neutral-900">{formData.fatherName || '—'} / {formData.motherName || '—'}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Item 3: Statutory KYC & Identity Verification */}
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection('step3')}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-sm font-bold text-neutral-900">Statutory KYC & Government ID</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(3);
                }}
              >
                Edit
              </Button>
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                  openSections.step3 ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {openSections.step3 && (
            <div className="p-4 pt-0 border-t border-neutral-100 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-neutral-400 block">PAN Card Number:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <strong className="text-neutral-900">{formatPan(formData.panNumber, true)}</strong>
                  {formData.isPanVerified && <Badge variant="success" size="sm">Verified</Badge>}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 block">Aadhaar (UIDAI):</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <strong className="text-neutral-900">{formatAadhaar(formData.aadhaarNumber, true)}</strong>
                  {formData.isAadhaarVerified && <Badge variant="success" size="sm">Verhoeff Valid</Badge>}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 block">Secondary ID:</span>
                <strong className="text-neutral-900">{formData.passportNumber || formData.voterId || 'None required'}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Item 4: Residential Address */}
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection('step4')}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                4
              </span>
              <span className="text-sm font-bold text-neutral-900">Residential Address & Verification</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(4);
                }}
              >
                Edit
              </Button>
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                  openSections.step4 ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {openSections.step4 && (
            <div className="p-4 pt-0 border-t border-neutral-100 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 block">Current Address:</span>
                <strong className="text-neutral-900">
                  {formData.currentAddressLine1 || formData.currentAddress?.line1}
                  {formData.currentAddressLine2 ? `, ${formData.currentAddressLine2}` : ''}
                  , {formData.city || formData.currentAddress?.city}, {formData.state || formData.currentAddress?.state} - {formData.pincode || formData.currentAddress?.pincode}
                </strong>
                <span className="text-neutral-500 block mt-0.5">
                  Type: {formData.residenceType} &bull; Stayed: {formData.yearsAtAddress || formData.currentAddress?.yearsAtCurrentAddress} Years
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Permanent Address:</span>
                <strong className="text-neutral-900">
                  {formData.sameAsPermanent || formData.isPermanentSameAsCurrent
                    ? 'Same as Current Address'
                    : `${formData.permanentAddressLine1 || formData.permanentAddress?.line1 || ''}, ${formData.permanentCity || formData.permanentAddress?.city || ''} - ${formData.permanentPincode || formData.permanentAddress?.pincode || ''}`}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Item 5: Employment & Income */}
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection('step5')}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                5
              </span>
              <span className="text-sm font-bold text-neutral-900">Employment & Income Assessment</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(5);
                }}
              >
                Edit
              </Button>
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                  openSections.step5 ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {openSections.step5 && (
            <div className="p-4 pt-0 border-t border-neutral-100 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-neutral-400 block">Employment Type:</span>
                <strong className="text-neutral-900">{formData.employmentType}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Organization / Business:</span>
                <strong className="text-neutral-900">{formData.companyName || formData.businessName || formData.employerName || '—'}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Declared Monthly Earnings:</span>
                <strong className="text-primary-800 font-bold">{formatIndianCurrency(primaryIncome)} / month</strong>
              </div>
              {formData.designation && (
                <div>
                  <span className="text-neutral-400 block">Designation:</span>
                  <strong className="text-neutral-900">{formData.designation}</strong>
                </div>
              )}
              {formData.gstNumber && (
                <div>
                  <span className="text-neutral-400 block">GST Number:</span>
                  <strong className="text-neutral-900 font-mono">{formData.gstNumber}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion Item 6: Co-Applicant Details (Conditional) */}
        {hasStep6 && (
          <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
            <div
              onClick={() => toggleSection('step6')}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                  6
                </span>
                <span className="text-sm font-bold text-neutral-900">Co-Applicant & Guarantor Details</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(6);
                  }}
                >
                  Edit
                </Button>
                <svg
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                    openSections.step6 ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {openSections.step6 && (
              <div className="p-4 pt-0 border-t border-neutral-100 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-neutral-400 block">Co-Applicant Name:</span>
                  <strong className="text-neutral-900">{formData.coApplicantName}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Relationship:</span>
                  <strong className="text-neutral-900">{formData.relationship}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Co-Applicant PAN:</span>
                  <strong className="text-neutral-900">{formatPan(formData.coApplicantPan, true)}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Monthly Income:</span>
                  <strong className="text-neutral-900">{formatIndianCurrency(formData.coApplicantIncome)}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accordion Item 7: Uploaded Documents & E-Signature Preview */}
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <div
            onClick={() => toggleSection('step7')}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                7
              </span>
              <span className="text-sm font-bold text-neutral-900">Document Uploads & Digital E-Signature</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(7);
                }}
              >
                Edit
              </Button>
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                  openSections.step7 ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {openSections.step7 && (
            <div className="p-4 pt-0 border-t border-neutral-100 text-xs space-y-4">
              {/* Document List */}
              <div className="space-y-2">
                <span className="text-neutral-500 font-bold uppercase tracking-wider block text-[11px]">
                  Uploaded Statutory Proofs:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'PAN Card Copy', doc: formData.docPanCard },
                    { label: 'Aadhaar Card (Front)', doc: formData.docAadhaarFront },
                    { label: 'Aadhaar Card (Back)', doc: formData.docAadhaarBack },
                    { label: 'Salary Slips (3 Mos)', doc: formData.docSalarySlips },
                    { label: 'ITR Returns (2 Yrs)', doc: formData.docItrReturns },
                    { label: 'Property Title Documents', doc: formData.docPropertyDocs },
                    { label: 'Business Reg / GST', doc: formData.docBusinessRegistration },
                  ]
                    .filter(({ doc }) => Boolean(doc))
                    .map(({ label, doc }) => {
                      const file = doc as UploadedFileMetadata;
                      return (
                        <div
                          key={label}
                          className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg border border-neutral-200"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-neutral-800 block truncate">{label}</span>
                            <span className="text-[10px] text-neutral-500 font-mono truncate block">{file.name}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-medium shrink-0">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Captured Digital E-Signature Preview */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-neutral-500 font-bold uppercase tracking-wider block text-[11px] mb-2">
                  Borrower Digital E-Signature:
                </span>
                {formData.digitalSignature ? (
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg border border-neutral-300 inline-block shadow-xs">
                      <img
                        src={formData.digitalSignature}
                        alt="Captured Borrower Digital E-Signature"
                        className="h-16 w-48 object-contain"
                      />
                    </div>
                    <div className="text-[11px] text-neutral-500 space-y-0.5">
                      <p className="font-semibold text-success-700 flex items-center gap-1">
                        <span>✓</span> Digitally Captured & Sealed
                      </p>
                      <p>Legally enforceable under Information Technology Act 2000</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-danger-600 font-medium">Signature missing. Please return to Step 7 to sign.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Mandatory RBI Consents */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Mandatory Statutory Declarations & Consents
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Under RBI Digital Lending Directives, each consent must be explicitly granted before contract execution.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Consent 1: Information Accuracy */}
          <Checkbox
            label="1. Information Accuracy & Truthfulness Declaration"
            description="I solemnly declare that all personal particulars, KYC documents, employment details, and income declarations provided across this application are complete, true, and authentic."
            {...register('consentInformationAccuracy')}
            error={errors.consentInformationAccuracy?.message}
          />

          {/* Consent 2: Credit Bureau Pull */}
          <Checkbox
            label="2. Credit Information Companies (CIC) Bureau Pull Authorization"
            description="I authorize LendSwift to access, retrieve, and evaluate my comprehensive credit history from TransUnion CIBIL, Equifax, Experian, and CRIF High Mark pursuant to Section 21 of the CICRA Act 2005."
            {...register('consentCreditBureau')}
            error={errors.consentCreditBureau?.message}
          />

          {/* Consent 3: Terms & KFS Acceptance */}
          <Checkbox
            label="3. Loan Agreement, Fair Practices Code & Key Fact Statement (KFS) Acceptance"
            description="I have carefully reviewed the Key Fact Statement, including the annual interest rate, processing charges, APR, and reducing-balance repayment schedule. I accept the NBFC Fair Practices Code and terms of the loan agreement."
            {...register('consentTermsKfs')}
            error={errors.consentTermsKfs?.message}
          />

          {/* Consent 4: Regulatory Communications */}
          <Checkbox
            label="4. Electronic Regulatory Communications & Disclosures Consent"
            description="I consent to receive electronic regulatory disclosures, repayment demand notices, statement of accounts, and loan execution agreements via SMS, WhatsApp, and registered email."
            {...register('consentRegulatoryComm')}
            error={errors.consentRegulatoryComm?.message}
          />
        </div>
      </div>

      {/* 4. Submission Action Card */}
      <div className="bg-primary-50/60 rounded-xl border border-primary-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-primary-950">Ready to Submit Application?</h4>
          <p className="text-xs text-neutral-600 mt-0.5">
            {allConsentsChecked
              ? 'All 4 statutory consents verified. Clicking submit will execute your digital loan contract.'
              : 'Please check all 4 mandatory regulatory consent boxes above to enable final submission.'}
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleSubmitApplication}
          disabled={!allConsentsChecked || isSubmittingLocal}
          isLoading={isSubmittingLocal}
          className="w-full sm:w-auto shrink-0 shadow-md min-w-[200px]"
        >
          Submit Application
        </Button>
      </div>

      {/* 5. Success Confirmation Modal Dialog */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 text-center space-y-6 relative">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-success-50 text-success-600 flex items-center justify-center mx-auto ring-8 ring-success-50/60">
              <svg className="w-8 h-8 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Modal Heading & Status */}
            <div>
              <Badge variant="success" size="md">
                Conditionally Approved &bull; Instant Sanction
              </Badge>
              <h3 id="success-modal-title" className="text-2xl font-black text-neutral-900 mt-3 tracking-tight">
                Application Successfully Submitted!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto">
                Congratulations, <strong className="text-neutral-900">{formData.fullName}</strong>. Your loan application has been executed with your digital signature and dispatched to automated underwriting.
              </p>
            </div>

            {/* Application ID Card with Copy Button */}
            <div className="bg-primary-50/70 rounded-xl p-4 border border-primary-200 text-left space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-primary-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary-700 tracking-wider block">
                    Application Reference Number
                  </span>
                  <span className="text-sm font-mono font-extrabold text-primary-950 block mt-0.5">
                    {generatedRefId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-white text-primary-800 border border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  {isCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Sanction Amount:</span>
                  <strong className="text-neutral-900 font-bold">{formatIndianCurrency(loanAmount)}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Monthly EMI:</span>
                  <strong className="text-primary-800 font-bold">{formatIndianCurrency(estimatedEmi)} / mo</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Tenure & Rate:</span>
                  <strong className="text-neutral-900">{tenureMonths} Mos @ {applicableRate}%</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Disbursal Timeline:</span>
                  <strong className="text-success-700 font-bold">Within 2 Banking Hours</strong>
                </div>
              </div>
            </div>

            {/* Informational Assurance Notice */}
            <Alert variant="info" title="What happens next?">
              Our automated underwriting engine has verified your credit bureau record. A copy of the Key Fact Statement and loan agreement has been dispatched to {formData.email}.
            </Alert>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => window.print()}
                className="w-full sm:w-auto"
              >
                Print / Download Summary (PDF)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleStartNewApplication}
                className="w-full sm:w-auto"
              >
                Start New Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step8Review;

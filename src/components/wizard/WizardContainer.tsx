import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
  Step1LoanType,
  Step2PersonalInfo,
  Step3KYC,
  Step4Address,
  Step5Employment,
  Step6CoApplicant,
  Step7Documents,
  Step8ReviewConsent,
} from '@/components/steps';
import { ProgressBar } from '@/components/wizard/ProgressBar';
import { ResumeDraftModal } from '@/components/wizard/ResumeDraftModal';
import { StepNavigation } from '@/components/wizard/StepNavigation';
import { getNextVisibleStep, getPreviousVisibleStep, STEPS } from '@/components/wizard/stepRegistry';
import { StepSummary } from '@/components/wizard/StepSummary';
import { BASE_INTEREST_RATE, DEFAULT_TENURE_MONTHS } from '@/constants/loanConstants';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useWizardPersistence } from '@/hooks/useWizardPersistence';
import { loanApplicationSchema } from '@/schemas/loanSchema';
import { getStepFields } from '@/schemas/schemaFactory';
import { LoanApplicationData } from '@/types/loan';
import { StepNumber } from '@/types/wizard';
import { formatIndianCurrency } from '@/utils/formatters';

const DEFAULT_FORM_VALUES: Partial<LoanApplicationData> = {
  loanType: 'Personal',
  loanAmount: 300000,
  loanTenure: 36,
  loanPurpose: 'Debt Consolidation',
  referralCode: '',
  fullName: '',
  dob: '',
  dateOfBirth: '',
  gender: 'male',
  maritalStatus: 'single',
  fatherName: '',
  motherName: '',
  email: '',
  isEmailVerified: false,
  mobileNumber: '',
  isMobileVerified: false,
  alternateMobile: '',
  panNumber: '',
  aadhaarNumber: '',
  aadhaarConsent: false,
  voterId: '',
  passportNumber: '',
  isPanVerified: false,
  isAadhaarVerified: false,
  currentAddressLine1: '',
  currentAddressLine2: '',
  pincode: '',
  city: '',
  state: '',
  residenceType: 'Owned',
  yearsAtAddress: 3,
  monthlyRentAmount: undefined,
  previousAddressLine: '',
  sameAsPermanent: true,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentPincode: '',
  permanentCity: '',
  permanentState: '',
  employmentType: 'Salaried',
  companyName: '',
  designation: '',
  monthlyNetSalary: undefined,
  yearsOfExperience: undefined,
  businessName: '',
  businessType: '',
  annualTurnover: undefined,
  yearsInBusiness: undefined,
  monthlyIncome: undefined,
  gstNumber: '',
  businessAddress: '',
  coApplicantName: '',
  relationship: 'Spouse',
  coApplicantPan: '',
  coApplicantIncome: undefined,
  coApplicantConsent: false,
  isCoApplicantPanVerified: false,
  digiLockerConsent: false,
  ckycConsent: false,
  employerName: '',
  monthlyNetIncome: 75000,
  salaryCreditMode: 'bank_transfer',
  totalWorkExperienceMonths: 36,
  existingMonthlyEmi: 0,
  tenureMonths: DEFAULT_TENURE_MONTHS,
  acceptedInterestRate: BASE_INTEREST_RATE,
  calculatedEmi: 11708,
  keyFactStatementAcknowledged: false,
  currentAddress: {
    line1: '',
    pincode: '',
    city: '',
    state: '',
    residenceType: 'owned_self',
    yearsAtCurrentAddress: 3,
  },
  isPermanentSameAsCurrent: true,
  bankAccountNumber: '',
  confirmBankAccountNumber: '',
  ifscCode: '',
  bankName: '',
  branchName: '',
  accountType: 'savings',
  accountHolderName: '',
  eNachAutoDebitConsent: false,
  incomeProofType: 'salary_slip_3_months',
  incomeProofFileName: '',
  bankStatementFileName: '',
  selfieVerificationConsent: false,
  geolocationConsent: false,
  docPanCard: null,
  docAadhaarFront: null,
  docAadhaarBack: null,
  docSalarySlips: null,
  docItrReturns: null,
  docPropertyDocs: null,
  docBusinessRegistration: null,
  digitalSignature: '',
  cibilScoreConsent: false,
  rbiFairPracticesConsent: false,
  privacyPolicyConsent: false,
  eSignOtpVerified: false,
};


export function WizardContainer() {
  const { initialData, persistedStep, hasExistingDraft, saveCurrentStep, clearPersistence } =
    useWizardPersistence();

  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<StepNumber>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionReference, setSubmissionReference] = useState<string>('');
  const [showResumeModal, setShowResumeModal] = useState(false);

  const stepContainerRef = useRef<HTMLDivElement>(null);

  const methods = useForm<LoanApplicationData>({
    resolver: zodResolver(loanApplicationSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT_FORM_VALUES as LoanApplicationData,
  });

  const { trigger, reset, getValues, watch } = methods;
  const formData = watch();

  // Prompt user with ResumeDraftModal if existing draft detected
  useEffect(() => {
    if (hasExistingDraft && initialData && persistedStep > 1) {
      setShowResumeModal(true);
    }
  }, [hasExistingDraft, initialData, persistedStep]);

  // Debounced auto-save hook
  const { autoSaveState, clearDraft, forceSave } = useAutoSave(formData, {
    enabled: !isSubmitted,
    debounceMs: 1000,
  });

  const handleResumeDraft = () => {
    if (initialData) {
      reset({ ...DEFAULT_FORM_VALUES, ...initialData } as LoanApplicationData);
      setCurrentStep(persistedStep);
      const restoredCompleted = new Set<StepNumber>();
      for (let i = 1; i < persistedStep; i++) {
        restoredCompleted.add(i as StepNumber);
      }
      setCompletedSteps(restoredCompleted);
    }
    setShowResumeModal(false);
  };

  const handleStartFresh = () => {
    clearPersistence();
    clearDraft();
    reset(DEFAULT_FORM_VALUES as LoanApplicationData);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setShowResumeModal(false);
  };

  const handleNextStep = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const fieldsToValidate = getStepFields(currentStep) as (keyof LoanApplicationData)[];
    const isStepValid = await trigger(fieldsToValidate);

    if (!isStepValid) {
      setIsSubmitting(false);
      return;
    }

    // Step 3 Gating: Both PAN and Aadhaar must pass verification before navigating to Step 4
    if (currentStep === 3) {
      const isPanVerified = Boolean(getValues('isPanVerified'));
      const isAadhaarVerified = Boolean(getValues('isAadhaarVerified'));

      if (!isPanVerified || !isAadhaarVerified) {
        if (!isPanVerified) {
          methods.setError('panNumber', {
            type: 'manual',
            message: 'PAN verification is mandatory before proceeding to Step 4',
          });
        }
        if (!isAadhaarVerified) {
          methods.setError('aadhaarNumber', {
            type: 'manual',
            message: 'Aadhaar Verhoeff validation is mandatory before proceeding to Step 4',
          });
        }
        setIsSubmitting(false);
        return;
      }
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    if (currentStep < 8) {
      const nextStep = getNextVisibleStep(currentStep, formData) as StepNumber;
      setCurrentStep(nextStep);
      saveCurrentStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 8 Final Submission
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const ref = getValues('applicationReferenceNumber') || `LS-${Date.now().toString().slice(-8)}`;
      setSubmissionReference(ref);
      setIsSubmitted(true);
      clearPersistence();
      clearDraft();
    }

    setIsSubmitting(false);
  };

  const handlePreviousStep = () => {
    if (isSubmitting) return;
    if (currentStep > 1) {
      const prevStep = getPreviousVisibleStep(currentStep, formData) as StepNumber;
      setCurrentStep(prevStep);
      saveCurrentStep(prevStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = async (targetStep: number) => {
    if (isSubmitting) return;
    const target = targetStep as StepNumber;
    if (target < currentStep) {
      setCurrentStep(target);
      saveCurrentStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === currentStep + 1) {
      await handleNextStep();
    }
  };

  const handleResetApplication = () => {
    clearPersistence();
    clearDraft();
    reset(DEFAULT_FORM_VALUES as LoanApplicationData);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setIsSubmitted(false);
    setSubmissionReference('');
  };

  // Render Successful Submission Screen
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <Card className="text-center p-8 sm:p-12 border-success-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-success-50 text-success-600 flex items-center justify-center mx-auto ring-8 ring-success-50/50">
            <svg className="w-8 h-8 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <Badge variant="success" size="md">
              Application Underwritten & Sanctioned
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-3">
              Congratulations, {formData.fullName}!
            </h1>
            <p className="text-sm text-neutral-600 mt-2 max-w-lg mx-auto">
              Your digital loan application has been successfully executed with Aadhaar e-Sign and routed to our automated NBFC disbursal engine.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-fintech p-5 border border-neutral-200 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-200">
              <span className="text-neutral-500">Application Reference</span>
              <span className="font-mono font-bold text-neutral-900">{submissionReference}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200">
              <span className="text-neutral-500">Sanctioned Loan Amount</span>
              <span className="font-bold text-neutral-900">{formatIndianCurrency(formData.loanAmount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200">
              <span className="text-neutral-500">Repayment EMI</span>
              <span className="font-bold text-primary-800">{formatIndianCurrency(formData.calculatedEmi)} / month</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Disbursal Destination</span>
              <span className="font-bold text-neutral-900">{formData.bankName}</span>
            </div>
          </div>

          <Alert variant="info" title="Next Steps & Disbursal Timeline">
            RTGS fund credit will reflect in your verified account within 2 banking hours. A digital copy of your RBI Key Fact Statement has been dispatched to {formData.email}.
          </Alert>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => alert(`Sanction Letter [${submissionReference}] downloaded successfully.`)}
            >
              Download Sanction Letter (PDF)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleResetApplication}
            >
              Start New Application
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentMetadata = STEPS[currentStep - 1] || STEPS[0];

  return (
    <FormProvider {...methods}>
      {/* Resume Draft Accessible Modal Dialog */}
      <ResumeDraftModal
        isOpen={showResumeModal}
        stepNumber={persistedStep}
        stepTitle={STEPS.find((s) => s.stepNumber === persistedStep)?.title}
        lastSaved={autoSaveState.lastSavedAt}
        loanType={formData.loanPurpose}
        onResume={handleResumeDraft}
        onStartFresh={handleStartFresh}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Draft Notice if resumed */}
        {hasExistingDraft && autoSaveState.lastSavedAt && !showResumeModal && (
          <Alert
            variant="info"
            title="Application Draft Restored"
            action={
              <button
                type="button"
                onClick={handleResetApplication}
                className="text-xs text-primary-800 font-bold underline hover:text-primary-900"
              >
                Clear & Restart
              </button>
            }
          >
            Resumed your in-progress application from your previous session.
          </Alert>
        )}

        {/* Accessible Progress Bar */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={8}
          completedSteps={completedSteps}
          formData={formData}
          onStepClick={handleStepClick}
        />

        {/* Main Work Area: Step Form + Sidebar */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Main Step Form Card */}
          <main className="flex-1 w-full">
            <Card className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                  {currentMetadata.shortTitle} Assessment
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  Step {currentStep} of {STEPS.length}
                </span>
              </div>

              {/* Step Dynamic Views with data-step-container for focus management */}
              <div
                ref={stepContainerRef}
                data-step-container="true"
                className="min-h-[380px]"
              >
                {currentStep === 1 && <Step1LoanType />}
                {currentStep === 2 && <Step2PersonalInfo />}
                {currentStep === 3 && <Step3KYC />}
                {currentStep === 4 && <Step4Address />}
                {currentStep === 5 && <Step5Employment />}
                {currentStep === 6 && <Step6CoApplicant />}
                {currentStep === 7 && <Step7Documents />}
                {currentStep === 8 && <Step8ReviewConsent onNext={handleNextStep} onPrevious={handlePreviousStep} />}

              </div>

              {/* Navigation Action Bar */}
              <StepNavigation
                currentStep={currentStep}
                totalSteps={STEPS.length}
                onPrevious={handlePreviousStep}
                onNext={handleNextStep}
                onSaveDraft={forceSave}
                isSubmitting={isSubmitting}
                autoSaveState={autoSaveState}
                stepContainerRef={stepContainerRef}
              />
            </Card>
          </main>

          {/* Sticky Application Summary */}
          <StepSummary formData={formData} />
        </div>
      </div>
    </FormProvider>
  );
}

export default WizardContainer;

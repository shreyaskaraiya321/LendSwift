import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { RBI_STATUTORY_DISCLOSURE } from '@/constants/loanConstants';
import { useKycVerification } from '@/hooks/useKycVerification';
import { LoanApplicationData } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';
import { generateApplicationReference } from '@/utils/crypto';
import { formatAadhaar, formatIndianCurrency, formatMobile, formatPan, maskBankAccount } from '@/utils/formatters';

export function Step8ReviewConsent(_props: StepViewProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const [eSignOtpSent, setESignOtpSent] = useState(false);
  const [eSignOtp, setESignOtp] = useState('');
  const [eSignError, setESignError] = useState<string | null>(null);

  const { sendOtp, isSendingOtp, verifyOtp, isVerifyingOtp } = useKycVerification();

  const formData = watch();
  const eSignOtpVerified = watch('eSignOtpVerified');
  const applicationReferenceNumber = watch('applicationReferenceNumber');

  const handleSendESignOtp = async () => {
    setESignError(null);
    const success = await sendOtp(formData.mobileNumber || '9876543210');
    if (success) {
      setESignOtpSent(true);
    }
  };

  const handleVerifyESignOtp = async () => {
    setESignError(null);
    const valid = await verifyOtp(eSignOtp);
    if (valid) {
      setValue('eSignOtpVerified', true, { shouldValidate: true });
      const refNumber = generateApplicationReference();
      setValue('applicationReferenceNumber', refNumber);
      setValue('submissionTimestamp', new Date().toISOString());
      setESignOtpSent(false);
    } else {
      setESignError('Invalid e-Sign OTP. Enter 6 digits (e.g. 123456)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold text-neutral-900">Application Review & Aadhaar e-Sign</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Review your loan particulars, grant statutory bureau authorization, and digitally execute your agreement.
        </p>
      </div>

      {/* Review Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Personal & Identity Card */}
        <div className="p-4 bg-white rounded-fintech border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <span className="font-bold text-neutral-900">Personal & Identity</span>
            <Badge variant="success" size="sm">
              Verified
            </Badge>
          </div>
          <div className="space-y-1 text-neutral-600">
            <p><span className="text-neutral-400">Name:</span> <strong className="text-neutral-900">{formData.fullName}</strong></p>
            <p><span className="text-neutral-400">PAN:</span> {formatPan(formData.panNumber, true)}</p>
            <p><span className="text-neutral-400">Aadhaar:</span> {formatAadhaar(formData.aadhaarNumber, true)}</p>
            <p><span className="text-neutral-400">Mobile:</span> {formatMobile(formData.mobileNumber)}</p>
            <p><span className="text-neutral-400">Email:</span> {formData.email}</p>
          </div>
        </div>

        {/* Loan Terms & EMI Card */}
        <div className="p-4 bg-primary-50/50 rounded-fintech border border-primary-200 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-primary-200">
            <span className="font-bold text-primary-900">Sanction Terms</span>
            <Badge variant="primary" size="sm">
              Pre-Approved
            </Badge>
          </div>
          <div className="space-y-1 text-neutral-700">
            <p><span className="text-neutral-500">Loan Amount:</span> <strong className="text-neutral-900">{formatIndianCurrency(formData.loanAmount)}</strong></p>
            <p><span className="text-neutral-500">Tenure:</span> {formData.tenureMonths} Months</p>
            <p><span className="text-neutral-500">Interest Rate:</span> {formData.acceptedInterestRate}% p.a. Fixed</p>
            <p><span className="text-neutral-500">Monthly EMI:</span> <strong className="text-primary-800">{formatIndianCurrency(formData.calculatedEmi)}</strong></p>
          </div>
        </div>

        {/* Employment & Residence Card */}
        <div className="p-4 bg-white rounded-fintech border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <span className="font-bold text-neutral-900">Employment & Address</span>
            <span className="text-[11px] text-neutral-500 font-medium">{formData.employmentType}</span>
          </div>
          <div className="space-y-1 text-neutral-600">
            <p><span className="text-neutral-400">Employer:</span> {formData.employerName}</p>
            <p><span className="text-neutral-400">Net Salary:</span> {formatIndianCurrency(formData.monthlyNetIncome)} / month</p>
            <p><span className="text-neutral-400">City / State:</span> {formData.currentAddress?.city}, {formData.currentAddress?.state}</p>
            <p><span className="text-neutral-400">PIN:</span> {formData.currentAddress?.pincode}</p>
          </div>
        </div>

        {/* Disbursal Account Card */}
        <div className="p-4 bg-white rounded-fintech border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <span className="font-bold text-neutral-900">Disbursal Account</span>
            <Badge variant="success" size="sm">
              e-NACH Active
            </Badge>
          </div>
          <div className="space-y-1 text-neutral-600">
            <p><span className="text-neutral-400">Bank:</span> {formData.bankName}</p>
            <p><span className="text-neutral-400">Account:</span> {maskBankAccount(formData.bankAccountNumber)}</p>
            <p><span className="text-neutral-400">IFSC:</span> {formData.ifscCode}</p>
            <p><span className="text-neutral-400">Disbursal Mode:</span> RTGS Instant Settlement</p>
          </div>
        </div>
      </div>

      {/* Statutory Consents */}
      <div className="pt-4 border-t border-neutral-100 space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">Regulatory Consents & Legal Execution</h3>

        <Checkbox
          label="Credit Information Companies (CIC) Bureau Pull Consent"
          description="I hereby grant explicit consent under Section 21 of the Credit Information Companies (Regulation) Act, 2005 to LendSwift to access and pull my comprehensive credit report from TransUnion CIBIL, Experian, Equifax, and CRIF High Mark."
          {...register('cibilScoreConsent')}
          error={errors.cibilScoreConsent?.message}
        />

        <Checkbox
          label="NBFC Fair Practices Code & Digital Loan Agreement Acceptance"
          description="I have read, understood, and accept the Key Fact Statement, Fair Practices Code, and standard digital loan agreement terms provided by LendSwift Financial Services India Private Limited (RBI Reg: B-14.03212)."
          {...register('rbiFairPracticesConsent')}
          error={errors.rbiFairPracticesConsent?.message}
        />

        <Checkbox
          label="Data Privacy & Confidentiality Consent"
          description="I authorize LendSwift to collect, verify, and store my personal and financial information solely for underwriting, anti-money laundering (PMLA), and repayment processing in compliance with RBI Digital Lending Guidelines 2022."
          {...register('privacyPolicyConsent')}
          error={errors.privacyPolicyConsent?.message}
        />
      </div>

      {/* Aadhaar e-Sign Agreement Box */}
      <div className="p-5 bg-primary-50/60 rounded-fintech border border-primary-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-primary-900">
              Digital Signature Execution (Aadhaar e-Sign)
            </h4>
            <p className="text-xs text-neutral-600 mt-0.5">
              Under Information Technology Act 2000, Aadhaar e-Sign carries equivalent legal validity to a physical pen signature.
            </p>
          </div>

          {!eSignOtpVerified ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSendESignOtp}
              isLoading={isSendingOtp}
              className="shrink-0"
            >
              {eSignOtpSent ? 'Resend e-Sign OTP' : 'Request e-Sign OTP'}
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-success-700 bg-success-50 px-3 py-1.5 rounded-fintech border border-success-200 text-xs font-bold shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Digitally Signed</span>
            </div>
          )}
        </div>

        {errors.eSignOtpVerified && !eSignOtpVerified && (
          <p className="text-xs text-danger-600 font-medium">
            {errors.eSignOtpVerified.message}
          </p>
        )}

        {/* e-Sign OTP Input Drawer */}
        {eSignOtpSent && !eSignOtpVerified && (
          <div className="p-4 bg-white rounded-fintech border border-primary-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800">
                Enter 6-digit Aadhaar e-Sign security token
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">(Demo: 123456)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={eSignOtp}
                onChange={(e) => setESignOtp(e.target.value.replace(/\D/g, ''))}
                className="w-40 rounded-fintech border-neutral-300 px-3 py-2 text-center font-mono tracking-widest text-base font-bold focus:border-primary-700 focus:ring-1 focus:ring-primary-700"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleVerifyESignOtp}
                isLoading={isVerifyingOtp}
                disabled={eSignOtp.length !== 6}
              >
                Sign Contract
              </Button>
            </div>
            {eSignError && <p className="text-xs text-danger-600 font-medium">{eSignError}</p>}
          </div>
        )}

        {applicationReferenceNumber && (
          <div className="p-3 bg-white rounded-fintech border border-success-200 text-xs text-neutral-700">
            <span className="font-bold text-success-700">Application Reference Number: </span>
            <span className="font-mono font-bold text-neutral-900">{applicationReferenceNumber}</span>
          </div>
        )}
      </div>

      <Alert variant="info" title="RBI Grievance Redressal Assurance">
        Compliant with {RBI_STATUTORY_DISCLOSURE.rbiDigitalLendingCompliance}. Grievance officer contact: {RBI_STATUTORY_DISCLOSURE.grievanceEmail}.
      </Alert>
    </div>
  );
}

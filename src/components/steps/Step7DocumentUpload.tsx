import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Checkbox } from '@/components/common/Checkbox';
import { FileUpload } from '@/components/common/FileUpload';
import { Select } from '@/components/common/Select';
import { LoanApplicationData } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';

export function Step7DocumentUpload(_props: StepViewProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const incomeProofFileName = watch('incomeProofFileName');
  const bankStatementFileName = watch('bankStatementFileName');

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold text-neutral-900">Document Upload & Liveness Verification</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Upload your latest financial proofs and provide liveness consent as required by RBI Digital Lending rules.
        </p>
      </div>

      <div className="space-y-5">
        {/* Income Proof Category */}
        <div>
          <Select
            label="Primary Income Proof Type"
            required
            options={[
              { value: 'salary_slip_3_months', label: 'Latest 3 Months Salary Slips' },
              { value: 'itr_acknowledgment', label: 'Latest Income Tax Return (ITR-V / Form 16)' },
              { value: 'bank_statement_6_months', label: '6 Months Detailed Salary Account Statement' },
            ]}
            {...register('incomeProofType')}
            error={errors.incomeProofType?.message}
          />
        </div>

        {/* Upload 1: Income Proof */}
        <FileUpload
          label="Upload Income Document"
          description="PDF, JPG, or PNG up to 5MB (Ensure employee name and net salary are clear)"
          required
          fileName={incomeProofFileName}
          onFileSelect={(name) => setValue('incomeProofFileName', name, { shouldValidate: true })}
          onFileRemove={() => setValue('incomeProofFileName', '', { shouldValidate: true })}
          error={errors.incomeProofFileName?.message}
        />

        {/* Upload 2: Bank Statement */}
        <FileUpload
          label="Upload Salary Bank Statement (Past 6 Months)"
          description="PDF e-statement directly downloaded from your netbanking portal (Max 10MB)"
          required
          accept=".pdf"
          fileName={bankStatementFileName}
          onFileSelect={(name) => setValue('bankStatementFileName', name, { shouldValidate: true })}
          onFileRemove={() => setValue('bankStatementFileName', '', { shouldValidate: true })}
          error={errors.bankStatementFileName?.message}
        />

        {/* Regulatory Consents */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <Checkbox
            label="Facial Liveness & Geotagged Selfie Verification"
            description="I agree to undergo automated AI facial match against my PAN/Aadhaar photo to prevent digital identity impersonation."
            {...register('selfieVerificationConsent')}
            error={errors.selfieVerificationConsent?.message}
          />

          <Checkbox
            label="One-Time Geolocation Consent"
            description="Under RBI Digital Lending Guidelines 2022, borrower origination must occur within Indian territorial boundaries. I authorize single-event latitude/longitude verification."
            {...register('geolocationConsent')}
            error={errors.geolocationConsent?.message}
          />
        </div>
      </div>

      <Alert variant="info" title="Bank-Grade Encryption">
        All financial documents are encrypted using AES-256 at rest and stored in ISO 27001 compliant Indian data centers.
      </Alert>
    </div>
  );
}

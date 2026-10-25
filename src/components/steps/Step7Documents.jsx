import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { FileUpload } from '@/components/common/FileUpload';
import { SignatureCanvas } from '@/components/common/SignatureCanvas';
import { getDocumentChecklist } from '@/schemas/step7Schema';

export function Step7Documents() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const loanType = watch('loanType') || 'Personal';
  const employmentType = watch('employmentType') || 'Salaried';
  const isPanVerified = Boolean(watch('isPanVerified'));

  const checklist = getDocumentChecklist({
    loanType,
    employmentType,
    isPanVerified,
  });

  const digitalSignature = watch('digitalSignature') || '';
  const isSignatureCaptured = Boolean(digitalSignature && digitalSignature.length > 50);

  // Count uploaded mandatory documents
  const mandatoryDocs = checklist.filter((item) => item.required);
  const uploadedMandatoryCount = mandatoryDocs.filter((item) => {
    const val = watch(item.id);
    return Boolean(val);
  }).length;

  const totalMandatoryCount = mandatoryDocs.length + 1; // +1 for digital signature
  const currentCompletedCount = uploadedMandatoryCount + (isSignatureCaptured ? 1 : 0);
  const isAllComplete = currentCompletedCount === totalMandatoryCount;

  return (
    <div className="space-y-8 animate-fadeIn" data-testid="step-7-documents">
      {/* Step Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Document Verification & Digital Signature
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Upload statutory verification documents and provide your digital signature under RBI guidelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Checklist Progress:</span>
            <Badge variant={isAllComplete ? 'success' : 'primary'} size="sm">
              {currentCompletedCount} of {totalMandatoryCount} Completed
            </Badge>
          </div>
        </div>
      </div>

      {/* Statutory Guidance Alert */}
      <Alert variant="info" title="RBI Digital Lending Compliance (KYC & Documents)">
        All uploaded files are verified client-side, encrypted with AES-256, and handled under strict RBI data privacy standards. Max file size: 5MB per document (.pdf, .jpg, .png).
      </Alert>

      {/* Dynamic Document Checklist Upload Cards */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-1">
            Required Documents ({loanType} Loan &bull; {employmentType})
          </h3>
          <p className="text-xs text-neutral-500">
            Please ensure that all documents are clearly legible with no blurred text or cropped borders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {checklist.map((docItem) => {
            const fieldValue = watch(docItem.id);
            const fieldError = errors[docItem.id]?.message;

            return (
              <div
                key={docItem.id}
                className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs hover:border-neutral-300 transition-all"
              >
                <FileUpload
                  label={docItem.title}
                  description={docItem.description}
                  required={docItem.required}
                  badgeText={docItem.badgeText}
                  value={fieldValue}
                  onChange={(fileData) => {
                    setValue(docItem.id, fileData, { shouldValidate: true });
                  }}
                  error={fieldError}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Digital Signature Pad Section */}
      <div className="pt-2">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <SignatureCanvas
            label="Digital Signature (Borrower e-Signature)"
            description="Draw your official signature within the designated box below using mouse, stylus, or touch."
            required={true}
            value={digitalSignature}
            onChange={(signatureData) => {
              setValue('digitalSignature', signatureData, { shouldValidate: true });
            }}
            error={errors.digitalSignature?.message}
          />

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Legally binding electronic signature under IT Act 2000</span>
            <span>Secured by LendSwift FinTech Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step7Documents;

import { ChangeEvent, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { LoanApplicationData } from '@/types/loan';
import { validatePAN } from '@/utils/validators';

export function Step6CoApplicant() {
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const maritalStatus = watch('maritalStatus');
  const relationship = watch('relationship');
  const coApplicantPan = watch('coApplicantPan') || '';
  const primaryPan = watch('panNumber') || '';
  const isCoApplicantPanVerified = Boolean(watch('isCoApplicantPanVerified'));

  // Masking state
  const [showPan, setShowPan] = useState(false);

  // Verification states
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [panError, setPanError] = useState('');
  const [panEntityType, setPanEntityType] = useState('');

  // Auto-default: If Step 2 maritalStatus === 'Married', pre-select relationship = 'Spouse'
  useEffect(() => {
    const normalizedMarital = String(maritalStatus || '').trim().toLowerCase();
    if (normalizedMarital === 'married' && !relationship) {
      setValue('relationship', 'Spouse', { shouldValidate: true });
    }
  }, [maritalStatus, relationship, setValue]);

  // Handle co-applicant PAN change
  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().slice(0, 10);
    setValue('coApplicantPan', raw, { shouldValidate: true });
    if (isCoApplicantPanVerified) {
      setValue('isCoApplicantPanVerified', false);
      setPanEntityType('');
    }
    setPanError('');
  };

  // Co-applicant onBlur PAN verification with 1.5s simulation
  const handlePanBlur = () => {
    if (!coApplicantPan || coApplicantPan.trim().length === 0) return;

    const trimmed = coApplicantPan.trim().toUpperCase();
    if (trimmed.length !== 10) {
      setPanError('Co-applicant PAN must be exactly 10 characters');
      setValue('isCoApplicantPanVerified', false);
      setError('coApplicantPan', { type: 'manual', message: 'Co-applicant PAN must be exactly 10 characters' });
      return;
    }

    // Check if identical to primary applicant's PAN
    if (primaryPan && trimmed === primaryPan.trim().toUpperCase()) {
      const msg = 'Co-applicant PAN cannot be identical to primary applicant PAN';
      setPanError(msg);
      setValue('isCoApplicantPanVerified', false);
      setError('coApplicantPan', { type: 'manual', message: msg });
      return;
    }

    setIsVerifyingPan(true);
    setPanError('');

    setTimeout(() => {
      setIsVerifyingPan(false);
      const isBizPartner = relationship === 'Business Partner';
      const result = validatePAN(trimmed, isBizPartner ? 'Business' : 'Personal');

      if (result.isValid) {
        setValue('isCoApplicantPanVerified', true, { shouldValidate: true });
        setPanEntityType(result.entityType || 'Individual');
        setPanError('');
        clearErrors('coApplicantPan');
      } else {
        setValue('isCoApplicantPanVerified', false, { shouldValidate: true });
        const errMsg = result.error || 'Invalid co-applicant PAN format or entity mismatch';
        setPanError(errMsg);
        setError('coApplicantPan', { type: 'manual', message: errMsg });
      }
    }, 1500);
  };

  // Masked PAN display
  const getMaskedPanDisplay = () => {
    if (!coApplicantPan) return '';
    if (showPan || coApplicantPan.length < 10) return coApplicantPan;
    return `${coApplicantPan.slice(0, 5)}••••${coApplicantPan.slice(9)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Description */}
      <div className="border-b border-neutral-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Co-Applicant & Guarantor Details
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Statutory high-ticket guarantor evaluation and financial co-borrower creditworthiness assessment.
        </p>
      </div>

      <Alert
        variant="info"
        title="Joint Borrowing Underwriting"
      >
        Adding a creditworthy co-applicant enhances maximum eligible loan sanction and reduces overall debt-to-income (FOIR) burden.
      </Alert>

      {/* Main Form Fields */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Co-Applicant Name */}
          <div>
            <label htmlFor="coApplicantName" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Co-Applicant Full Legal Name <span className="text-danger-500">*</span>
            </label>
            <input
              id="coApplicantName"
              type="text"
              placeholder="As per Government PAN Card"
              {...register('coApplicantName')}
              aria-invalid={Boolean(errors.coApplicantName)}
              aria-describedby={errors.coApplicantName ? 'coApplicantName-error' : 'coApplicantName-desc'}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
            <span id="coApplicantName-desc" className="text-[11px] text-neutral-600 mt-1 block">
              Must match exact legal name on co-applicant PAN card.
            </span>
            {errors.coApplicantName && (
              <p id="coApplicantName-error" className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.coApplicantName.message}
              </p>
            )}
          </div>

          {/* 2. Relationship */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="relationship" className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Relationship with Primary Borrower <span className="text-danger-500">*</span>
              </label>
              {maritalStatus && String(maritalStatus).toLowerCase() === 'married' && relationship === 'Spouse' && (
                <Badge variant="primary" size="sm">
                  Auto-Selected (Married)
                </Badge>
              )}
            </div>
            <select
              id="relationship"
              {...register('relationship')}
              aria-invalid={Boolean(errors.relationship)}
              aria-describedby={errors.relationship ? 'relationship-error' : undefined}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
            >
              <option value="">Select Relationship</option>
              <option value="Spouse">Spouse (Husband / Wife)</option>
              <option value="Parent">Parent (Father / Mother)</option>
              <option value="Sibling">Sibling (Brother / Sister)</option>
              <option value="Business Partner">Business Partner / Co-Director</option>
            </select>
            {errors.relationship && (
              <p id="relationship-error" className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.relationship.message}
              </p>
            )}
          </div>

          {/* 3. Co-Applicant PAN with Live onBlur Simulation */}
          <div className="md:col-span-2 p-5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label htmlFor="coApplicantPan" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Co-Applicant PAN Number <span className="text-danger-500">*</span>
                </label>
                <span id="coApplicantPan-desc" className="text-xs text-neutral-600">
                  Runs real-time NSDL format and entity check on blur.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isVerifyingPan && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-primary-700 font-semibold">
                    <span className="w-3 h-3 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
                    Verifying NSDL...
                  </span>
                )}

                {isCoApplicantPanVerified && !isVerifyingPan && (
                  <Badge variant="success" size="md">
                    ✓ Verified ({panEntityType} PAN)
                  </Badge>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                id="coApplicantPan"
                type="text"
                maxLength={10}
                placeholder="ABCDE1234F"
                value={showPan ? coApplicantPan : getMaskedPanDisplay()}
                onChange={handlePanChange}
                onBlur={handlePanBlur}
                onFocus={() => setShowPan(true)}
                className={`
                  w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm font-mono uppercase tracking-wider text-neutral-900 focus:outline-none focus:ring-2
                  ${isCoApplicantPanVerified ? 'border-success-400 focus:ring-success-500' : panError ? 'border-danger-400 focus:ring-danger-500' : 'border-neutral-300 focus:ring-primary-700'}
                `}
                aria-label="Co-Applicant PAN Number"
                aria-invalid={Boolean(panError || errors.coApplicantPan)}
                aria-describedby={(panError || errors.coApplicantPan) ? 'coApplicantPan-error' : 'coApplicantPan-desc'}
              />

              <button
                type="button"
                onClick={() => setShowPan(!showPan)}
                aria-label={showPan ? 'Mask PAN digits' : 'Show PAN digits'}
                className="absolute right-3 top-2.5 text-xs text-neutral-600 hover:text-neutral-900 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded px-1"
              >
                {showPan ? 'Mask' : 'Show'}
              </button>
            </div>

            {panError && (
              <p id="coApplicantPan-error" className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {panError}
              </p>
            )}
            {!panError && errors.coApplicantPan && (
              <p id="coApplicantPan-error" className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.coApplicantPan.message}
              </p>
            )}
          </div>

          {/* 4. Co-Applicant Monthly Income */}
          <div className="md:col-span-2">
            <label htmlFor="coApplicantIncome" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Co-Applicant Verifiable Monthly In-Hand Income <span className="text-danger-500">*</span>
            </label>
            <div className="relative max-w-md">
              <span className="absolute left-3.5 top-2.5 text-neutral-600 font-bold text-sm">₹</span>
              <input
                id="coApplicantIncome"
                type="number"
                placeholder="e.g. 60000"
                {...register('coApplicantIncome')}
                aria-invalid={Boolean(errors.coApplicantIncome)}
                aria-describedby={errors.coApplicantIncome ? 'coApplicantIncome-error' : 'coApplicantIncome-desc'}
                className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
            </div>
            <span id="coApplicantIncome-desc" className="text-[11px] text-neutral-600 mt-1 block">
              Income will be factored into overall FOIR affordability checks.
            </span>
            {errors.coApplicantIncome && (
              <p id="coApplicantIncome-error" className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.coApplicantIncome.message}
              </p>
            )}
          </div>
        </div>

        {/* 5. Statutory Co-Applicant Consent */}
        <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/40 mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="coApplicantConsent"
              {...register('coApplicantConsent')}
              aria-invalid={Boolean(errors.coApplicantConsent)}
              aria-describedby={errors.coApplicantConsent ? 'coApplicantConsent-error' : undefined}
              className="mt-1 w-4 h-4 text-primary-800 border-neutral-300 rounded focus:ring-primary-700 accent-primary-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-700"
            />
            <span className="text-xs text-neutral-700 leading-relaxed select-none">
              I, as the co-applicant / legal guarantor, hereby give my voluntary statutory consent to LendSwift Financial Services (RBI-registered NBFC-ICC) and its lending partners to fetch my credit bureau history (CIBIL/Experian), authenticate my PAN, and execute digital underwriting checks under the RBI Master Directions on Digital Lending. <span className="text-danger-500 font-bold">*</span>
            </span>
          </label>
          {errors.coApplicantConsent && (
            <p id="coApplicantConsent-error" className="text-xs text-danger-600 font-medium mt-2 pl-7" role="alert">
              {errors.coApplicantConsent.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step6CoApplicant;

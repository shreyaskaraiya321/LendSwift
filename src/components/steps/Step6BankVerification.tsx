import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Checkbox } from '@/components/common/Checkbox';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { LoanApplicationData } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';
import { formatIfsc } from '@/utils/formatters';

export function Step6BankVerification(_props: StepViewProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const fullName = watch('fullName') || '';
  const bankName = watch('bankName');
  const branchName = watch('branchName');
  const [isVerifyingIfsc, setIsVerifyingIfsc] = useState(false);

  const handleIfscChange = async (ifscRaw: string) => {
    const formatted = formatIfsc(ifscRaw);
    setValue('ifscCode', formatted, { shouldValidate: true });

    if (formatted.length === 11) {
      setIsVerifyingIfsc(true);
      // Simulate RBI NEFT / IFSC directory lookup
      await new Promise((resolve) => setTimeout(resolve, 400));

      const bankPrefix = formatted.substring(0, 4);
      let detectedBank = 'Commercial Bank of India';
      let detectedBranch = 'Main Branch, Metro Center';

      if (bankPrefix === 'HDFC') {
        detectedBank = 'HDFC Bank Ltd';
        detectedBranch = 'Retail Branch, Bandra';
      } else if (bankPrefix === 'ICIC') {
        detectedBank = 'ICICI Bank Ltd';
        detectedBranch = 'Financial District Branch';
      } else if (bankPrefix === 'SBIN') {
        detectedBank = 'State Bank of India';
        detectedBranch = 'Personal Banking Branch';
      } else if (bankPrefix === 'UTIB') {
        detectedBank = 'Axis Bank Ltd';
        detectedBranch = 'Central Business District';
      } else if (bankPrefix === 'KKBK') {
        detectedBank = 'Kotak Mahindra Bank';
        detectedBranch = 'Commercial Plaza Branch';
      }

      setValue('bankName', detectedBank, { shouldValidate: true });
      setValue('branchName', detectedBranch, { shouldValidate: true });
      setValue('accountHolderName', fullName.toUpperCase(), { shouldValidate: true });
      setIsVerifyingIfsc(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold text-neutral-900">Bank Account & Disbursal Setup</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Specify the bank account where your sanctioned loan will be directly credited via RTGS/NEFT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account Holder Name */}
        <div className="md:col-span-2">
          <Input
            label="Account Holder Name (Must match PAN card)"
            placeholder="Applicant Name"
            required
            {...register('accountHolderName')}
            error={errors.accountHolderName?.message}
            helperText="Penny-drop verification will be conducted to confirm account active status"
          />
        </div>

        {/* Bank Account Number */}
        <div>
          <Input
            type="password"
            label="Bank Account Number"
            placeholder="Enter account number"
            maxLength={18}
            required
            {...register('bankAccountNumber')}
            error={errors.bankAccountNumber?.message}
          />
        </div>

        {/* Confirm Bank Account Number */}
        <div>
          <Input
            type="text"
            label="Confirm Bank Account Number"
            placeholder="Re-enter account number"
            maxLength={18}
            required
            {...register('confirmBankAccountNumber')}
            error={errors.confirmBankAccountNumber?.message}
          />
        </div>

        {/* IFSC Code */}
        <div>
          <Input
            label="11-Character IFSC Code"
            placeholder="e.g. HDFC0001234"
            maxLength={11}
            required
            {...register('ifscCode', {
              onChange: (e) => handleIfscChange(e.target.value),
            })}
            error={errors.ifscCode?.message}
            helperText={isVerifyingIfsc ? 'Validating IFSC with RBI clearing house...' : '5th character is always 0'}
          />
        </div>

        {/* Account Type */}
        <div>
          <Select
            label="Account Type"
            required
            options={[
              { value: 'savings', label: 'Savings Account' },
              { value: 'current', label: 'Current Account' },
            ]}
            {...register('accountType')}
            error={errors.accountType?.message}
          />
        </div>
      </div>

      {/* Detected Bank Details Badge */}
      {bankName && (
        <div className="p-4 bg-primary-50/60 rounded-fintech border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-primary-800 font-bold uppercase tracking-wider">
              Bank Branch Verified
            </span>
            <p className="text-sm font-bold text-neutral-900 mt-0.5">{bankName}</p>
            <p className="text-xs text-neutral-600">{branchName}</p>
          </div>
          <Badge variant="success" size="md">
            Penny Drop Compatible
          </Badge>
        </div>
      )}

      {/* e-NACH Mandate Consent */}
      <div className="pt-4 border-t border-neutral-100">
        <Checkbox
          label="Setup e-NACH / NPCI Auto-Debit Mandate"
          description="I authorize LendSwift to register an automated monthly standing instruction with NPCI on this bank account for EMI deduction on the 5th of each calendar month."
          {...register('eNachAutoDebitConsent')}
          error={errors.eNachAutoDebitConsent?.message}
        />
      </div>

      <Alert variant="info" title="RBI Penny-Drop Verification">
        A nominal ₹1 test deposit will be initiated to verify bank account ownership prior to disbursal.
      </Alert>
    </div>
  );
}

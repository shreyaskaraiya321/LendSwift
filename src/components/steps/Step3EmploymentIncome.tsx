import { Controller, useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Input } from '@/components/common/Input';
import { RadioGroup } from '@/components/common/RadioGroup';
import { Select } from '@/components/common/Select';
import { EMPLOYMENT_TYPE_OPTIONS, SALARY_MODE_OPTIONS } from '@/constants/loanConstants';
import { EmploymentType, LoanApplicationData } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';
import { formatIndianCurrency } from '@/utils/formatters';

export function Step3EmploymentIncome(_props: StepViewProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const monthlyNetIncome = watch('monthlyNetIncome');
  const existingMonthlyEmi = watch('existingMonthlyEmi') || 0;

  // Calculate Fixed Obligation to Income Ratio (FOIR)
  const foir = monthlyNetIncome > 0 ? Math.round((existingMonthlyEmi / monthlyNetIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold text-neutral-900">Employment & Income Assessment</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Tell us about your employer, occupation, and monthly earnings to calculate maximum eligibility.
        </p>
      </div>

      {/* Employment Type Radio Cards */}
      <Controller
        name="employmentType"
        control={control}
        render={({ field }) => (
          <RadioGroup<EmploymentType>
            label="Employment Category"
            name="employmentType"
            options={EMPLOYMENT_TYPE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            columns={3}
            error={errors.employmentType?.message}
          />
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Employer / Business Name */}
        <div className="md:col-span-2">
          <Input
            label="Employer / Business Name"
            placeholder="e.g. Infosys Limited, Tata Consultancy Services"
            required
            {...register('employerName')}
            error={errors.employerName?.message}
            helperText="Registered name as reflected on salary slips or GST registration"
          />
        </div>

        {/* Monthly Net In-Hand Income */}
        <div>
          <Input
            type="number"
            label="Monthly Net In-hand Income"
            prefixText="₹"
            placeholder="75000"
            required
            {...register('monthlyNetIncome', { valueAsNumber: true })}
            error={errors.monthlyNetIncome?.message}
            helperText={
              monthlyNetIncome ? `Equivalent to ${formatIndianCurrency(monthlyNetIncome)} / month` : 'Minimum ₹25,000 required'
            }
          />
        </div>

        {/* Salary Credit Mode */}
        <div>
          <Select
            label="Salary Credit Mode"
            required
            options={SALARY_MODE_OPTIONS}
            {...register('salaryCreditMode')}
            error={errors.salaryCreditMode?.message}
            helperText="RBI requires verifiable banking transactions"
          />
        </div>

        {/* Work Experience */}
        <div>
          <Input
            type="number"
            label="Total Work Experience (in Months)"
            placeholder="36"
            required
            {...register('totalWorkExperienceMonths', { valueAsNumber: true })}
            error={errors.totalWorkExperienceMonths?.message}
            helperText="Minimum 6 months continuous experience"
          />
        </div>

        {/* Existing Monthly EMIs */}
        <div>
          <Input
            type="number"
            label="Current Monthly EMIs (if any)"
            prefixText="₹"
            placeholder="0"
            {...register('existingMonthlyEmi', { valueAsNumber: true })}
            error={errors.existingMonthlyEmi?.message}
            helperText="Total existing monthly repayment obligations"
          />
        </div>

        {/* Official Work Email */}
        <div className="md:col-span-2">
          <Input
            type="email"
            label="Official Work Email (Optional)"
            placeholder="rajesh@company.com"
            {...register('officialEmail')}
            error={errors.officialEmail?.message}
            helperText="Providing a corporate email accelerates automated credit sanction"
          />
        </div>
      </div>

      {/* FOIR Financial Health Feedback */}
      {monthlyNetIncome > 0 && (
        <div className="p-4 rounded-fintech bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-neutral-800">Existing Obligation Ratio (FOIR): {foir}%</span>
            <p className="text-neutral-500 mt-0.5">
              {foir <= 50 ? 'Healthy debt ratio. High probability of optimal sanction amount.' : 'Moderate debt ratio. Loan amount may be calibrated.'}
            </p>
          </div>
          <span
            className={`font-bold px-2 py-1 rounded text-[11px] ${
              foir <= 50 ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'
            }`}
          >
            {foir <= 50 ? 'Optimal' : 'Standard'}
          </span>
        </div>
      )}

      <Alert variant="info" title="RBI Underwriting Standards">
        Income details will be cross-referenced with your uploaded 6-month bank statement in Step 7.
      </Alert>
    </div>
  );
}

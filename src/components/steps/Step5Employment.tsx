import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { EmploymentTypeOption } from '@/schemas/step5Schema';
import { LoanApplicationData } from '@/types/loan';
import { validateGSTIN } from '@/utils/validators';

export function Step5Employment() {
  const {
    register,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const loanType = watch('loanType') || 'Personal';
  const isBusinessLoan = String(loanType).trim().toLowerCase() === 'business';
  const employmentType = (watch('employmentType') as EmploymentTypeOption) || 'Salaried';
  const gstNumber = watch('gstNumber') || '';

  // Auto-switch away from Salaried if Step 1 is Business Loan
  useEffect(() => {
    if (isBusinessLoan && employmentType === 'Salaried') {
      setValue('employmentType', 'Business Owner', { shouldValidate: true });
      setValue('companyName', '');
      setValue('designation', '');
      setValue('monthlyNetSalary', undefined);
      setValue('yearsOfExperience', undefined);
    }
  }, [isBusinessLoan, employmentType, setValue]);

  // Handle employment type tab change with strict input cleaning to prevent stale data leakage
  const handleTypeChange = (newType: EmploymentTypeOption) => {
    if (isBusinessLoan && newType === 'Salaried') {
      return;
    }
    if (newType === employmentType) return;

    setValue('employmentType', newType, { shouldValidate: true });

    // Purge obsolete fields based on target branch
    if (newType === 'Salaried') {
      setValue('businessName', '');
      setValue('businessType', '');
      setValue('annualTurnover', undefined);
      setValue('yearsInBusiness', undefined);
      setValue('monthlyIncome', undefined);
      setValue('gstNumber', '');
      setValue('businessAddress', '');
      clearErrors([
        'businessName',
        'businessType',
        'annualTurnover',
        'yearsInBusiness',
        'monthlyIncome',
        'gstNumber',
        'businessAddress',
      ]);
    } else if (newType === 'Self-Employed') {
      setValue('companyName', '');
      setValue('designation', '');
      setValue('monthlyNetSalary', undefined);
      setValue('yearsOfExperience', undefined);
      setValue('gstNumber', '');
      setValue('businessAddress', '');
      clearErrors([
        'companyName',
        'designation',
        'monthlyNetSalary',
        'yearsOfExperience',
        'gstNumber',
        'businessAddress',
      ]);
    } else if (newType === 'Business Owner') {
      setValue('companyName', '');
      setValue('designation', '');
      setValue('monthlyNetSalary', undefined);
      setValue('yearsOfExperience', undefined);
      clearErrors([
        'companyName',
        'designation',
        'monthlyNetSalary',
        'yearsOfExperience',
      ]);
    }
  };

  const gstResult = gstNumber ? validateGSTIN(gstNumber) : { isValid: false, error: null, stateCode: null, pan: null };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Description */}
      <div className="border-b border-neutral-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Employment & Income Assessment
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Select your primary occupation category for statutory income and debt-to-income (FOIR) evaluation.
        </p>
      </div>

      {/* Cross-Step Constraint Notice for Business Loans */}
      {isBusinessLoan && (
        <Alert
          variant="info"
          title="Business Loan Underwriting Criteria"
        >
          Under statutory NBFC lending regulations, applicants requesting a commercial Business Loan must be Self-Employed professionals or Registered Business Owners.
        </Alert>
      )}

      {/* Employment Category Cards (Segmented Selection) */}
      <div>
        <span id="employment-type-label" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-3">
          Select Employment Type <span className="text-danger-500">*</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="employment-type-label">
          {/* 1. Salaried */}
          <button
            type="button"
            role="radio"
            aria-checked={employmentType === 'Salaried'}
            disabled={isBusinessLoan}
            onClick={() => handleTypeChange('Salaried')}
            className={`
              p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between
              ${isBusinessLoan ? 'opacity-40 cursor-not-allowed bg-neutral-100 border-neutral-300' : 'cursor-pointer hover:border-primary-400'}
              ${employmentType === 'Salaried' ? 'bg-primary-50/70 border-primary-700 ring-2 ring-primary-700/20 shadow-sm' : 'bg-white border-neutral-200'}
            `}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-neutral-900">Salaried</span>
                {employmentType === 'Salaried' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-700" />
                )}
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Corporate, MNC, Govt, or Private sector employees with fixed monthly salary.
              </p>
            </div>
            {isBusinessLoan && (
              <span className="text-[10px] text-danger-600 font-semibold mt-2 block">
                Not applicable for Business loans
              </span>
            )}
          </button>

          {/* 2. Self-Employed */}
          <button
            type="button"
            role="radio"
            aria-checked={employmentType === 'Self-Employed'}
            onClick={() => handleTypeChange('Self-Employed')}
            className={`
              p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer hover:border-primary-400
              ${employmentType === 'Self-Employed' ? 'bg-primary-50/70 border-primary-700 ring-2 ring-primary-700/20 shadow-sm' : 'bg-white border-neutral-200'}
            `}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-neutral-900">Self-Employed</span>
                {employmentType === 'Self-Employed' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-700" />
                )}
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Doctors, Lawyers, CAs, Consultants, Freelancers, or Solo practitioners.
              </p>
            </div>
          </button>

          {/* 3. Business Owner */}
          <button
            type="button"
            role="radio"
            aria-checked={employmentType === 'Business Owner'}
            onClick={() => handleTypeChange('Business Owner')}
            className={`
              p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer hover:border-primary-400
              ${employmentType === 'Business Owner' ? 'bg-primary-50/70 border-primary-700 ring-2 ring-primary-700/20 shadow-sm' : 'bg-white border-neutral-200'}
            `}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-neutral-900">Business Owner</span>
                {employmentType === 'Business Owner' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-700" />
                )}
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Enterprises, Traders, LLP, Pvt Ltd with GSTIN & business premises.
              </p>
            </div>
          </button>
        </div>

        {errors.employmentType && (
          <p className="text-xs text-danger-600 font-medium mt-2" role="alert">
            {errors.employmentType.message}
          </p>
        )}
      </div>

      {/* =========================================================================
          BRANCH 1: Salaried Sub-Form
      ========================================================================= */}
      {employmentType === 'Salaried' && (
        <div className="p-6 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-5 animate-fade-in">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-900 block">
            Salaried Employment Information
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Current Company / Employer Name <span className="text-danger-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                placeholder="e.g. Tata Consultancy Services"
                {...register('companyName')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              {errors.companyName && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designation" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Official Job Designation <span className="text-danger-500">*</span>
              </label>
              <input
                id="designation"
                type="text"
                placeholder="e.g. Senior Software Engineer"
                {...register('designation')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              {errors.designation && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.designation.message}
                </p>
              )}
            </div>

            {/* Monthly Net Salary */}
            <div>
              <label htmlFor="monthlyNetSalary" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Monthly Net In-Hand Salary <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-neutral-500 font-bold text-sm">₹</span>
                <input
                  id="monthlyNetSalary"
                  type="number"
                  placeholder="e.g. 85000"
                  {...register('monthlyNetSalary')}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Minimum net salary of ₹15,000 required for LendSwift personal loans.
              </span>
              {errors.monthlyNetSalary && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.monthlyNetSalary.message}
                </p>
              )}
            </div>

            {/* Years of Experience */}
            <div>
              <label htmlFor="yearsOfExperience" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Total Work Experience (Years) <span className="text-danger-500">*</span>
              </label>
              <input
                id="yearsOfExperience"
                type="number"
                min={0}
                max={50}
                step={0.5}
                placeholder="e.g. 5"
                {...register('yearsOfExperience')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              {errors.yearsOfExperience && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.yearsOfExperience.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BRANCH 2: Self-Employed Sub-Form
      ========================================================================= */}
      {employmentType === 'Self-Employed' && (
        <div className="p-6 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-5 animate-fade-in">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-900 block">
            Self-Employed Professional Profile
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Business / Practice Name */}
            <div>
              <label htmlFor="businessName" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Practice / Profession Name <span className="text-danger-500">*</span>
              </label>
              <input
                id="businessName"
                type="text"
                placeholder="e.g. Apex Health Clinic / Sharma Legal"
                {...register('businessName')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              {errors.businessName && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Profession / Discipline <span className="text-danger-500">*</span>
              </label>
              <select
                id="businessType"
                {...register('businessType')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              >
                <option value="">Select Profession Category</option>
                <option value="Medical Practitioner / Doctor">Medical Practitioner / Doctor</option>
                <option value="Chartered Accountant / Financial Consultant">Chartered Accountant / Financial Consultant</option>
                <option value="Legal Consultant / Advocate">Legal Consultant / Advocate</option>
                <option value="Architect / Civil Engineer">Architect / Civil Engineer</option>
                <option value="IT Freelancer / Software Consultant">IT Freelancer / Software Consultant</option>
                <option value="Independent Designer / Creative">Independent Designer / Creative</option>
                <option value="Other Solo Professional">Other Solo Professional</option>
              </select>
              {errors.businessType && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.businessType.message}
                </p>
              )}
            </div>

            {/* Annual Turnover (min 3L) */}
            <div>
              <label htmlFor="annualTurnover" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Gross Annual Professional Turnover <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-neutral-500 font-bold text-sm">₹</span>
                <input
                  id="annualTurnover"
                  type="number"
                  placeholder="e.g. 1200000"
                  {...register('annualTurnover')}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Minimum gross professional turnover must be ₹3,00,000 as per latest ITR.
              </span>
              {errors.annualTurnover && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.annualTurnover.message}
                </p>
              )}
            </div>

            {/* Years in Business (min 2) */}
            <div>
              <label htmlFor="yearsInBusiness" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Years in Practice / Business <span className="text-danger-500">*</span>
              </label>
              <input
                id="yearsInBusiness"
                type="number"
                min={0}
                max={50}
                step={0.5}
                placeholder="e.g. 3"
                {...register('yearsInBusiness')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Minimum 2 years continuous professional vintage required.
              </span>
              {errors.yearsInBusiness && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.yearsInBusiness.message}
                </p>
              )}
            </div>

            {/* Monthly Income */}
            <div>
              <label htmlFor="monthlyIncome" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Average Net Monthly Income <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-neutral-500 font-bold text-sm">₹</span>
                <input
                  id="monthlyIncome"
                  type="number"
                  placeholder="e.g. 75000"
                  {...register('monthlyIncome')}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
              </div>
              {errors.monthlyIncome && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.monthlyIncome.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BRANCH 3: Business Owner Sub-Form
      ========================================================================= */}
      {employmentType === 'Business Owner' && (
        <div className="p-6 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-900 block">
              Commercial Enterprise & GSTIN Verification
            </span>
            <Badge variant="primary" size="sm">
              GST Validated
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Enterprise Name */}
            <div>
              <label htmlFor="businessNameOwner" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Registered Enterprise Name <span className="text-danger-500">*</span>
              </label>
              <input
                id="businessNameOwner"
                type="text"
                placeholder="e.g. Apex Precision Technologies Pvt Ltd"
                {...register('businessName')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              {errors.businessName && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Business Constitution Type */}
            <div>
              <label htmlFor="businessTypeOwner" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Business Constitution <span className="text-danger-500">*</span>
              </label>
              <select
                id="businessTypeOwner"
                {...register('businessType')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              >
                <option value="">Select Constitution</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership Firm">Partnership Firm</option>
                <option value="Private Limited Company">Private Limited Company</option>
                <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                <option value="Public Limited Company">Public Limited Company</option>
              </select>
              {errors.businessType && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.businessType.message}
                </p>
              )}
            </div>

            {/* GSTIN (15-character with State & PAN structure check) */}
            <div className="md:col-span-2 p-4 bg-white rounded-lg border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="gstNumber" className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Goods & Services Tax Identification Number (GSTIN) <span className="text-danger-500">*</span>
                </label>
                {gstResult.isValid && (
                  <Badge variant="success" size="sm">
                    ✓ Valid GSTIN (State: {gstResult.stateCode})
                  </Badge>
                )}
              </div>
              <input
                id="gstNumber"
                type="text"
                maxLength={15}
                placeholder="e.g. 27ABCDE1234F1Z5"
                {...register('gstNumber')}
                className={`
                  w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm uppercase font-mono tracking-widest text-neutral-900 focus:outline-none focus:ring-2
                  ${gstResult.isValid ? 'border-success-400 focus:ring-success-500' : errors.gstNumber ? 'border-danger-400 focus:ring-danger-500' : 'border-neutral-300 focus:ring-primary-700'}
                `}
              />
              <span className="text-[11px] text-neutral-400 block">
                15-character format: 2-digit State code + 10-digit PAN + entity code + &apos;Z&apos; + check digit.
              </span>
              {errors.gstNumber && (
                <p className="text-xs text-danger-600 font-medium" role="alert">
                  {errors.gstNumber.message}
                </p>
              )}
            </div>

            {/* Business Address */}
            <div className="md:col-span-2">
              <label htmlFor="businessAddress" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Registered Enterprise Office / Facility Address <span className="text-danger-500">*</span>
              </label>
              <input
                id="businessAddress"
                type="text"
                placeholder="Plot / Survey No., Industrial Area, City, State, PIN"
                {...register('businessAddress')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              {errors.businessAddress && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.businessAddress.message}
                </p>
              )}
            </div>

            {/* Annual Turnover (min 3L) */}
            <div>
              <label htmlFor="annualTurnoverOwner" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Annual Audited Turnover <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-neutral-500 font-bold text-sm">₹</span>
                <input
                  id="annualTurnoverOwner"
                  type="number"
                  placeholder="e.g. 5000000"
                  {...register('annualTurnover')}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
              </div>
              {errors.annualTurnover && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.annualTurnover.message}
                </p>
              )}
            </div>

            {/* Years in Business */}
            <div>
              <label htmlFor="yearsInBusinessOwner" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Years in Business Operation <span className="text-danger-500">*</span>
              </label>
              <input
                id="yearsInBusinessOwner"
                type="number"
                min={0}
                max={60}
                step={0.5}
                placeholder="e.g. 4"
                {...register('yearsInBusiness')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              {errors.yearsInBusiness && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.yearsInBusiness.message}
                </p>
              )}
            </div>

            {/* Monthly Income / Drawings */}
            <div>
              <label htmlFor="monthlyIncomeOwner" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Monthly Net Drawings / Income <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-neutral-500 font-bold text-sm">₹</span>
                <input
                  id="monthlyIncomeOwner"
                  type="number"
                  placeholder="e.g. 150000"
                  {...register('monthlyIncome')}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
              </div>
              {errors.monthlyIncome && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.monthlyIncome.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step5Employment;

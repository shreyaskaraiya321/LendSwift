import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { Badge } from '@/components/common/Badge';
import { usePinCodeLookup } from '@/hooks/usePinCodeLookup';
import { LoanApplicationData } from '@/types/loan';

export function Step4Address() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const currentAddressLine1 = watch('currentAddressLine1') || '';
  const currentAddressLine2 = watch('currentAddressLine2') || '';
  const currentPincode = watch('pincode') || '';
  const currentCity = watch('city') || '';
  const currentState = watch('state') || '';
  const residenceType = watch('residenceType') || 'Owned';
  const yearsAtAddress = Number(watch('yearsAtAddress')) ?? 3;
  const sameAsPermanent = watch('sameAsPermanent') ?? true;
  const permanentPincode = watch('permanentPincode') || '';

  // Current Address PIN Code Lookup
  const currentLookup = usePinCodeLookup(currentPincode);

  // Auto-fill City & State when current PIN is found
  useEffect(() => {
    if (currentLookup.isServiceable && currentLookup.city && currentLookup.state) {
      setValue('city', currentLookup.city, { shouldValidate: true });
      setValue('state', currentLookup.state, { shouldValidate: true });
    }
  }, [currentLookup.isServiceable, currentLookup.city, currentLookup.state, setValue]);

  // Permanent Address PIN Code Lookup (when different from current)
  const permLookup = usePinCodeLookup(permanentPincode);

  useEffect(() => {
    if (!sameAsPermanent && permLookup.isServiceable && permLookup.city && permLookup.state) {
      setValue('permanentCity', permLookup.city, { shouldValidate: true });
      setValue('permanentState', permLookup.state, { shouldValidate: true });
    }
  }, [sameAsPermanent, permLookup.isServiceable, permLookup.city, permLookup.state, setValue]);

  // When "Same as permanent" is checked, sync values automatically
  useEffect(() => {
    if (sameAsPermanent) {
      setValue('permanentAddressLine1', currentAddressLine1);
      setValue('permanentAddressLine2', currentAddressLine2);
      setValue('permanentPincode', currentPincode);
      setValue('permanentCity', currentCity);
      setValue('permanentState', currentState);
    }
  }, [sameAsPermanent, currentAddressLine1, currentAddressLine2, currentPincode, currentCity, currentState, setValue]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Description */}
      <div className="border-b border-neutral-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Current & Permanent Residential Address
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Indian statutory postal verification with automatic PIN code city and state detection.
        </p>
      </div>

      {/* 1. Current Address Section */}
      <div className="space-y-5">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-900 block">
          Current Residential Address
        </span>

        {/* Address Line 1 */}
        <div>
          <label htmlFor="currentAddressLine1" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Flat, House No., Building Name, Street <span className="text-danger-500">*</span>
          </label>
          <input
            id="currentAddressLine1"
            type="text"
            placeholder="e.g. Flat 402, Shivalik Residency, M.G. Road"
            {...register('currentAddressLine1')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
          {errors.currentAddressLine1 && (
            <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
              {errors.currentAddressLine1.message}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <label htmlFor="currentAddressLine2" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Area, Sector, Landmark <span className="text-neutral-400 font-normal">(Optional)</span>
          </label>
          <input
            id="currentAddressLine2"
            type="text"
            placeholder="Near City Hospital, Sector 15"
            {...register('currentAddressLine2')}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
          />
        </div>

        {/* PIN Code, City, and State Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* PIN Code with live auto-detection */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="pincode" className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                PIN Code <span className="text-danger-500">*</span>
              </label>
              {currentLookup.isLoading && (
                <span className="text-[10px] text-primary-700 font-semibold animate-pulse">
                  Searching...
                </span>
              )}
            </div>
            <input
              id="pincode"
              type="text"
              maxLength={6}
              placeholder="e.g. 110001"
              {...register('pincode')}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-mono tracking-widest text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
            {currentLookup.isServiceable && (
              <span className="text-[11px] text-success-600 font-medium mt-1 inline-flex items-center gap-1">
                ✓ {currentLookup.city}, {currentLookup.state}
              </span>
            )}
            {currentLookup.error && (
              <span className="text-[11px] text-warning-700 font-medium mt-1 block">
                {currentLookup.error}
              </span>
            )}
            {errors.pincode && (
              <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.pincode.message}
              </p>
            )}
          </div>

          {/* City (Auto-filled) */}
          <div>
            <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              City / District <span className="text-danger-500">*</span>
            </label>
            <input
              id="city"
              type="text"
              placeholder="Auto-filled via PIN"
              {...register('city')}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
            {errors.city && (
              <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* State (Auto-filled) */}
          <div>
            <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              State <span className="text-danger-500">*</span>
            </label>
            <input
              id="state"
              type="text"
              placeholder="Auto-filled via PIN"
              {...register('state')}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
            {errors.state && (
              <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.state.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Residence Ownership & Stability (Conditionals) */}
      <div className="p-5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-5">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
          Residence Ownership & Stability
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Residence Type */}
          <div>
            <label htmlFor="residenceType" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Residence Ownership Type <span className="text-danger-500">*</span>
            </label>
            <select
              id="residenceType"
              {...register('residenceType')}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
            >
              <option value="Owned">Owned (Self or Spouse)</option>
              <option value="Family">Owned by Parents / Family</option>
              <option value="Rented">Rented Accommodation</option>
              <option value="Company">Company Provided Quarter</option>
            </select>
            {errors.residenceType && (
              <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.residenceType.message}
              </p>
            )}
          </div>

          {/* Years at Address */}
          <div>
            <label htmlFor="yearsAtAddress" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Years at Current Address <span className="text-danger-500">*</span>
            </label>
            <input
              id="yearsAtAddress"
              type="number"
              min={0}
              max={100}
              step={0.5}
              {...register('yearsAtAddress')}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
            {errors.yearsAtAddress && (
              <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.yearsAtAddress.message}
              </p>
            )}
          </div>
        </div>

        {/* Conditional UI 1: Monthly Rent Amount if Rented */}
        {residenceType === 'Rented' && (
          <div className="p-4 bg-white rounded-lg border border-primary-200 animate-fade-in space-y-1.5">
            <label htmlFor="monthlyRentAmount" className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
              Monthly Rent Amount <span className="text-danger-500">*</span>
            </label>
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-2.5 text-neutral-500 font-bold text-sm">₹</span>
              <input
                id="monthlyRentAmount"
                type="number"
                placeholder="e.g. 15000"
                {...register('monthlyRentAmount')}
                className="w-full pl-7 pr-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700 text-sm"
              />
            </div>
            <span className="text-[11px] text-neutral-500 block">
              Required for Debt-to-Income / FOIR affordability calculations.
            </span>
            {errors.monthlyRentAmount && (
              <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.monthlyRentAmount.message}
              </p>
            )}
          </div>
        )}

        {/* Conditional UI 2: Previous Address if yearsAtAddress < 1 */}
        {yearsAtAddress < 1 && (
          <div className="p-4 bg-white rounded-lg border border-warning-300 animate-fade-in space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="previousAddressLine" className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Previous Residential Address <span className="text-danger-500">*</span>
              </label>
              <Badge variant="warning" size="sm">
                Stability Check &lt; 1 Year
              </Badge>
            </div>
            <input
              id="previousAddressLine"
              type="text"
              placeholder="Full previous address (city, state, PIN)"
              {...register('previousAddressLine')}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
            <span className="text-[11px] text-neutral-500 block">
              Mandated by RBI underwriting criteria when tenure at current home is under 12 months.
            </span>
            {errors.previousAddressLine && (
              <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                {errors.previousAddressLine.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Permanent Address & "Same as Permanent" Checkbox */}
      <div className="space-y-4 pt-2">
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('sameAsPermanent')}
              className="w-4 h-4 text-primary-800 border-neutral-300 rounded focus:ring-primary-700 accent-primary-800 cursor-pointer"
            />
            <span className="text-xs font-semibold text-neutral-800 select-none">
              Permanent address is same as current residential address
            </span>
          </label>
        </div>

        {/* If sameAsPermanent is unchecked, reveal permanent address inputs */}
        {!sameAsPermanent && (
          <div className="p-5 rounded-xl border border-neutral-200 bg-white space-y-5 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
              Permanent Residential Address Details
            </span>

            {/* Permanent Address Line 1 */}
            <div>
              <label htmlFor="permanentAddressLine1" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Permanent Flat / House No., Street <span className="text-danger-500">*</span>
              </label>
              <input
                id="permanentAddressLine1"
                type="text"
                placeholder="As per Voter ID / Passport / Aadhaar"
                {...register('permanentAddressLine1')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              {errors.permanentAddressLine1 && (
                <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                  {errors.permanentAddressLine1.message}
                </p>
              )}
            </div>

            {/* Permanent Address Line 2 */}
            <div>
              <label htmlFor="permanentAddressLine2" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Permanent Area / Sector / Landmark <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                id="permanentAddressLine2"
                type="text"
                placeholder="Village / Town / Landmark"
                {...register('permanentAddressLine2')}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
            </div>

            {/* Permanent PIN, City, State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label htmlFor="permanentPincode" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Permanent PIN Code <span className="text-danger-500">*</span>
                </label>
                <input
                  id="permanentPincode"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560001"
                  {...register('permanentPincode')}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-mono tracking-widest text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
                {permLookup.isServiceable && (
                  <span className="text-[11px] text-success-600 font-medium mt-1 inline-flex items-center gap-1">
                    ✓ {permLookup.city}, {permLookup.state}
                  </span>
                )}
                {errors.permanentPincode && (
                  <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                    {errors.permanentPincode.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="permanentCity" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Permanent City <span className="text-danger-500">*</span>
                </label>
                <input
                  id="permanentCity"
                  type="text"
                  placeholder="Permanent city"
                  {...register('permanentCity')}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
                {errors.permanentCity && (
                  <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                    {errors.permanentCity.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="permanentState" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Permanent State <span className="text-danger-500">*</span>
                </label>
                <input
                  id="permanentState"
                  type="text"
                  placeholder="Permanent state"
                  {...register('permanentState')}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
                {errors.permanentState && (
                  <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
                    {errors.permanentState.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Step4Address;

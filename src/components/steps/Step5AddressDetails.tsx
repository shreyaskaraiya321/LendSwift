import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/common/Checkbox';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { RESIDENCE_TYPE_OPTIONS } from '@/constants/loanConstants';
import { usePinLookup } from '@/hooks/usePinLookup';
import { LoanApplicationData } from '@/types/loan';
import { StepViewProps } from '@/types/wizard';

export function Step5AddressDetails(_props: StepViewProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LoanApplicationData>();

  const isPermanentSameAsCurrent = watch('isPermanentSameAsCurrent');
  const { lookupPincode, isLoading: isPinLoading } = usePinLookup();

  const handlePincodeChange = async (pincode: string) => {
    const clean = pincode.replace(/\D/g, '').slice(0, 6);
    setValue('currentAddress.pincode', clean, { shouldValidate: true });

    if (clean.length === 6) {
      const result = await lookupPincode(clean);
      if (result) {
        setValue('currentAddress.city', result.city, { shouldValidate: true });
        setValue('currentAddress.state', result.state, { shouldValidate: true });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold text-neutral-900">Residential Address Information</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Provide your current residence address. PIN code will auto-fill your city and state.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PIN Code */}
          <div>
            <Input
              label="6-Digit Indian Postal PIN Code"
              placeholder="e.g. 400051 or 560001"
              maxLength={6}
              required
              {...register('currentAddress.pincode', {
                onChange: (e) => handlePincodeChange(e.target.value),
              })}
              error={errors.currentAddress?.pincode?.message}
              helperText={isPinLoading ? 'Resolving postal district...' : 'Instant auto-fill for City & State'}
            />
          </div>

          {/* Residence Type */}
          <div>
            <Select
              label="Residence Ownership Type"
              required
              options={RESIDENCE_TYPE_OPTIONS}
              {...register('currentAddress.residenceType')}
              error={errors.currentAddress?.residenceType?.message}
            />
          </div>

          {/* Address Line 1 */}
          <div className="md:col-span-2">
            <Input
              label="Flat / House / Building & Street Name"
              placeholder="Flat 402, Royal Palms, Link Road"
              required
              {...register('currentAddress.line1')}
              error={errors.currentAddress?.line1?.message}
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <Input
              label="Area / Locality (Optional)"
              placeholder="Bandra West / Koramangala"
              {...register('currentAddress.line2')}
              error={errors.currentAddress?.line2?.message}
            />
          </div>

          {/* Landmark */}
          <div>
            <Input
              label="Prominent Landmark (Optional)"
              placeholder="Near Metro Pillar 140"
              {...register('currentAddress.landmark')}
              error={errors.currentAddress?.landmark?.message}
            />
          </div>

          {/* City */}
          <div>
            <Input
              label="City / District"
              required
              {...register('currentAddress.city')}
              error={errors.currentAddress?.city?.message}
            />
          </div>

          {/* State */}
          <div>
            <Input
              label="State / Union Territory"
              required
              {...register('currentAddress.state')}
              error={errors.currentAddress?.state?.message}
            />
          </div>

          {/* Years at Current Address */}
          <div className="md:col-span-2">
            <Input
              type="number"
              label="Duration at Current Address (in Years)"
              placeholder="3"
              required
              {...register('currentAddress.yearsAtCurrentAddress', { valueAsNumber: true })}
              error={errors.currentAddress?.yearsAtCurrentAddress?.message}
              helperText="Applicants residing >1 year receive streamlined verification"
            />
          </div>
        </div>

        {/* Permanent Address Toggle */}
        <div className="pt-4 border-t border-neutral-100">
          <Checkbox
            label="Permanent address is identical to current residence"
            description="Select this if your government ID address matches where you currently reside"
            {...register('isPermanentSameAsCurrent')}
          />
        </div>

        {/* Conditional Permanent Address Block */}
        {!isPermanentSameAsCurrent && (
          <div className="p-4 bg-neutral-50 rounded-fintech border border-neutral-200 space-y-4">
            <h4 className="text-sm font-bold text-neutral-800">Permanent Address Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Permanent Address Line"
                  placeholder="Ancestral / Permanent House details"
                  {...register('permanentAddress.line1')}
                />
              </div>
              <div>
                <Input
                  label="Permanent PIN Code"
                  placeholder="PIN Code"
                  maxLength={6}
                  {...register('permanentAddress.pincode')}
                />
              </div>
              <div>
                <Input
                  label="Permanent City"
                  placeholder="City"
                  {...register('permanentAddress.city')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

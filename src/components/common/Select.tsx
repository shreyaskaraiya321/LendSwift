import { forwardRef, ReactNode, SelectHTMLAttributes, useId } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[] | SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  iconLeft?: ReactNode;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder = 'Select an option',
      error,
      helperText,
      iconLeft,
      id,
      required,
      disabled,
      className = '',
      containerClassName = '',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const hasError = Boolean(error);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-neutral-700 flex items-center gap-1 select-none"
        >
          <span>{label}</span>
          {required && <span className="text-danger-500 font-bold" aria-hidden="true">*</span>}
        </label>

        <div className="relative rounded-fintech shadow-sm flex items-center">
          {iconLeft && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {iconLeft}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={`
              w-full appearance-none rounded-fintech py-2.5 pr-10 text-sm text-neutral-900 bg-white border transition-colors duration-150
              focus:outline-none
              ${iconLeft ? 'pl-10' : 'pl-3.5'}
              ${
                hasError
                  ? 'border-danger-500 focus:border-danger-600 focus:ring-1 focus:ring-danger-500 text-danger-900'
                  : 'border-neutral-300 hover:border-neutral-400 focus:border-primary-700 focus:ring-1 focus:ring-primary-700'
              }
              ${disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed border-neutral-200' : ''}
              ${className}
            `}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Chevron Down */}
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {hasError ? (
          <p id={errorId} className="text-xs text-danger-600 font-medium flex items-center gap-1 mt-0.5" role="alert">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-neutral-500 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

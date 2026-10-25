import { forwardRef, ReactNode, SelectHTMLAttributes, useId } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  options?: readonly SelectOption[] | SelectOption[];
  placeholder?: string;
  error?: ReactNode;
  helperText?: ReactNode;
  iconLeft?: ReactNode;
  containerClassName?: string;
  children?: ReactNode;
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
      children,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const hasError = Boolean(error);
    const hasHelper = Boolean(helperText);

    const describedByParts = [
      ariaDescribedBy,
      hasError ? errorId : undefined,
      hasHelper ? helperId : undefined,
    ].filter(Boolean);
    const describedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-neutral-700 flex items-center gap-1 select-none"
          >
            <span>{label}</span>
            {required && (
              <span className="text-danger-500 font-bold" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

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
            aria-describedby={describedBy}
            className={`
              w-full appearance-none rounded-fintech py-2.5 pr-10 text-sm text-neutral-900 bg-white border transition-colors duration-150
              focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-1
              ${iconLeft ? 'pl-10' : 'pl-3.5'}
              ${
                hasError
                  ? 'border-danger-500 focus:border-danger-600 focus-visible:ring-danger-500 text-danger-900'
                  : 'border-neutral-300 hover:border-neutral-400 focus:border-primary-700'
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
            {options?.map((option) => (
              <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
            {children}
          </select>

          {/* Custom Accessible Chevron Down */}
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {hasError ? (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs text-danger-600 font-medium flex items-center gap-1 mt-0.5"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0 text-danger-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        ) : hasHelper ? (
          <p id={helperId} className="text-xs text-neutral-500 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

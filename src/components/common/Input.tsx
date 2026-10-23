import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  prefixText?: string;
  suffixText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixText,
      suffixText,
      iconLeft,
      iconRight,
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
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(error);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700 flex items-center gap-1 select-none"
          >
            <span>{label}</span>
            {required && <span className="text-danger-500 font-bold" aria-hidden="true">*</span>}
          </label>
        </div>

        <div className="relative rounded-fintech shadow-sm flex items-center">
          {iconLeft && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {iconLeft}
            </div>
          )}

          {prefixText && (
            <span className="inline-flex items-center pl-3.5 pr-1.5 text-sm font-semibold text-neutral-500 select-none pointer-events-none">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={`
              w-full rounded-fintech py-2.5 text-sm text-neutral-900 bg-white border transition-colors duration-150
              placeholder:text-neutral-400 focus:outline-none
              ${iconLeft ? 'pl-10' : prefixText ? 'pl-1' : 'pl-3.5'}
              ${iconRight ? 'pr-10' : suffixText ? 'pr-12' : 'pr-3.5'}
              ${
                hasError
                  ? 'border-danger-500 focus:border-danger-600 focus:ring-1 focus:ring-danger-500 text-danger-900'
                  : 'border-neutral-300 hover:border-neutral-400 focus:border-primary-700 focus:ring-1 focus:ring-primary-700'
              }
              ${disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed border-neutral-200' : ''}
              ${className}
            `}
            {...rest}
          />

          {suffixText && (
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-medium text-neutral-500 pointer-events-none select-none">
              {suffixText}
            </span>
          )}

          {iconRight && !suffixText && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
              {iconRight}
            </div>
          )}
        </div>

        {hasError ? (
          <p id={errorId} className="text-xs text-danger-600 font-medium flex items-center gap-1 mt-0.5" role="alert">
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
        ) : helperText ? (
          <p id={helperId} className="text-xs text-neutral-500 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

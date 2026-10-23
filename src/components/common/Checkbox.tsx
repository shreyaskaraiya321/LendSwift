import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      id,
      disabled,
      className = '',
      containerClassName = '',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const errorId = `${checkboxId}-error`;

    const hasError = Boolean(error);

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        <label
          htmlFor={checkboxId}
          className={`flex items-start gap-3 select-none cursor-pointer ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center h-5 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              aria-invalid={hasError ? 'true' : 'false'}
              aria-describedby={hasError ? errorId : undefined}
              className={`
                h-4 w-4 rounded text-primary-800 border-neutral-300 focus:ring-primary-700
                transition duration-150 cursor-pointer
                ${hasError ? 'border-danger-500' : 'border-neutral-300'}
                ${className}
              `}
              {...rest}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-800 leading-snug">
              {label}
            </span>
            {description && (
              <span className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                {description}
              </span>
            )}
          </div>
        </label>

        {hasError && (
          <p id={errorId} className="text-xs text-danger-600 font-medium ml-7 mt-0.5" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

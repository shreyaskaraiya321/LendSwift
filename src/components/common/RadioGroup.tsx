import React, { forwardRef, ReactNode, useId } from 'react';

export interface RadioOption<T extends string | number = string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string | number = string> {
  label: ReactNode;
  name: string;
  options: readonly RadioOption<T>[] | RadioOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  error?: ReactNode;
  helperText?: ReactNode;
  layout?: 'grid' | 'stack' | 'inline' | 'vertical' | 'horizontal';
  columns?: 2 | 3 | 4;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
}

const RadioGroupInternal = forwardRef(function RadioGroupInternal<T extends string | number = string>(
  {
    label,
    name,
    options,
    value,
    defaultValue,
    onChange,
    error,
    helperText,
    layout = 'grid',
    columns = 3,
    disabled = false,
    required = false,
    className = '',
    containerClassName = '',
  }: RadioGroupProps<T>,
  ref: React.ForwardedRef<HTMLFieldSetElement>
) {
  const generatedId = useId();
  const groupId = `radiogroup-${generatedId}`;
  const errorId = `${groupId}-error`;
  const helperId = `${groupId}-helper`;
  const hasError = Boolean(error);
  const hasHelper = Boolean(helperText);

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  const layoutClass =
    layout === 'horizontal' || layout === 'inline'
      ? 'flex flex-wrap gap-3'
      : layout === 'vertical' || layout === 'stack'
      ? 'flex flex-col gap-2.5'
      : `grid gap-3 ${gridColsClass}`;

  return (
    <fieldset
      ref={ref}
      id={groupId}
      className={`w-full space-y-2 ${containerClassName}`}
      aria-describedby={hasError ? errorId : hasHelper ? helperId : undefined}
    >
      <legend className="text-sm font-medium text-neutral-700 select-none flex items-center gap-1">
        <span>{label}</span>
        {required && (
          <span className="text-danger-500 font-bold" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      <div
        className={`${layoutClass} ${className}`}
        role="radiogroup"
        aria-label={typeof label === 'string' ? label : name}
      >
        {options.map((option) => {
          const isSelected = value !== undefined ? option.value === value : undefined;
          const isDefault = defaultValue !== undefined ? option.value === defaultValue : undefined;
          const inputId = `${name}-${String(option.value)}`;
          const isOptionDisabled = disabled || option.disabled;

          return (
            <label
              key={String(option.value)}
              htmlFor={inputId}
              className={`
                relative flex items-start p-3.5 rounded-fintech border transition-all duration-150 cursor-pointer select-none
                ${
                  isSelected
                    ? 'border-primary-800 bg-primary-50/60 ring-1 ring-primary-800 shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                }
                ${isOptionDisabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="radio"
                  id={inputId}
                  name={name}
                  value={String(option.value)}
                  checked={isSelected}
                  defaultChecked={isDefault}
                  disabled={isOptionDisabled}
                  required={required}
                  onChange={() => onChange?.(option.value)}
                  className="h-4 w-4 text-primary-800 border-neutral-300 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 cursor-pointer transition-colors"
                />
              </div>

              <div className="ml-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-primary-900' : 'text-neutral-800'
                    }`}
                  >
                    {option.label}
                  </span>
                  {option.badge && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-success-50 text-success-700 border border-success-200">
                      {option.badge}
                    </span>
                  )}
                </div>

                {option.description && (
                  <span className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {hasError ? (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-xs text-danger-600 font-medium flex items-center gap-1 mt-1"
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
        <p id={helperId} className="text-xs text-neutral-500 mt-1">
          {helperText}
        </p>
      ) : null}
    </fieldset>
  );
});

export const RadioGroup = RadioGroupInternal as unknown as <T extends string | number = string>(
  props: RadioGroupProps<T> & { ref?: React.ForwardedRef<HTMLFieldSetElement> }
) => React.ReactElement;

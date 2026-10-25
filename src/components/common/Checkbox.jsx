import React, { forwardRef, useId } from 'react';

export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    error,
    badge,
    variant = 'default',
    layout = 'vertical',
    id,
    disabled,
    checked,
    defaultChecked,
    className = '',
    containerClassName = '',
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const errorId = `${checkboxId}-error`;
  const descId = `${checkboxId}-desc`;

  const hasError = Boolean(error);
  const hasDesc = Boolean(description);

  const describedByParts = [
    ariaDescribedBy,
    hasError ? errorId : undefined,
    hasDesc ? descId : undefined,
  ].filter(Boolean);
  const describedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  const isCard = variant === 'card';

  return (
    <div
      className={`flex ${
        layout === 'horizontal' ? 'flex-row items-center gap-3' : 'flex-col gap-1'
      } ${containerClassName}`}
    >
      <label
        htmlFor={checkboxId}
        className={`
          select-none cursor-pointer transition-all duration-150
          ${
            isCard
              ? `p-3.5 rounded-fintech border flex items-start gap-3.5 ${
                  checked
                    ? 'border-primary-800 bg-primary-50/60 ring-1 ring-primary-800 shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                }`
              : 'flex items-start gap-3'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-center h-5 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={`
              h-4 w-4 rounded text-primary-800 border-neutral-300
              focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2
              transition duration-150 cursor-pointer
              ${hasError ? 'border-danger-500' : 'border-neutral-300'}
              ${className}
            `}
            {...rest}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-800 leading-snug">
              {label}
            </span>
            {badge && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-success-50 text-success-700 border border-success-200">
                {badge}
              </span>
            )}
          </div>

          {description && (
            <span id={descId} className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
              {description}
            </span>
          )}
        </div>
      </label>

      {hasError && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-xs text-danger-600 font-medium ml-7 mt-0.5 flex items-center gap-1"
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
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

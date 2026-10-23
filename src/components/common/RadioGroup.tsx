import { ReactNode } from 'react';

export interface RadioOption<T extends string | number> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
}

export interface RadioGroupProps<T extends string | number> {
  label: string;
  name: string;
  options: readonly RadioOption<T>[] | RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
  layout?: 'grid' | 'stack' | 'inline';
  columns?: 2 | 3 | 4;
  disabled?: boolean;
}

export function RadioGroup<T extends string | number>({
  label,
  name,
  options,
  value,
  onChange,
  error,
  layout = 'grid',
  columns = 3,
  disabled = false,
}: RadioGroupProps<T>) {
  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  return (
    <fieldset className="w-full space-y-2">
      <legend className="text-sm font-medium text-neutral-700 select-none">
        {label}
      </legend>

      <div
        className={
          layout === 'grid'
            ? `grid gap-3 ${gridColsClass}`
            : layout === 'inline'
            ? 'flex flex-wrap gap-2.5'
            : 'space-y-2.5'
        }
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          const inputId = `${name}-${String(option.value)}`;

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
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                id={inputId}
                name={name}
                value={String(option.value)}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 mt-0.5 text-primary-800 border-neutral-300 focus:ring-primary-700"
              />

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

      {error && (
        <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

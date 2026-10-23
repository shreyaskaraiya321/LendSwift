import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  headerBorder?: boolean;
}

export function Card({
  title,
  subtitle,
  action,
  children,
  headerBorder = false,
  className = '',
  ...rest
}: CardProps) {
  const hasHeader = title || subtitle || action;

  return (
    <div
      className={`bg-white rounded-fintech border border-neutral-200/80 shadow-card transition-shadow duration-200 ${className}`}
      {...rest}
    >
      {hasHeader && (
        <div
          className={`px-5 py-4 flex items-center justify-between ${
            headerBorder ? 'border-b border-neutral-100' : ''
          }`}
        >
          <div>
            {title && (
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>
    </div>
  );
}

import { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
}: BadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }[size];

  const variantStyles = {
    primary: 'bg-primary-50 text-primary-800 border-primary-200',
    success: 'bg-success-50 text-success-700 border-success-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    danger: 'bg-danger-50 text-danger-700 border-danger-200',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeStyles} ${variantStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

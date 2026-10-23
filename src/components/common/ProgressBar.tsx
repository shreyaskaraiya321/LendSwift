export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showLabels?: boolean;
  className?: string;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  showLabels = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-semibold select-none">
          <span className="text-primary-800">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-neutral-500">{percentage}% Completed</span>
        </div>
      )}

      <div
        className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden shadow-inner"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Loan application progress: ${percentage}%`}
      >
        <div
          className="bg-gradient-to-r from-primary-800 to-primary-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

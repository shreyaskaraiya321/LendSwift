import { StepFormData, STEPS } from './stepRegistry';

export interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  completedSteps?: Set<number> | number[];
  formData?: StepFormData;
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

export function ProgressBar({
  currentStep,
  totalSteps = 8,
  completedSteps = new Set(),
  formData,
  onStepClick,
  className = '',
}: ProgressBarProps) {
  const completedSet = completedSteps instanceof Set ? completedSteps : new Set(completedSteps);
  const activeStepDef = STEPS.find((s) => s.stepNumber === currentStep) || STEPS[0];
  const percentage = Math.min(100, Math.max(0, Math.round((currentStep / totalSteps) * 100)));

  return (
    <div
      className={`w-full bg-white rounded-fintech border border-neutral-200/80 shadow-sm p-4 sm:p-5 ${className}`}
      aria-label="Application Progress"
    >
      {/* Accessible Screen Reader Progress Announcement */}
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuetext={`Step ${currentStep} of ${totalSteps}: ${activeStepDef.title} (${percentage}% complete)`}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-neutral-400" aria-hidden="true">
              •
            </span>
            <span className="text-xs font-semibold text-neutral-800 line-clamp-1">
              {activeStepDef.title}
            </span>
          </div>

          <span className="text-xs font-bold text-primary-700 font-mono">
            {percentage}% Complete
          </span>
        </div>

        {/* Visual Progress Bar Fill */}
        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-700 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Step Dots & Visual Indicators */}
      <ol className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-4 pt-3 border-t border-neutral-100">
        {STEPS.map((step) => {
          const isActive = step.stepNumber === currentStep;
          const isCompleted = completedSet.has(step.stepNumber);
          const isVisible = step.isStepVisible(formData);
          const isSkipped = !isVisible;
          const isClickable = isCompleted || step.stepNumber <= currentStep;

          let statusLabel = 'Pending';
          if (isActive) statusLabel = 'Current';
          else if (isCompleted) statusLabel = 'Completed';
          else if (isSkipped) statusLabel = 'Skipped';

          return (
            <li key={step.id} className="flex flex-col items-center text-center">
              <button
                type="button"
                disabled={!isClickable || !onStepClick || isSkipped}
                onClick={() => isClickable && !isSkipped && onStepClick && onStepClick(step.stepNumber)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${step.stepNumber}: ${step.title} (${statusLabel})`}
                className={`
                  group flex flex-col items-center focus:outline-none transition-all duration-200 w-full
                  ${isClickable && !isSkipped ? 'cursor-pointer' : 'cursor-default'}
                  ${isSkipped ? 'opacity-40' : ''}
                `}
              >
                {/* Step Circle Badge */}
                <div
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200
                    ${
                      isCompleted
                        ? 'bg-success-500 text-white shadow-xs'
                        : isActive
                        ? 'bg-primary-800 text-white ring-4 ring-primary-100 shadow-sm'
                        : isSkipped
                        ? 'bg-neutral-50 text-neutral-400 border border-dashed border-neutral-300'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isSkipped ? (
                    <span className="text-[10px] select-none" aria-hidden="true">-</span>
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                {/* Step Title Label */}
                <span
                  className={`
                    mt-1 text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-1
                    ${isActive ? 'text-primary-800' : isCompleted ? 'text-neutral-800' : 'text-neutral-400'}
                  `}
                >
                  {step.shortTitle}
                </span>

                {/* Skipped Badge */}
                {isSkipped && (
                  <span className="text-[9px] text-neutral-400 font-normal">
                    Skipped
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ProgressBar;

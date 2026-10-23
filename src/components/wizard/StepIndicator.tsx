import { STEPS_CONFIG } from '@/constants/loanConstants';
import { StepNumber } from '@/types/wizard';

export interface StepIndicatorProps {
  currentStep: StepNumber;
  completedSteps: Set<StepNumber>;
  onStepClick?: (step: StepNumber) => void;
  className?: string;
}

export function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
  className = '',
}: StepIndicatorProps) {
  return (
    <nav
      aria-label="Loan Application Steps"
      className={`w-full bg-white rounded-fintech border border-neutral-200/80 shadow-sm p-4 sm:p-5 ${className}`}
    >
      <ol className="grid grid-cols-4 sm:grid-cols-8 gap-2 relative">
        {STEPS_CONFIG.map((step) => {
          const isCurrent = step.stepNumber === currentStep;
          const isCompleted = completedSteps.has(step.stepNumber);
          const isClickable = isCompleted || step.stepNumber <= currentStep;

          return (
            <li key={step.id} className="flex flex-col items-center text-center">
              <button
                type="button"
                disabled={!isClickable || !onStepClick}
                onClick={() => isClickable && onStepClick && onStepClick(step.stepNumber)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`
                  group flex flex-col items-center focus:outline-none transition-all duration-200
                  ${isClickable ? 'cursor-pointer' : 'cursor-default opacity-60'}
                `}
              >
                {/* Step Circle */}
                <div
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200
                    ${
                      isCompleted
                        ? 'bg-success-500 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-primary-800 text-white ring-4 ring-primary-100 shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                {/* Step Title */}
                <span
                  className={`
                    mt-1.5 text-[11px] sm:text-xs font-semibold leading-tight line-clamp-1
                    ${isCurrent ? 'text-primary-800' : isCompleted ? 'text-neutral-800' : 'text-neutral-500'}
                  `}
                >
                  {step.shortTitle}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

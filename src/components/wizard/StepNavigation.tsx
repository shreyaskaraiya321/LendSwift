import { Button } from '@/components/common/Button';
import { FormAutoSaveState, StepNumber } from '@/types/wizard';

export interface StepNavigationProps {
  currentStep: StepNumber;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  isValidating?: boolean;
  autoSaveState?: FormAutoSaveState;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  isSubmitting = false,
  isValidating = false,
  autoSaveState,
}: StepNavigationProps) {
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  return (
    <div className="w-full flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-200 mt-8">
      {/* Left Action: Previous */}
      <div>
        {!isFirst ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onPrevious}
            disabled={isSubmitting || isValidating}
            iconLeft={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Previous Step
          </Button>
        ) : (
          <span className="text-xs text-neutral-400 hidden sm:inline select-none">
            Step 1 of {totalSteps}
          </span>
        )}
      </div>

      {/* Center: Auto-save status indicator */}
      {autoSaveState && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 select-none">
          {autoSaveState.status === 'saving' && (
            <>
              <span className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
              <span>Saving draft...</span>
            </>
          )}
          {autoSaveState.status === 'saved' && (
            <>
              <span className="w-2 h-2 rounded-full bg-success-500" />
              <span>
                Draft saved {autoSaveState.lastSavedAt ? `at ${autoSaveState.lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </span>
            </>
          )}
          {autoSaveState.status === 'error' && (
            <>
              <span className="w-2 h-2 rounded-full bg-danger-500" />
              <span className="text-danger-600">Auto-save error</span>
            </>
          )}
        </div>
      )}

      {/* Right Actions: Save Draft & Continue/Submit */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {onSaveDraft && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onSaveDraft}
            disabled={isSubmitting || isValidating}
            className="hidden sm:inline-flex text-neutral-600"
          >
            Save Draft
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onNext}
          isLoading={isSubmitting || isValidating}
          className="w-full sm:w-auto min-w-[150px]"
          iconRight={
            !isLast ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            ) : undefined
          }
        >
          {isLast ? 'Submit Loan Application' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}

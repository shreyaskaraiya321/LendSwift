import { RefObject, useEffect, useRef } from 'react';

import { Button } from '@/components/common/Button';
import { FormAutoSaveState, StepNumber } from '@/types/wizard';

/**
 * Focuses the first interactive input element inside the specified container,
 * ignoring elements inside data-step-navigation.
 */
function focusFirstStepInput(container?: HTMLElement | null): boolean {
  if (!container || typeof container.querySelectorAll !== 'function') {
    return false;
  }

  const focusable = container.querySelectorAll<HTMLElement>(
    'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
  );

  for (const el of Array.from(focusable)) {
    if (!el.closest('[data-step-navigation]')) {
      el.focus();
      return true;
    }
  }

  return false;
}

export interface StepNavigationProps {
  currentStep: StepNumber;
  totalSteps?: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  isValidating?: boolean;
  autoSaveState?: FormAutoSaveState;
  stepContainerRef?: RefObject<HTMLElement | null>;
  stepContainerId?: string;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps = 8,
  onPrevious,
  onNext,
  onSaveDraft,
  isSubmitting = false,
  isValidating = false,
  autoSaveState,
  stepContainerRef,
  stepContainerId,
  nextLabel,
  backLabel,
  className = '',
}: StepNavigationProps) {
  const isFirst = currentStep <= 1;
  const isLast = currentStep >= totalSteps;
  const isBusy = Boolean(isSubmitting || isValidating);
  const prevStepRef = useRef<number>(currentStep);

  // Focus management: on step transition, programmatically focus first input
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;

      const timer = setTimeout(() => {
        let container: HTMLElement | null = null;
        if (stepContainerRef && stepContainerRef.current) {
          container = stepContainerRef.current;
        } else if (stepContainerId) {
          container = document.getElementById(stepContainerId);
        } else {
          container =
            document.querySelector('[data-step-container]') ||
            document.querySelector('[data-step-view]') ||
            document.querySelector('main form') ||
            document.querySelector('form') ||
            document.querySelector('main');
        }

        focusFirstStepInput(container);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [currentStep, stepContainerRef, stepContainerId]);

  // Anti-double-submission handlers
  const handleNext = (e?: React.MouseEvent) => {
    if (isBusy) {
      if (e?.preventDefault) e.preventDefault();
      return;
    }
    onNext();
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    if (isBusy) {
      if (e?.preventDefault) e.preventDefault();
      return;
    }
    onPrevious();
  };

  const handleSaveDraft = (e?: React.MouseEvent) => {
    if (isBusy) {
      if (e?.preventDefault) e.preventDefault();
      return;
    }
    onSaveDraft?.();
  };

  const resolvedNextLabel = nextLabel || (isLast ? 'Submit Loan Application' : 'Save & Continue');
  const resolvedBackLabel = backLabel || 'Previous Step';

  return (
    <nav
      data-step-navigation="true"
      aria-label="Application step navigation"
      aria-busy={isSubmitting}
      className={`w-full flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-200 mt-8 ${className}`}
    >
      {/* Back Button */}
      <div>
        {!isFirst ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handlePrevious}
            disabled={isBusy}
            aria-disabled={isBusy}
            aria-label="Go back to previous step"
            iconLeft={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            {resolvedBackLabel}
          </Button>
        ) : (
          <span className="text-xs text-neutral-400 hidden sm:inline select-none" aria-hidden="true">
            Step 1 of {totalSteps}
          </span>
        )}
      </div>

      {/* Auto-save status indicator */}
      {autoSaveState && (
        <div
          className="flex items-center gap-1.5 text-xs text-neutral-500 select-none"
          role="status"
          aria-live="polite"
        >
          {autoSaveState.status === 'saving' && (
            <>
              <span className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" aria-hidden="true" />
              <span>Saving draft...</span>
            </>
          )}
          {autoSaveState.status === 'saved' && (
            <>
              <span className="w-2 h-2 rounded-full bg-success-500" aria-hidden="true" />
              <span>
                Draft saved {autoSaveState.lastSavedAt ? `at ${new Date(autoSaveState.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </span>
            </>
          )}
          {autoSaveState.status === 'error' && (
            <>
              <span className="w-2 h-2 rounded-full bg-danger-500" aria-hidden="true" />
              <span className="text-danger-600">Auto-save error</span>
            </>
          )}
        </div>
      )}

      {/* Save Draft & Continue/Submit Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {onSaveDraft && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleSaveDraft}
            disabled={isBusy}
            aria-disabled={isBusy}
            aria-label="Save draft application"
            className="hidden sm:inline-flex text-neutral-600"
            iconLeft={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            }
          >
            Save Draft
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleNext}
          disabled={isBusy}
          isLoading={isSubmitting}
          aria-disabled={isBusy}
          aria-label={isLast ? 'Submit loan application' : 'Continue to next step'}
          className="w-full sm:w-auto min-w-[150px]"
          iconRight={
            !isLast ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            ) : undefined
          }
        >
          {resolvedNextLabel}
        </Button>
      </div>
    </nav>
  );
}

export default StepNavigation;

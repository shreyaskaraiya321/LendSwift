import { useEffect, useRef } from 'react';

import { Button } from '@/components/common/Button';
import { STEPS } from '@/components/wizard/stepRegistry';
import { StepNumber } from '@/types/wizard';

export interface ResumeDraftModalProps {
  isOpen: boolean;
  stepNumber?: StepNumber | number;
  stepTitle?: string;
  lastSaved?: string | Date | number | null;
  loanType?: string;
  onResume: () => void;
  onStartFresh: () => void;
  onClose?: () => void;
}

/**
 * Accessible ResumeDraftModal dialog with a comprehensive focus trap.
 * Displayed when an existing loan application draft is detected in local storage.
 */
export function ResumeDraftModal({
  isOpen,
  stepNumber = 1,
  stepTitle,
  lastSaved,
  loanType,
  onResume,
  onStartFresh,
  onClose,
}: ResumeDraftModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const resumeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Derive step title if not explicitly passed
  const resolvedStepDef = STEPS.find((s) => s.stepNumber === stepNumber);
  const resolvedStepTitle = stepTitle || resolvedStepDef?.title || `Step ${stepNumber}`;

  // Focus trap & modal lifecycle management
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element before opening dialog
    triggerElementRef.current = document.activeElement as HTMLElement | null;

    // Lock background page scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus primary action button on mount
    const focusTimer = setTimeout(() => {
      if (resumeButtonRef.current) {
        resumeButtonRef.current.focus();
      } else if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 50);

    // Keydown handler for Tab cycling and Escape key dismiss
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (onClose) {
          onClose();
        } else {
          onStartFresh();
        }
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab: if on first element, wrap to last
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to original triggering element
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    };
  }, [isOpen, onClose, onStartFresh]);

  if (!isOpen) return null;

  const formattedTimestamp = lastSaved
    ? new Date(lastSaved).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fade-in"
      role="presentation"
    >
      {/* Accessible Dialog Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-draft-title"
        aria-describedby="resume-draft-desc"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200/80 p-6 sm:p-7 relative transform transition-all"
      >
        {/* Header Icon & Close Button */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center ring-4 ring-primary-50/50">
            <svg
              className="w-6 h-6 stroke-[2]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <button
            type="button"
            onClick={onClose || onStartFresh}
            aria-label="Close dialog and dismiss draft prompt"
            className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Heading */}
        <h2 id="resume-draft-title" className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          In-Progress Application Found
        </h2>

        {/* Primary Dialog Question */}
        <p id="resume-draft-desc" className="text-neutral-700 text-sm sm:text-base mt-2 leading-relaxed">
          Resume your previous application from Step {stepNumber} or start fresh?
        </p>

        {/* Draft Metadata Card */}
        <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs sm:text-sm space-y-2">
          <div className="flex justify-between items-center text-neutral-600">
            <span className="font-medium text-neutral-500">Last Active Step:</span>
            <span className="font-semibold text-neutral-900">
              Step {stepNumber}: {resolvedStepTitle}
            </span>
          </div>

          {loanType && (
            <div className="flex justify-between items-center text-neutral-600">
              <span className="font-medium text-neutral-500">Loan Category:</span>
              <span className="font-semibold text-primary-800 uppercase tracking-wide text-xs">
                {loanType} Loan
              </span>
            </div>
          )}

          {formattedTimestamp && (
            <div className="flex justify-between items-center text-neutral-600">
              <span className="font-medium text-neutral-500">Auto-Saved On:</span>
              <span className="font-medium text-neutral-700">{formattedTimestamp}</span>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <p className="text-[11px] text-neutral-500 mt-3 leading-normal">
          Encrypted with AES-256-GCM according to RBI data privacy regulations. Starting fresh will securely overwrite your stored draft.
        </p>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onStartFresh}
            className="w-full sm:w-auto"
            aria-label="Discard draft and start fresh application"
          >
            Start Fresh
          </Button>

          <Button
            ref={resumeButtonRef}
            type="button"
            variant="primary"
            size="md"
            onClick={onResume}
            className="w-full sm:w-auto"
            aria-label={`Resume application from step ${stepNumber}`}
          >
            Resume from Step {stepNumber}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResumeDraftModal;

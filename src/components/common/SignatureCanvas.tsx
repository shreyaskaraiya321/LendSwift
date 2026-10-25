import { useEffect, useRef } from 'react';
import SignaturePad from 'react-signature-canvas';

import { Badge } from '@/components/common/Badge';

export interface SignatureCanvasProps {
  label?: string;
  description?: string;
  required?: boolean;
  value?: string;
  onChange: (signatureData: string) => void;
  error?: string;
}

/**
 * Responsive Digital Signature Canvas using react-signature-canvas.
 */
export function SignatureCanvas({
  label = 'Digital Signature (Borrower e-Signature)',
  description = 'Draw your signature within the box below using mouse, touch, or stylus.',
  required = true,
  value,
  onChange,
  error,
}: SignatureCanvasProps) {
  const sigPadRef = useRef<SignaturePad | null>(null);

  // Load existing signature data if value is provided and pad is empty
  useEffect(() => {
    if (value && sigPadRef.current && sigPadRef.current.isEmpty()) {
      try {
        sigPadRef.current.fromDataURL(value);
      } catch {
        // ignore load errors if string is not valid image
      }
    }
  }, [value]);

  const handleEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      try {
        const trimmedCanvas = sigPadRef.current.getTrimmedCanvas();
        const dataUrl = trimmedCanvas.toDataURL('image/png');
        onChange(dataUrl);
      } catch {
        // Fallback to untrimmed canvas if trimmed fails
        const dataUrl = sigPadRef.current.toDataURL('image/png');
        onChange(dataUrl);
      }
    }
  };

  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      onChange('');
    }
  };

  const hasSignature = Boolean(value && value.length > 50);

  return (
    <div className="w-full space-y-2">
      {/* Header with Title and Verification Status Badge */}
      <div className="flex items-center justify-between">
        <div>
          <span id="signature-canvas-label" className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
            {label} {required && <span className="text-danger-500">*</span>}
          </span>
          <span className="text-[11px] text-neutral-400 block mt-0.5">{description}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasSignature ? (
            <Badge variant="success" size="sm">
              ✓ Signature Captured
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Pending Signature
            </Badge>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-neutral-500 hover:text-danger-600 font-semibold px-2 py-1 rounded hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-700"
          >
            Clear Signature
          </button>
        </div>
      </div>

      {/* Signature Canvas Pad Container */}
      <div
        className={`
          relative w-full rounded-xl border bg-white overflow-hidden transition-all duration-150
          ${error ? 'border-danger-400 ring-2 ring-danger-400/20' : 'border-neutral-300 focus-within:ring-2 focus-within:ring-primary-700'}
        `}
      >
        <SignaturePad
          ref={sigPadRef}
          onEnd={handleEnd}
          penColor="#1F4E79"
          canvasProps={{
            className: 'w-full h-44 bg-white cursor-crosshair touch-none select-none',
            'aria-label': 'Digital Signature Drawing Area',
            'aria-labelledby': 'signature-canvas-label',
          }}
        />

        {/* Signing Guide Watermark Line */}
        <div className="absolute bottom-6 left-6 right-6 pointer-events-none border-b border-dashed border-neutral-300/80 flex justify-between items-end pb-1">
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Sign on the line</span>
          <span className="text-[10px] text-neutral-300 font-mono">LendSwift e-Sign</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-danger-600 font-medium mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default SignatureCanvas;

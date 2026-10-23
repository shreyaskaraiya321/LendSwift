import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState } from 'react';

export interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSizeMb?: number;
  fileName?: string;
  onFileSelect: (fileName: string, file: File) => void;
  onFileRemove?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FileUpload({
  label,
  description = 'Supports PDF, JPG, or PNG up to 5MB',
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMb = 5,
  fileName,
  onFileSelect,
  onFileRemove,
  error,
  required = false,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setLocalError(null);
    const sizeInMb = file.size / (1024 * 1024);

    if (sizeInMb > maxSizeMb) {
      setLocalError(`File size exceeds maximum allowable limit of ${maxSizeMb}MB`);
      return;
    }

    onFileSelect(file.name, file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const displayError = error || localError;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700 flex items-center gap-1 select-none">
          <span>{label}</span>
          {required && <span className="text-danger-500 font-bold">*</span>}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        id={`upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />

      {fileName ? (
        <div className="flex items-center justify-between p-3.5 bg-primary-50/50 rounded-fintech border border-primary-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 text-primary-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-neutral-900 truncate">{fileName}</p>
              <p className="text-[11px] text-success-600 font-medium">Ready for encrypted upload</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary-700 hover:text-primary-800 font-semibold underline px-2 py-1"
            >
              Replace
            </button>
            {onFileRemove && (
              <button
                type="button"
                onClick={onFileRemove}
                className="text-neutral-400 hover:text-danger-600 p-1"
                aria-label="Remove uploaded file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-fintech p-6 text-center cursor-pointer transition-colors duration-150
            flex flex-col items-center justify-center gap-2 select-none focus:outline-none focus:ring-2 focus:ring-primary-700
            ${
              isDragging
                ? 'border-primary-700 bg-primary-50/50'
                : displayError
                ? 'border-danger-400 bg-danger-50/20'
                : 'border-neutral-300 hover:border-primary-600 hover:bg-neutral-50/60'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100' : ''}
          `}
        >
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-800">
              <span className="text-primary-800 underline">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
          </div>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-danger-600 font-medium flex items-center gap-1 mt-1" role="alert">
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Badge } from '@/components/common/Badge';
import compressImage from '@/utils/imageCompressor.js';

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}


/**
 * Accessible File Upload Component with react-dropzone and automatic client-side image compression.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.description]
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.error]
 * @param {object|null} [props.value] - Uploaded file metadata object
 * @param {Function} props.onChange - Callback with file data or null
 * @param {string} [props.badgeText] - Optional status badge (e.g. 'Mandatory', 'Optional')
 */
export function FileUpload({
  label,
  description = 'Supports PDF, JPG, or PNG (Max 5MB)',
  required = false,
  disabled = false,
  error,
  value,
  onChange,
  badgeText,
}) {
  const [localError, setLocalError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(100);

  const onDrop = async (acceptedFiles, fileRejections) => {
    setLocalError('');

    if (fileRejections && fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errorMsg = rejection.errors[0]?.message || 'Invalid file';
      if (errorMsg.includes('larger than')) {
        setLocalError('File size exceeds maximum permissible limit of 5MB');
      } else if (errorMsg.includes('file type')) {
        setLocalError('Invalid file type. Only PDF, JPG, and PNG are allowed');
      } else {
        setLocalError(errorMsg);
      }
      return;
    }

    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const rawFile = acceptedFiles[0];
    setIsProcessing(true);
    setUploadProgress(40);

    try {
      let finalFile = rawFile;
      let originalSize = rawFile.size;
      let compressedSize = rawFile.size;
      let isCompressed = false;
      let previewUrl = null;

      // Create preview URL for images
      if (rawFile.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(rawFile);

        // Auto-trigger client-side image compression
        const compressionResult = await compressImage(rawFile, {
          maxDimension: 1200,
          maxSizeBytes: 2 * 1024 * 1024,
        });

        if (compressionResult && compressionResult.compressedFile) {
          finalFile = compressionResult.compressedFile;
          compressedSize = compressionResult.compressedSize;
          originalSize = compressionResult.originalSize;
          isCompressed = compressedSize < originalSize;
        }
      }

      setUploadProgress(100);

      const fileData = {
        name: finalFile.name,
        size: compressedSize,
        type: finalFile.type,
        previewUrl,
        originalSize,
        compressedSize,
        isCompressed,
        uploadedAt: new Date().toISOString(),
      };

      onChange(fileData);
    } catch (err) {
      setLocalError(err.message || 'Error processing file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (value?.previewUrl) {
      try {
        URL.revokeObjectURL(value.previewUrl);
      } catch {
        // ignore cleanup error
      }
    }
    setLocalError('');
    onChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: disabled || isProcessing,
  });

  const displayError = error || localError;
  const isPdf = value?.type === 'application/pdf' || value?.name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="w-full space-y-2">
      {/* Label and Status Badge Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1 select-none">
          <span>{label}</span>
          {required && <span className="text-danger-500 font-bold">*</span>}
        </label>
        {badgeText && (
          <Badge variant={required ? 'primary' : 'neutral'} size="sm">
            {badgeText}
          </Badge>
        )}
      </div>

      {/* Uploaded State Card */}
      {value ? (
        <div className="flex items-center justify-between p-3.5 bg-primary-50/50 rounded-xl border border-primary-200 transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Thumbnail Preview or PDF Icon */}
            <div className="w-12 h-12 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {isPdf ? (
                <div className="text-center">
                  <span className="text-[10px] font-black text-danger-600 uppercase block tracking-tighter">PDF</span>
                  <svg className="w-4 h-4 mx-auto text-danger-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : value.previewUrl ? (
                <img
                  src={value.previewUrl}
                  alt={value.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-6 h-6 text-primary-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* File Metadata & Compression Badge */}
            <div className="truncate space-y-1">
              <p className="text-xs font-semibold text-neutral-900 truncate max-w-xs">{value.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-500 font-medium">
                  {formatFileSize(value.size)}
                </span>
                {value.isCompressed && value.originalSize && (
                  <Badge variant="success" size="sm">
                    Compressed from {formatFileSize(value.originalSize)} to {formatFileSize(value.compressedSize)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Remove / Replace Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-danger-500"
              aria-label={`Remove uploaded document ${label}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Active Area */
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150
            flex flex-col items-center justify-center gap-2 select-none focus:outline-none focus:ring-2 focus:ring-primary-700
            ${
              isDragActive
                ? 'border-primary-700 bg-primary-50/70 scale-[0.99]'
                : displayError
                ? 'border-danger-400 bg-danger-50/20'
                : 'border-neutral-300 hover:border-primary-600 hover:bg-neutral-50/70'
            }
            ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed bg-neutral-100' : ''}
          `}
        >
          <input {...getInputProps()} />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="w-6 h-6 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-primary-800 font-semibold">Processing & compressing image...</p>
              <div className="w-32 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary-700 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-primary-100/60 flex items-center justify-center text-primary-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-800">
                  <span className="text-primary-800 underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{description}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <p className="text-xs text-danger-600 font-medium flex items-center gap-1 mt-1" role="alert">
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
}

export default FileUpload;

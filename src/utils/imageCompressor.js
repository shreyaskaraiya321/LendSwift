export const MAX_IMAGE_DIMENSION = 1200;
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const INITIAL_JPEG_QUALITY = 0.7;
export const MIN_JPEG_QUALITY = 0.3;
export const QUALITY_STEP = 0.1;

/**
 * Checks if a file is a PDF based on MIME type or file extension.
 *
 * @param {File} file
 * @returns {boolean}
 */
export function isPdfFile(file) {
  if (!file) return false;
  return (
    file.type === 'application/pdf' ||
    (typeof file.name === 'string' && file.name.toLowerCase().endsWith('.pdf'))
  );
}

/**
 * Loads a File object into an HTMLImageElement asynchronously.
 *
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load image file: ${file.name}`));
      };
      img.src = objectUrl;
    } else if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image file: ${file.name}`));
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('FileReader result is not a string'));
        }
      };
      reader.onerror = () => reject(new Error(`FileReader failed for: ${file.name}`));
      reader.readAsDataURL(file);
    } else {
      reject(new Error('Browser environment does not support image reading'));
    }
  });
}

/**
 * Converts a Canvas element to a Blob asynchronously.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} mimeType
 * @param {number} quality
 * @returns {Promise<Blob|null>}
 */
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    } else if (typeof canvas.toDataURL === 'function') {
      try {
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || mimeType;
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        resolve(new Blob([u8arr], { type: mime }));
      } catch {
        resolve(null);
      }
    } else {
      resolve(null);
    }
  });
}

/**
 * Non-blocking client-side Canvas compression for image files (JPG, PNG).
 * - Accepts a File, loads it onto a hidden HTML5 canvas scaled to max 1200px (maintaining aspect ratio).
 * - Exports blob at 0.7 JPEG quality. If output exceeds 2MB, iteratively steps down quality by 0.1 (down to min 0.3).
 * - Resolves with { compressedFile, originalSize, compressedSize, compressionRatio }.
 * - Rejects or bypasses PDFs safely without compression.
 *
 * @param {File} file - Input image or PDF file
 * @param {object} [options={}] - Optional configuration
 * @param {number} [options.maxDimension=1200] - Max width or height
 * @param {number} [options.maxSizeBytes=2097152] - Max output file size (2MB)
 * @param {number} [options.initialQuality=0.7] - Initial JPEG compression quality
 * @param {number} [options.minQuality=0.3] - Minimum compression quality floor
 * @param {number} [options.qualityStep=0.1] - Decrement step per iteration
 * @param {boolean} [options.rejectPdf=false] - If true, rejects PDFs instead of bypassing
 * @returns {Promise<{ compressedFile: File, originalSize: number, compressedSize: number, compressionRatio: number }>}
 */
export async function compressImage(file, options = {}) {
  if (!file) {
    throw new Error('No file provided for compression');
  }

  // Safely bypass or reject PDFs without attempting canvas manipulation
  if (isPdfFile(file)) {
    if (options.rejectPdf) {
      throw new Error('PDF files cannot be compressed via Canvas');
    }
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
    };
  }

  // Check if file is an image
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif)$/i.test(file.name);
  if (!isImage) {
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
    };
  }

  const maxDimension = options.maxDimension || MAX_IMAGE_DIMENSION;
  const maxSizeBytes = options.maxSizeBytes || MAX_FILE_SIZE_BYTES;
  const initialQuality = options.initialQuality !== undefined ? options.initialQuality : INITIAL_JPEG_QUALITY;
  const minQuality = options.minQuality !== undefined ? options.minQuality : MIN_JPEG_QUALITY;
  const qualityStep = options.qualityStep || QUALITY_STEP;

  const img = await loadImageFromFile(file);

  // Compute scaled dimensions maintaining aspect ratio
  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  // Create in-memory canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Fill white background for transparent PNG to JPEG conversion
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Iteratively compress starting at initial quality down to min quality
  let currentQuality = initialQuality;
  let blob = await canvasToBlob(canvas, 'image/jpeg', currentQuality);

  while (blob && blob.size > maxSizeBytes && currentQuality > minQuality + 0.05) {
    currentQuality = Number((currentQuality - qualityStep).toFixed(2));
    if (currentQuality < minQuality) {
      currentQuality = minQuality;
    }
    blob = await canvasToBlob(canvas, 'image/jpeg', currentQuality);
    if (currentQuality <= minQuality) {
      break;
    }
  }

  if (!blob) {
    throw new Error('Failed to compress image into blob');
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const newFileName = `${baseName}.jpg`;
  const compressedFile = new File([blob], newFileName, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });

  const originalSize = file.size;
  const compressedSize = compressedFile.size;
  const compressionRatio =
    originalSize > 0 ? Number((compressedSize / originalSize).toFixed(4)) : 1;

  return {
    compressedFile,
    originalSize,
    compressedSize,
    compressionRatio,
  };
}

export default compressImage;

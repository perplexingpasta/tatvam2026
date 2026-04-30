import { useState, useCallback, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

export type UploadStatus = 
  "idle" | "compressing" | "uploading" | "success" | "error";

export interface UploadState {
  status: UploadStatus;
  originalUrl: string | null;
  transformedUrl: string | null;
  previewUrl: string | null;
  errorMessage: string | null;
  fileName: string | null;
}

export interface UseImageUploadOptions {
  folder: "college-ids" | "payment-proofs" | "merch-payments";
  maxSizeMB?: number;
  compressionTargetMB?: number;
  maxWidthOrHeight?: number;
}

const initialState: UploadState = {
  status: "idle",
  originalUrl: null,
  transformedUrl: null,
  previewUrl: null,
  errorMessage: null,
  fileName: null,
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export function useImageUpload(options: UseImageUploadOptions) {
  const [uploadState, setUploadState] = useState<UploadState>(initialState);

  const reset = useCallback(() => {
    setUploadState((prev) => {
      if (prev.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return initialState;
    });
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadState({
        ...initialState,
        status: "error",
        errorMessage: "Invalid file type. Only JPEG, JPG, and PNG are allowed.",
        fileName: file.name
      });
      return;
    }

    const maxSizeMB = options.maxSizeMB ?? parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "20", 10);
    const maxFileSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxFileSizeBytes) {
      setUploadState({
        ...initialState,
        status: "error",
        errorMessage: `File size exceeds the limit of ${maxSizeMB}MB.`,
        fileName: file.name
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadState({
      ...initialState,
      status: "compressing",
      previewUrl,
      fileName: file.name
    });

    let compressed: File;
    try {
      compressed = await imageCompression(file, {
        maxSizeMB: options.compressionTargetMB ?? 0.5,
        maxWidthOrHeight: options.maxWidthOrHeight ?? 1200,
        useWebWorker: true,
        fileType: 'image/webp',
      });
    } catch (error) {
      console.error('Compression error:', error);
      setUploadState({
        ...initialState,
        status: "error",
        errorMessage: "Compression failed. Please try a different image.",
        previewUrl,
        fileName: file.name
      });
      return;
    }

    setUploadState(prev => ({
      ...prev,
      status: "uploading"
    }));

    const formData = new FormData();
    formData.append('file', compressed, file.name);
    formData.append('folder', options.folder);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setUploadState(prev => ({
          ...prev,
          status: "error",
          errorMessage: data.message || "Upload failed."
        }));
        return;
      }

      setUploadState(prev => ({
        ...prev,
        status: "success",
        originalUrl: data.originalUrl,
        transformedUrl: data.transformedUrl,
      }));

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        status: "error",
        errorMessage: "Upload request failed. Please check your connection."
      }));
    }
  }, [options.compressionTargetMB, options.folder, options.maxSizeMB, options.maxWidthOrHeight]);

  // Clean up object URLs when the hook is unmounted or previewUrl changes
  useEffect(() => {
    const url = uploadState.previewUrl;
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [uploadState.previewUrl]);

  return { uploadState, handleFileSelect, reset };
}

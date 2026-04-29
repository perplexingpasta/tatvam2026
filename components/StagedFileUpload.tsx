// 'use client';

// import React, { useEffect, useRef, ChangeEvent } from 'react';
// import { useImageUpload } from '@/hooks/useImageUpload';

// interface StagedFileUploadProps {
//   folder: "college-ids" | "payment-proofs" | "merch-payments";
//   label: string;
//   onUploadComplete: (urls: { originalUrl: string; transformedUrl: string }) => void;
//   onUploadReset: () => void;
//   disabled?: boolean;
//   compressionTargetMB?: number;
//   maxWidthOrHeight?: number;
// }

// export function StagedFileUpload({
//   folder,
//   label,
//   onUploadComplete,
//   onUploadReset,
//   disabled = false,
//   compressionTargetMB = 0.5,
//   maxWidthOrHeight = 1200
// }: StagedFileUploadProps) {
//   const { uploadState, handleFileSelect, reset } = useImageUpload({
//     folder,
//     compressionTargetMB,
//     maxWidthOrHeight,
//   });

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const hasCalledComplete = useRef(false);

//   useEffect(() => {
//     if (uploadState.status === 'success' && uploadState.originalUrl && uploadState.transformedUrl && !hasCalledComplete.current) {
//       hasCalledComplete.current = true;
//       onUploadComplete({
//         originalUrl: uploadState.originalUrl,
//         transformedUrl: uploadState.transformedUrl,
//       });
//     } else if (uploadState.status === 'error') {
//       hasCalledComplete.current = false;
//       onUploadReset();
//     } else if (uploadState.status === 'idle') {
//       hasCalledComplete.current = false;
//     }
//   }, [uploadState.status, uploadState.originalUrl, uploadState.transformedUrl, onUploadComplete, onUploadReset]);

//   const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files && files.length > 0) {
//       await handleFileSelect(files[0]);
//     }
//     // Reset the input value so selecting the same file again triggers the event
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleContainerClick = () => {
//     if (!disabled && (uploadState.status === 'idle' || uploadState.status === 'error')) {
//       fileInputRef.current?.click();
//     }
//   };

//   const handleResetClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (!disabled) {
//       reset();
//       onUploadReset();
//       // Re-open the file picker
//       setTimeout(() => {
//         fileInputRef.current?.click();
//       }, 0);
//     }
//   };

//   const isBusy = uploadState.status === 'compressing' || uploadState.status === 'uploading';
//   const maxSizeMB = process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10';

//   return (
//     <div className="flex flex-col gap-2">
//       <label className="text-sm font-medium text-gray-700">{label}</label>

//       <input
//         type="file"
//         ref={fileInputRef}
//         className="hidden"
//         accept="image/jpeg,image/jpg,image/png"
//         onChange={handleChange}
//         disabled={disabled || isBusy}
//       />

//       <div
//         onClick={handleContainerClick}
//         className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors
//           ${(disabled || isBusy || uploadState.status === 'success') ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-gray-50'}
//           ${uploadState.status === 'error' ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
//           ${uploadState.status === 'success' ? 'border-green-300 bg-green-50' : ''}
//         `}
//       >
//         {uploadState.status === 'idle' && (
//           <div className="flex flex-col items-center text-center">
//             <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//             </svg>
//             <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
//             <p className="text-xs text-gray-500 mt-1">JPG, PNG up to {maxSizeMB}MB</p>
//           </div>
//         )}

//         {(isBusy || uploadState.status === 'success') && uploadState.previewUrl && (
//           <div className="flex w-full items-center gap-4">
//             <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200">
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img src={uploadState.previewUrl} alt="Preview" className="h-full w-full object-cover" />
//             </div>

//             <div className="flex flex-1 flex-col justify-center">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-gray-900 truncate pr-4 max-w-[200px]">
//                   {uploadState.fileName || "Selected Image"}
//                 </span>

//                 {uploadState.status === 'success' && (
//                   <button
//                     type="button"
//                     onClick={handleResetClick}
//                     disabled={disabled}
//                     className="text-xs font-medium text-blue-600 hover:text-blue-500 underline"
//                   >
//                     Change
//                   </button>
//                 )}
//               </div>

//               <div className="mt-1 flex items-center text-sm">
//                 {isBusy && (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     <span className="text-gray-600">
//                       {uploadState.status === 'compressing' ? 'Compressing...' : 'Uploading...'}
//                     </span>
//                   </>
//                 )}

//                 {uploadState.status === 'success' && (
//                   <span className="flex items-center text-green-600 font-medium">
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                     </svg>
//                     Uploaded ✅
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {uploadState.status === 'error' && (
//            <div className="flex flex-col items-center text-center">
//              <svg className="w-8 h-8 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//              </svg>
//              <p className="text-sm text-red-600 font-medium">{uploadState.errorMessage}</p>
//              <p className="text-xs text-gray-500 mt-2">Click to try again</p>
//            </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useRef, ChangeEvent } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface StagedFileUploadProps {
  folder: "college-ids" | "payment-proofs" | "merch-payments";
  label: string;
  onUploadComplete: (urls: {
    originalUrl: string;
    transformedUrl: string;
  }) => void;
  onUploadReset: () => void;
  disabled?: boolean;
  compressionTargetMB?: number;
  maxWidthOrHeight?: number;
}

export function StagedFileUpload({
  folder,
  label,
  onUploadComplete,
  onUploadReset,
  disabled = false,
  compressionTargetMB = 0.5,
  maxWidthOrHeight = 1200,
}: StagedFileUploadProps) {
  const { uploadState, handleFileSelect, reset } = useImageUpload({
    folder,
    compressionTargetMB,
    maxWidthOrHeight,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCalledComplete = useRef(false);

  // Store callbacks in refs so they never appear in useEffect
  // dependency arrays. This prevents infinite re-render loops
  // caused by parent components passing inline arrow functions
  // as props (which create new references on every render).
  const onUploadCompleteRef = useRef(onUploadComplete);
  const onUploadResetRef = useRef(onUploadReset);

  // Keep refs up to date with latest prop values
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
  }, [onUploadComplete]);

  useEffect(() => {
    onUploadResetRef.current = onUploadReset;
  }, [onUploadReset]);

  // React to upload status changes using stable refs
  // instead of the callback props directly
  useEffect(() => {
    if (
      uploadState.status === "success" &&
      uploadState.originalUrl &&
      uploadState.transformedUrl &&
      !hasCalledComplete.current
    ) {
      hasCalledComplete.current = true;
      onUploadCompleteRef.current({
        originalUrl: uploadState.originalUrl,
        transformedUrl: uploadState.transformedUrl,
      });
    } else if (uploadState.status === "error") {
      hasCalledComplete.current = false;
      onUploadResetRef.current();
    } else if (uploadState.status === "idle") {
      hasCalledComplete.current = false;
    }
    // Only depend on upload state values — NOT on the callbacks
     
  }, [uploadState.status, uploadState.originalUrl, uploadState.transformedUrl]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files[0]);
    }
    // Reset input value so selecting the same file again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContainerClick = () => {
    if (
      !disabled &&
      (uploadState.status === "idle" || uploadState.status === "error")
    ) {
      fileInputRef.current?.click();
    }
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      reset();
      onUploadResetRef.current();
      // Re-open the file picker after reset
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 0);
    }
  };

  const isBusy =
    uploadState.status === "compressing" || uploadState.status === "uploading";
  const maxSizeMB = process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "10";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleChange}
        disabled={disabled || isBusy}
      />

      <div
        onClick={handleContainerClick}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors
          ${disabled || isBusy || uploadState.status === "success" ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:bg-gray-50"}
          ${uploadState.status === "error" ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"}
          ${uploadState.status === "success" ? "border-green-300 bg-green-50" : ""}
        `}
      >
        {uploadState.status === "idle" && (
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-8 h-8 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG up to {maxSizeMB}MB
            </p>
          </div>
        )}

        {(isBusy || uploadState.status === "success") &&
          uploadState.previewUrl && (
            <div className="flex w-full items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadState.previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 truncate pr-4 max-w-50">
                    {uploadState.fileName || "Selected Image"}
                  </span>

                  {uploadState.status === "success" && (
                    <button
                      type="button"
                      onClick={handleResetClick}
                      disabled={disabled}
                      className="text-xs font-medium text-blue-600 hover:text-blue-500 underline"
                    >
                      Change
                    </button>
                  )}
                </div>

                <div className="mt-1 flex items-center text-sm">
                  {isBusy && (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-gray-600">
                        {uploadState.status === "compressing"
                          ? "Compressing..."
                          : "Uploading..."}
                      </span>
                    </>
                  )}

                  {uploadState.status === "success" && (
                    <span className="flex items-center text-green-600 font-medium">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Uploaded ✅
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        {uploadState.status === "error" && (
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-8 h-8 text-red-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="text-sm text-red-600 font-medium">
              {uploadState.errorMessage}
            </p>
            <p className="text-xs text-gray-500 mt-2">Click to try again</p>
          </div>
        )}
      </div>
    </div>
  );
}

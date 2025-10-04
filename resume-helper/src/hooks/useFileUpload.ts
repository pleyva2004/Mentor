/**
 * Custom hook for file upload functionality
 */

import { useCallback } from 'react';
import { useUploadStore } from '../stores/uploadStore';
import type { FileType } from '../types';

export function useFileUpload() {
  const { uploadFile, removeFile, validateFile, files, isUploading, isAnalyzing, error } = useUploadStore();

  const handleFileSelect = useCallback(
    async (file: File, type: FileType) => {
      try {
        await uploadFile(file, type);
      } catch (err) {
        console.error('File upload failed:', err);
      }
    },
    [uploadFile]
  );

  const handleFileRemove = useCallback(
    (type: FileType) => {
      removeFile(type);
    },
    [removeFile]
  );

  const isFileUploaded = useCallback(
    (type: FileType) => {
      return files[type] !== null;
    },
    [files]
  );

  const getUploadedFileName = useCallback(
    (type: FileType) => {
      return files[type]?.name || '';
    },
    [files]
  );

  return {
    handleFileSelect,
    handleFileRemove,
    isFileUploaded,
    getUploadedFileName,
    files,
    isUploading,
    isAnalyzing,
    error,
    validateFile,
  };
}

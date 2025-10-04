/**
 * Upload state management store
 */

import { create } from 'zustand';
import type { UploadState, UploadedFile, FileType, FileValidationResult } from '../types';

interface UploadStore extends UploadState {
  // Actions
  uploadFile: (file: File, type: FileType) => Promise<void>;
  removeFile: (type: FileType) => void;
  validateFile: (file: File, type: FileType) => FileValidationResult;
  setUploading: (isUploading: boolean) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const validateFile = (file: File): FileValidationResult => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: 'Only PDF files are allowed',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB',
    };
  }

  return { isValid: true };
};

export const useUploadStore = create<UploadStore>((set) => ({
  // Initial state
  files: {
    resume: null,
    transcript: null,
    projects: null,
  },
  isUploading: false,
  isAnalyzing: false,
  error: null,

  // Actions
  uploadFile: async (file: File, type: FileType) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      set({ error: validation.error || 'Invalid file' });
      return;
    }

    set({ isUploading: true, error: null });

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const uploadedFile: UploadedFile = {
      id: `${type}-${Date.now()}`,
      type,
      file,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    };

    set(state => ({
      files: {
        ...state.files,
        [type]: uploadedFile,
      },
      isUploading: false,
    }));
  },

  removeFile: (type: FileType) => {
    set(state => ({
      files: {
        ...state.files,
        [type]: null,
      },
    }));
  },

  validateFile: (file: File) => validateFile(file),

  setUploading: (isUploading: boolean) => {
    set({ isUploading });
  },

  setAnalyzing: (isAnalyzing: boolean) => {
    set({ isAnalyzing });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      files: {
        resume: null,
        transcript: null,
        projects: null,
      },
      isUploading: false,
      isAnalyzing: false,
      error: null,
    });
  },
}));

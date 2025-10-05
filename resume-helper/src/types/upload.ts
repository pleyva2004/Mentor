/**
 * File upload related types
 */

export type FileType = 'resume' | 'transcript' | 'projects';

export interface UploadedFile {
  id: string;
  type: FileType;
  file: File;
  name: string;
  size: number;
  uploadedAt: Date;
}

export interface UploadState {
  files: Record<FileType, UploadedFile | null>;
  isUploading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

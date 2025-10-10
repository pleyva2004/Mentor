'use client';

import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  selectedFile?: File | null;
  onClear?: () => void;
}

export function DropZone({
  onFileSelect,
  accept = '.pdf',
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  selectedFile,
  onClear,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    
    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileExtension = `.${file.name.split('.').pop()}`;
    if (!acceptedTypes.includes(fileExtension)) {
      return `Only ${acceptedTypes.join(', ')} files are allowed`;
    }
    
    return null;
  };
  
  const handleFile = (file: File) => {
    setError('');
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onFileSelect(file);
  };
  
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      
      if (disabled) return;
      
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled]
  );
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);
  
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };
  
  const handleClear = () => {
    setError('');
    onClear?.();
  };
  
  if (selectedFile) {
    return (
      <div className="border-2 border-border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {onClear && (
            <button
              onClick={handleClear}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
        disabled={disabled}
      />
      
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/5' 
            : error 
              ? 'border-error bg-error/5'
              : 'border-border bg-card hover:border-primary hover:bg-primary/5'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${error ? 'bg-error/10' : 'bg-primary/10'}`}>
            <Upload className={`w-8 h-8 ${error ? 'text-error' : 'text-primary'}`} />
          </div>
          
          <div>
            <p className="text-foreground font-medium">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {accept.replace(/\./g, '').toUpperCase()} files only, max {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </label>
      
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}


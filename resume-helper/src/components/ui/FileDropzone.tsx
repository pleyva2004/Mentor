/**
 * File dropzone component with drag and drop functionality
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileDropzoneProps } from '@/types';
import { cn } from '@/lib/utils';

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  maxSize = 10 * 1024 * 1024, // 10MB default
  isUploaded = false,
  children,
  className,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'file-drop-zone',
        {
          'uploaded': isUploaded,
          'border-red-300 bg-red-50': isDragReject,
          'border-primary bg-indigo-50': isDragActive && !isDragReject,
        },
        className
      )}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

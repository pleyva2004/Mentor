/**
 * Upload screen component
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileDropzone } from '@/components/ui';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useResumeStore } from '@/stores/resumeStore';
import type { FileType } from '@/types';
import { areRequiredFilesUploaded } from '@/lib/utils';

export const UploadScreen: React.FC = () => {
  const router = useRouter();
  const { files, isUploading, isAnalyzing, handleFileSelect, isFileUploaded, getUploadedFileName } = useFileUpload();
  const { setAnalyzing, setProcessedResumeData } = useResumeStore(); // Add setProcessedResumeData

  const handleAnalyze = async () => {
    setAnalyzing(true);

    // Get just the resume file that was uploaded
    const resumeFile = files.resume?.file;
    
    if (!resumeFile) {
      console.error('No resume file found');
      setAnalyzing(false);
      return;
    }

    try {
      // Create FormData with just the resume file
      const formData = new FormData();
      formData.append('file', resumeFile);
      
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      
      // Process the backend response and update the resume store
      setProcessedResumeData(data);
      
      setAnalyzing(false);
      router.push('/edit');
    } catch (error) {
      console.error('Error processing resume:', error);
      setAnalyzing(false);
      // You might want to show an error message to the user
    }
  };

  const canAnalyze = areRequiredFilesUploaded(files) && !isUploading && !isAnalyzing;

  const fileTypes: { type: FileType; icon: string; title: string; description: string; required: boolean }[] = [
    {
      type: 'resume',
      icon: '📄',
      title: 'Upload Your Resume',
      description: 'PDF format only',
      required: true,
    },
    {
      type: 'transcript',
      icon: '🎓',
      title: 'Upload Your Transcript',
      description: 'PDF format only',
      required: true,
    },
    {
      type: 'projects',
      icon: '📂',
      title: 'Upload Project Files (Optional)',
      description: 'PDF format only',
      required: false,
    },
  ];

  return (
    <div className="upload-card">
      <h1>Build Your AI-Powered Resume</h1>
      <p>Upload your documents, and we'll automatically create a professional, polished resume for you.</p>

      <div className="upload-grid">
        {fileTypes.map(({ type, icon, title, description, required }) => (
          <FileDropzone
            key={type}
            onFileSelect={(file) => handleFileSelect(file, type)}
            acceptedTypes={['.pdf']}
            isUploaded={isFileUploaded(type)}
            fileName={getUploadedFileName(type)}
          >
            <div className="icon">
              {isFileUploaded(type) ? '✅' : icon}
            </div>
            <h3>
              {isFileUploaded(type) ? getUploadedFileName(type) : title}
            </h3>
            <span>
              {description}
              {required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
            </span>
          </FileDropzone>
        ))}
      </div>

      {isAnalyzing && (
        <div id="loader-container">
          <p>Analyzing documents and building your resume...</p>
          <div className="loader"></div>
        </div>
      )}

      <button
        id="analyze-btn"
        className="btn"
        onClick={handleAnalyze}
        disabled={!canAnalyze}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze & Build My Resume'}
      </button>

      <div className="privacy-notice">
        <span className="icon">🔒</span>
        <span>Your data is private and secure. Files are deleted after processing.</span>
      </div>
    </div>
  );
};

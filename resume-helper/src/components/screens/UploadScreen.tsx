/**
 * Upload screen component
 */

import React from 'react';
import { FileDropzone } from '../ui';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useResumeStore } from '../../stores/resumeStore';
import type { FileType } from '../../types';
import { areRequiredFilesUploaded } from '../../lib/utils';

export const UploadScreen: React.FC = () => {
  const { files, isUploading, isAnalyzing, handleFileSelect, isFileUploaded, getUploadedFileName } = useFileUpload();
  const { setCurrentScreen, setAnalyzing } = useResumeStore();

  const handleAnalyze = async () => {
    setAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setAnalyzing(false);
    setCurrentScreen('edit');
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

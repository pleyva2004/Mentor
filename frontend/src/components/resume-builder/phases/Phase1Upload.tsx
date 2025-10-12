'use client';

import React, { useState } from 'react';
import { useResumeBuilderStore } from '@/stores/resumeBuilderStore';
import { DropZone } from '../shared/DropZone';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface Phase1UploadProps {
  onComplete: () => void;
}

export function Phase1Upload({ onComplete }: Phase1UploadProps) {
  const {
    uploadedFile,
    setUploadedFile,
    setResumeId,
    updateEducation,
    setSelectedCourses,
    setSections,
    updateSkills,
  } = useResumeBuilderStore();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  
  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setError('');
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 90));
      }, 300);
      
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      // Populate store with extracted data
      setResumeId(data.resume_id);
      
      if (data.college_name) {
        updateEducation({
          school: data.college_name || '',
          major: data.major || '',
          gradYear: data.education.grad_year?.toString() || '',
        });
      }
      
      if (data.course_work && Array.isArray(data.course_work)) {
        const courses = data.course_work.map((course: any) => ({
          id: course.course_number,
          code: course.course_number,
          name: course.course_title,
        }));
        setSelectedCourses(courses);
      }
      
      if (data.sections) {
        const sections = [];
        if (data.sections.header) {
          sections.push({
            id: 'header',
            type: 'header' as const,
            title: 'Header',
            content: { html: data.sections.header },
          });
        }
        if (data.sections.experience) {
          sections.push({
            id: 'experience',
            type: 'experience' as const,
            title: 'Work Experience',
            content: { html: data.sections.experience },
          });
        }
        if (data.sections.education) {
          sections.push({
            id: 'education',
            type: 'education' as const,
            title: 'Education',
            content: { html: data.sections.education },
          });
        }
        if (data.sections.skills) {
          sections.push({
            id: 'skills',
            type: 'skills' as const,
            title: 'Skills',
            content: { html: data.sections.skills },
          });
        }
        if (data.sections.projects) {
          sections.push({
            id: 'projects',
            type: 'summary' as const,
            title: 'Projects',
            content: { html: data.sections.projects },
          });
        }
        setSections(sections);
      }
      
      if (data.extracted_skills) {
        updateSkills(data.extracted_skills);
      }
      
      setUploadSuccess(true);
      
      // Auto-advance after a brief delay
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleClear = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setError('');
  };
  
  const handleSkip = () => {
    // User wants to start from scratch
    setResumeId(`manual-${Date.now()}`);
    onComplete();
  };
  
  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <DropZone
        onFileSelect={handleFileSelect}
        accept=".pdf"
        maxSize={10 * 1024 * 1024}
        disabled={isUploading}
        selectedFile={uploadedFile}
        onClear={handleClear}
      />
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing resume...</span>
            <span className="text-foreground font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div>
            <p className="font-medium text-success">Resume processed successfully!</p>
            <p className="text-sm text-success/80">Moving to next step...</p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
      
      {/* Skip Option */}
      {!uploadedFile && !isUploading && (
        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Don't have a resume yet?
          </p>
          <button
            onClick={handleSkip}
            className="px-6 py-2 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Start from scratch →
          </button>
        </div>
      )}
    </div>
  );
}


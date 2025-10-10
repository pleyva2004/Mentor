'use client';

import React, { useState } from 'react';
import { useResumeBuilderStore } from '@/stores/resumeBuilderStore';
import { Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'modern' as const,
    name: 'Modern',
    description: 'Clean and colorful design',
    preview: '/templates/modern-preview.png',
  },
  {
    id: 'classic' as const,
    name: 'Classic',
    description: 'Traditional serif layout',
    preview: '/templates/classic-preview.png',
  },
  {
    id: 'ats' as const,
    name: 'ATS-Friendly',
    description: 'Optimized for applicant tracking systems',
    preview: '/templates/ats-preview.png',
  },
];

type ExportFormat = 'pdf' | 'latex' | 'docx';

export function Phase8Export() {
  const { exportConfig, setExportTemplate, resumeId, sections } = useResumeBuilderStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string>('');
  
  const handleExport = async (format: ExportFormat) => {
    if (!resumeId) {
      setExportError('No resume ID found. Please complete the upload step first.');
      return;
    }
    
    setIsExporting(true);
    setExportError('');
    setExportSuccess(false);
    
    try {
      const response = await fetch('http://localhost:8000/export-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: resumeId,
          template: exportConfig.template,
          format: format,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Export failed. Please try again.');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Choose a Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setExportTemplate(template.id)}
              className={`
                p-4 border-2 rounded-lg transition-all
                ${exportConfig.template === template.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              <div className="aspect-[8.5/11] bg-muted rounded mb-3 flex items-center justify-center">
                <FileText className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{template.name}</p>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Preview */}
      <div className="border border-border rounded-lg p-6 bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>
        <div className="aspect-[8.5/11] bg-muted rounded flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-2" />
            <p>Resume preview will appear here</p>
            <p className="text-sm mt-1">Template: {exportConfig.template}</p>
          </div>
        </div>
      </div>
      
      {/* Export Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Export Your Resume
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground">Export as PDF</p>
            <p className="text-sm text-muted-foreground">Best for sharing</p>
          </button>
          
          <button
            onClick={() => handleExport('latex')}
            disabled={isExporting}
            className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground">Download LaTeX</p>
            <p className="text-sm text-muted-foreground">For advanced editing</p>
          </button>
          
          <button
            onClick={() => handleExport('docx')}
            disabled={isExporting}
            className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground">Export as DOCX</p>
            <p className="text-sm text-muted-foreground">For Word editing</p>
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {isExporting && (
        <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <p className="text-foreground">Generating your resume...</p>
        </div>
      )}
      
      {/* Success Message */}
      {exportSuccess && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <p className="text-success font-medium">Resume exported successfully!</p>
        </div>
      )}
      
      {/* Error Message */}
      {exportError && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{exportError}</p>
        </div>
      )}
      
      {/* Congratulations Message */}
      <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">
          🎉 Congratulations!
        </h3>
        <p className="text-muted-foreground">
          You've completed the Mentor Resume Builder. Your professional resume is ready to help you land your dream job!
        </p>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useSectionUpdate } from '@/hooks/useSectionUpdate';
import MissingInfoForm from './MissingInfoForm';

interface ResumeSection {
  id: string;
  title: string;
  content: string;
  isEditing?: boolean;
}

interface ResumePreviewProps {
  data: {
    header: string;
    projects: string;
    skills: string;
    experience: string;
    education: string;
  };
  rawText?: string;
  resumeId?: string;
  onSectionUpdate?: (sectionId: string, content: string) => void;
  onExportPDF?: () => void;
}

export default function ResumePreview({ data, rawText, resumeId, onSectionUpdate, onExportPDF }: ResumePreviewProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [showMissingInfoForm, setShowMissingInfoForm] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, any>>({});
  
  const { updateSection, parseSection, isUpdating, error } = useSectionUpdate();

  // Check if content is placeholder text
  const isPlaceholder = (content: string) => {
    const placeholders = [
      'not available',
      'No information available',
      'Contact information not available',
      'No projects information available',
      'No skills information available',
      'No experience information available',
      'No education information available'
    ];
    return placeholders.some(placeholder => 
      content.toLowerCase().includes(placeholder.toLowerCase())
    );
  };

  // Parse raw text for specific sections when AI parsing fails
  const parseRawTextForSection = (sectionId: string, rawText: string) => {
    const lines = rawText.split('\n').filter(line => line.trim());
    
    switch (sectionId) {
      case 'header':
        // Look for contact info patterns
        const contactInfo = lines.filter(line => 
          line.includes('@') || // email
          line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/) || // phone
          line.includes('linkedin.com') || // linkedin
          line.includes('github.com') || // github
          line.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) // name pattern
        ).join(' | ');
        return contactInfo ? `<p>${contactInfo}</p>` : `<p>No contact information found in resume</p>`;
        
      case 'projects':
        // Look for project-related content
        const projectLines = lines.filter(line => 
          line.toLowerCase().includes('project') ||
          line.toLowerCase().includes('built') ||
          line.toLowerCase().includes('developed') ||
          line.toLowerCase().includes('created')
        );
        if (projectLines.length > 0) {
          return `<ul>${projectLines.map(line => `<li>${line}</li>`).join('')}</ul>`;
        }
        return `<p>No project information found in resume</p>`;
        
      case 'skills':
        // Look for skills/technologies
        const skillLines = lines.filter(line => 
          line.toLowerCase().includes('skill') ||
          line.toLowerCase().includes('language') ||
          line.toLowerCase().includes('technology') ||
          line.match(/\b(JavaScript|Python|Java|C\+\+|React|Node|SQL|AWS|Docker|Git)\b/i)
        );
        if (skillLines.length > 0) {
          return `<p><strong>Skills:</strong> ${skillLines.join(', ')}</p>`;
        }
        return `<p>No skills information found in resume</p>`;
        
      case 'experience':
        // Look for work experience
        const expLines = lines.filter(line => 
          line.toLowerCase().includes('experience') ||
          line.toLowerCase().includes('work') ||
          line.toLowerCase().includes('intern') ||
          line.toLowerCase().includes('job') ||
          line.match(/\d{4}.*\d{4}/) // date ranges
        );
        if (expLines.length > 0) {
          return `<ul>${expLines.map(line => `<li>${line}</li>`).join('')}</ul>`;
        }
        return `<p>No experience information found in resume</p>`;
        
      case 'education':
        // Look for education info
        const eduLines = lines.filter(line => 
          line.toLowerCase().includes('education') ||
          line.toLowerCase().includes('degree') ||
          line.toLowerCase().includes('university') ||
          line.toLowerCase().includes('college') ||
          line.toLowerCase().includes('bachelor') ||
          line.toLowerCase().includes('master') ||
          line.match(/\b(BS|BA|MS|MA|PhD|Bachelor|Master|Doctorate)\b/i)
        );
        if (eduLines.length > 0) {
          return `<ul>${eduLines.map(line => `<li>${line}</li>`).join('')}</ul>`;
        }
        return `<p>No education information found in resume</p>`;
        
      default:
        return `<p>No information found for this section</p>`;
    }
  };

  const sections: ResumeSection[] = [
    { 
      id: 'header', 
      title: 'Contact Information', 
      content: isPlaceholder(data.header) && rawText ? 
        parseRawTextForSection('header', rawText) : 
        data.header 
    },
    { 
      id: 'projects', 
      title: 'Projects', 
      content: isPlaceholder(data.projects) && rawText ? 
        parseRawTextForSection('projects', rawText) : 
        data.projects 
    },
    { 
      id: 'skills', 
      title: 'Technical Skills', 
      content: isPlaceholder(data.skills) && rawText ? 
        parseRawTextForSection('skills', rawText) : 
        data.skills 
    },
    { 
      id: 'experience', 
      title: 'Experience', 
      content: isPlaceholder(data.experience) && rawText ? 
        parseRawTextForSection('experience', rawText) : 
        data.experience 
    },
    { 
      id: 'education', 
      title: 'Education', 
      content: isPlaceholder(data.education) && rawText ? 
        parseRawTextForSection('education', rawText) : 
        data.education 
    },
  ];

  const handleEdit = (section: ResumeSection) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  };

  const handleSave = async () => {
    if (editingSection && resumeId) {
      const result = await updateSection(resumeId, editingSection, editContent);
      if (result.success) {
        if (onSectionUpdate) {
          onSectionUpdate(editingSection, editContent);
        }
        setValidationResults(prev => ({
          ...prev,
          [editingSection]: result.validation
        }));
        setEditingSection(null);
        setEditContent('');
      } else {
        console.error('Failed to save section:', result.error);
      }
    } else if (editingSection && onSectionUpdate) {
      // Fallback to local update if no resumeId
      onSectionUpdate(editingSection, editContent);
      setEditingSection(null);
      setEditContent('');
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditContent('');
  };

  const handleAddMissingInfo = (sectionId: string) => {
    setShowMissingInfoForm(sectionId);
  };

  const handleMissingInfoComplete = async (content: string) => {
    if (editingSection && resumeId) {
      const result = await updateSection(resumeId, editingSection, content);
      if (result.success) {
        if (onSectionUpdate) {
          onSectionUpdate(editingSection, content);
        }
        setShowMissingInfoForm(null);
        setEditingSection(null);
      }
    } else if (editingSection && onSectionUpdate) {
      onSectionUpdate(editingSection, content);
      setShowMissingInfoForm(null);
      setEditingSection(null);
    }
  };

  const handleImproveParsing = async (sectionId: string) => {
    if (rawText && resumeId) {
      const result = await parseSection(sectionId, rawText);
      if (result.success && result.content) {
        if (onSectionUpdate) {
          onSectionUpdate(sectionId, result.content);
        }
      }
    }
  };

  const renderSectionContent = (section: ResumeSection) => {
    if (editingSection === section.id) {
      return (
        <div className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg resize-none text-gray-800 text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={8}
            placeholder={`Edit ${section.title.toLowerCase()}...`}
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    const validation = validationResults[section.id];
    const isPlaceholderContent = isPlaceholder(section.content);

    return (
      <div className="space-y-4">
        {/* Validation warnings */}
        {validation && validation.warnings && validation.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warnings:</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {validation.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {validation && validation.suggestions && validation.suggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Suggestions:</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    {validation.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons for placeholder content */}
        {isPlaceholderContent && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleImproveParsing(section.id)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Try Better Parsing
            </button>
            <button
              onClick={() => handleAddMissingInfo(section.id)}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
            >
              Add Information Manually
            </button>
          </div>
        )}

        {/* Section content */}
        <div className="prose prose-base max-w-none text-gray-800 leading-relaxed">
          <div 
            className="text-gray-800 [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:text-gray-900 [&>h4]:mb-2 [&>p]:text-gray-800 [&>p]:mb-3 [&>ul]:text-gray-800 [&>li]:text-gray-800 [&>strong]:text-gray-900 [&>em]:text-gray-700 [&>pre]:text-gray-800 [&>pre]:bg-gray-50 [&>pre]:p-3 [&>pre]:rounded [&>pre]:border [&>pre]:border-gray-200"
            dangerouslySetInnerHTML={{ __html: section.content }} 
          />
        </div>
      </div>
    );
  };

  // Check if all sections are placeholders
  const allPlaceholders = sections.every(section => isPlaceholder(section.content));

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Resume Preview</h2>
          <p className="text-gray-600">Click on any section to edit</p>
          {allPlaceholders && rawText && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                ⚠️ AI processing failed. Showing raw extracted text below. You can edit each section manually.
              </p>
            </div>
          )}
        </div>
        {onExportPDF && (
          <button
            onClick={onExportPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        )}
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 pb-8 last:border-b-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
              <button
                onClick={() => handleEdit(section)}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
              >
                Edit
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              {renderSectionContent(section)}
            </div>
          </div>
        ))}
      </div>

      {/* Missing Info Form Modal */}
      {showMissingInfoForm && (
        <MissingInfoForm
          sectionId={showMissingInfoForm}
          onComplete={handleMissingInfoComplete}
          onCancel={() => setShowMissingInfoForm(null)}
          rawText={rawText}
        />
      )}
    </div>
  );
}

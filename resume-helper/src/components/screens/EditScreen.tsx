/**
 * Edit screen component with resume preview and AI helper
 */

'use client';

import React from 'react';
import { ResumePreview, VerificationHeader, CursorPromptingPanel } from '@/components/resume';
import { useEditMode } from '@/hooks/useEditMode';
import { useResumeStore } from '@/stores/resumeStore';

export const EditScreen: React.FC = () => {
  const {
    isEditing,
    activeSection,
    aiPanelVisible,
    cursorPosition,
    currentContent,
    handleExitEditMode,
    setCurrentContent
  } = useEditMode();
  const { resumeData } = useResumeStore();

  // Get resume context for all sections
  const resumeContext = Object.keys(resumeData).reduce((acc, section) => {
    acc[section] = resumeData[section as keyof typeof resumeData]?.content || '';
    return acc;
  }, {} as Record<string, string>);

  const handleApplySuggestion = (suggestion: string) => {
    // Apply the suggestion to the current content
    const newContent = currentContent + suggestion;
    setCurrentContent(newContent);
  };

  return (
    <div id="edit-container" className={`edit-container ${isEditing ? 'is-editing' : ''}`}>
      <div className="resume-panel">
        <VerificationHeader />
        <ResumePreview />
      </div>

      <CursorPromptingPanel
        isVisible={aiPanelVisible}
        activeSection={activeSection}
        currentContent={currentContent}
        cursorPosition={cursorPosition}
        resumeContext={resumeContext}
        onClose={handleExitEditMode}
        onApplySuggestion={handleApplySuggestion}
      />
    </div>
  );
};

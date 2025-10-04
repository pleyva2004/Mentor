/**
 * Edit screen component with resume preview and AI helper
 */

import React from 'react';
import { ResumePreview, VerificationHeader, AIHelperPanel } from '../resume';
import { useEditMode } from '../../hooks/useEditMode';

export const EditScreen: React.FC = () => {
  const { isEditing, activeSection, aiPanelVisible, handleExitEditMode } = useEditMode();

  return (
    <div id="edit-container" className={`edit-container ${isEditing ? 'is-editing' : ''}`}>
      <div className="resume-panel">
        <VerificationHeader />
        <ResumePreview />
      </div>
      
      <AIHelperPanel
        isVisible={aiPanelVisible}
        activeSection={activeSection as any}
        onClose={handleExitEditMode}
      />
    </div>
  );
};

/**
 * Custom hook for edit mode functionality
 */

import { useCallback } from 'react';
import { useEditModeStore } from '../stores/editModeStore';
import type { ResumeSection } from '../types';

export function useEditMode() {
  const {
    isEditing,
    activeSection,
    resumePanelWidth,
    aiPanelVisible,
    enterEditMode,
    exitEditMode,
    setActiveSection,
  } = useEditModeStore();

  const handleEnterEditMode = useCallback(
    (section: ResumeSection) => {
      enterEditMode(section);
    },
    [enterEditMode]
  );

  const handleExitEditMode = useCallback(() => {
    exitEditMode();
  }, [exitEditMode]);

  const handleSectionClick = useCallback(
    (section: ResumeSection) => {
      if (isEditing && activeSection === section) {
        handleExitEditMode();
      } else {
        handleEnterEditMode(section);
      }
    },
    [isEditing, activeSection, handleEnterEditMode, handleExitEditMode]
  );

  return {
    isEditing,
    activeSection,
    resumePanelWidth,
    aiPanelVisible,
    handleEnterEditMode,
    handleExitEditMode,
    handleSectionClick,
    setActiveSection,
  };
}

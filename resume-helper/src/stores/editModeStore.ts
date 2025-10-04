/**
 * Edit mode state management store
 */

import { create } from 'zustand';
import type { EditModeState, ResumeSection } from '../types';

interface EditModeStore extends EditModeState {
  // Actions
  enterEditMode: (section: ResumeSection) => void;
  exitEditMode: () => void;
  setActiveSection: (section: ResumeSection | null) => void;
}

export const useEditModeStore = create<EditModeStore>((set) => ({
  // Initial state
  isEditing: false,
  activeSection: null,
  resumePanelWidth: 'full',
  aiPanelVisible: false,

  // Actions
  enterEditMode: (section: ResumeSection) => {
    set({
      isEditing: true,
      activeSection: section,
      resumePanelWidth: 'reduced',
      aiPanelVisible: true,
    });
  },

  exitEditMode: () => {
    set({
      isEditing: false,
      activeSection: null,
      resumePanelWidth: 'full',
      aiPanelVisible: false,
    });
  },

  setActiveSection: (section: ResumeSection | null) => {
    set({ activeSection: section });
  },
}));

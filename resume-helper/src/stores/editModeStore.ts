/**
 * Edit mode state management store
 */

import { create } from 'zustand';
import type { EditModeState, ResumeSection } from '@/types';

interface EditModeStore extends EditModeState {
  // Actions
  enterEditMode: (section: ResumeSection) => void;
  exitEditMode: () => void;
  setActiveSection: (section: ResumeSection | null) => void;
  setCursorPosition: (position: number) => void;
  setCurrentContent: (content: string) => void;
  updateCursorContent: (position: number, content: string) => void;
}

export const useEditModeStore = create<EditModeStore>((set, get) => ({
  // Initial state
  isEditing: false,
  activeSection: null,
  resumePanelWidth: 'full',
  aiPanelVisible: false,
  cursorPosition: 0,
  currentContent: '',

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

  setCursorPosition: (position: number) => {
    set({ cursorPosition: position });
  },

  setCurrentContent: (content: string) => {
    set({ currentContent: content });
  },

  updateCursorContent: (position: number, content: string) => {
    set({
      cursorPosition: position,
      currentContent: content,
    });
  },
}));

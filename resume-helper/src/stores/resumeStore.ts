/**
 * Resume data state management store
 */

import { create } from 'zustand';
import type { ResumeData, ResumeBlock, ResumeSection } from '@/types';
import { sampleResumeData } from '@/constants/resumeData';

interface ResumeStore {
  // State
  resumeData: ResumeData;
  currentScreen: 'upload' | 'edit';
  processingError: string | null; // Add error state
  
  // Actions
  updateResumeBlock: (section: ResumeSection, updates: Partial<ResumeBlock>) => void;
  confirmSection: (section: ResumeSection) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  setCurrentScreen: (screen: 'upload' | 'edit') => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  resetResumeData: () => void;
  setProcessedResumeData: (backendData: any) => void; // Add this new action
  setProcessingError: (error: string | null) => void; // Add error action
}

export const useResumeStore = create<ResumeStore>((set) => ({
  // Initial state
  resumeData: sampleResumeData,
  currentScreen: 'upload',
  processingError: null, // Initialize error state

  // Actions
  updateResumeBlock: (section: ResumeSection, updates: Partial<ResumeBlock>) => {
    set(state => ({
      resumeData: {
        ...state.resumeData,
        [section]: {
          ...state.resumeData[section],
          ...updates,
        },
      },
    }));
  },

  confirmSection: (section: ResumeSection) => {
    set(state => ({
      resumeData: {
        ...state.resumeData,
        [section]: {
          ...state.resumeData[section],
          isConfirmed: true,
        },
      },
    }));
  },

  reorderSections: (fromIndex: number, toIndex: number) => {
    set(state => {
      const sections = Object.values(state.resumeData).sort((a, b) => a.order - b.order);
      const [movedSection] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, movedSection);

      // Update order values
      const updatedSections = sections.map((section, index) => ({
        ...section,
        order: index,
      }));

      // Reconstruct resumeData with new order
      const newResumeData: ResumeData = {
        header: updatedSections.find(s => s.section === 'header')!,
        projects: updatedSections.find(s => s.section === 'projects')!,
        skills: updatedSections.find(s => s.section === 'skills')!,
        experience: updatedSections.find(s => s.section === 'experience')!,
        education: updatedSections.find(s => s.section === 'education')!,
      };

      return { resumeData: newResumeData };
    });
  },

  setCurrentScreen: (screen: 'upload' | 'edit') => {
    set({ currentScreen: screen });
  },

  setAnalyzing: () => {
    // This is a placeholder - the actual analyzing state is managed by uploadStore
    // This method exists for compatibility with the UploadScreen component
  },

  // Add this new function to process backend data
  setProcessedResumeData: (backendData: any) => {
    try {
      const processedData: ResumeData = {
        header: {
          id: 'header-processed',
          section: 'header',
          title: 'Header',
          content: backendData.header || '',
          isConfirmed: false,
          order: 0,
        },
        projects: {
          id: 'projects-processed',
          section: 'projects',
          title: 'Projects',
          content: backendData.projects || '',
          isConfirmed: false,
          order: 1,
        },
        skills: {
          id: 'skills-processed',
          section: 'skills',
          title: 'Technical Skills',
          content: backendData.skills || '',
          isConfirmed: false,
          order: 2,
        },
        experience: {
          id: 'experience-processed',
          section: 'experience',
          title: 'Experience',
          content: backendData.experience || '',
          isConfirmed: false,
          order: 3,
        },
        education: {
          id: 'education-processed',
          section: 'education',
          title: 'Education',
          content: backendData.education || '',
          isConfirmed: false,
          order: 4,
        },
      };

      set({ 
        resumeData: processedData, 
        processingError: null // Clear any previous errors
      });
    } catch (error) {
      console.error('Error processing resume data:', error);
      set({ 
        processingError: 'Failed to process resume data. Please try again.' 
      });
    }
  },

  setProcessingError: (error: string | null) => {
    set({ processingError: error });
  },

  resetResumeData: () => {
    set({ resumeData: sampleResumeData });
  },
}));

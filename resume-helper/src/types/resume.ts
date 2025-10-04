/**
 * Resume data structure and related types
 */

export type ResumeSection = 'header' | 'summary' | 'skills' | 'experience' | 'education';

export interface ResumeBlock {
  id: string;
  section: ResumeSection;
  title: string;
  content: string;
  isConfirmed: boolean;
  order: number;
}

export interface ResumeData {
  header: ResumeBlock;
  summary: ResumeBlock;
  skills: ResumeBlock;
  experience: ResumeBlock;
  education: ResumeBlock;
}

export interface EditableField {
  id: string;
  type: 'title' | 'metadata' | 'bullet-point';
  content: string;
  isEditing: boolean;
}

export interface AISuggestion {
  id: string;
  type: 'improve-phrasing' | 'add-action-verb' | 'quantify-achievement' | 'grammar-check';
  title: string;
  description: string;
  action: () => void;
}

export interface AIContext {
  section: ResumeSection;
  suggestions: AISuggestion[];
  isVisible: boolean;
}

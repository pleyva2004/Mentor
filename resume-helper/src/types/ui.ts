/**
 * UI component related types
 */

export type ScreenType = 'upload' | 'edit';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSize?: number;
  isUploaded?: boolean;
  fileName?: string;
  children: React.ReactNode;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface DragDropProps {
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
}

export interface EditModeState {
  isEditing: boolean;
  activeSection: string | null;
  resumePanelWidth: 'full' | 'reduced';
  aiPanelVisible: boolean;
}

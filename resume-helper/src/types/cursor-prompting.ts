/**
 * TypeScript interfaces for cursor prompting feature
 */

export interface CursorPromptRequest {
  active_section: string;
  cursor_position: number;
  current_content: string;
  resume_context: Record<string, any>;
  user_intent?: string;
}

export interface PromptSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  suggested_text: string;
  confidence: number;
  reasoning: string;
}

export interface CursorPromptResponse {
  suggestions: PromptSuggestion[];
  completion_suggestion?: PromptSuggestion;
}

export interface CursorPromptingContext {
  activeSection: string;
  cursorPosition: number;
  currentContent: string;
  resumeContext: Record<string, any>;
}
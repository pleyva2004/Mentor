/**
 * Custom hook for cursor prompting functionality
 */

import { useState, useCallback, useEffect } from 'react';
import {
  CursorPromptRequest,
  CursorPromptResponse,
  PromptSuggestion,
  CursorPromptingContext
} from '@/types/cursor-prompting';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UseCursorPromptingOptions {
  enabled?: boolean;
  debounceMs?: number;
}

interface UseCursorPromptingReturn {
  suggestions: PromptSuggestion[];
  completionSuggestion?: PromptSuggestion;
  isLoading: boolean;
  error: string | null;
  triggerPrompting: (context: CursorPromptingContext) => void;
  clearSuggestions: () => void;
}

export const useCursorPrompting = (options: UseCursorPromptingOptions = {}): UseCursorPromptingReturn => {
  const { enabled = true, debounceMs = 500 } = options;

  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [completionSuggestion, setCompletionSuggestion] = useState<PromptSuggestion | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (context: CursorPromptingContext) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: CursorPromptRequest = {
        active_section: context.activeSection,
        cursor_position: context.cursorPosition,
        current_content: context.currentContent,
        resume_context: context.resumeContext,
      };

      const response = await fetch(`${API_BASE_URL}/api/prompts/cursor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CursorPromptResponse = await response.json();

      setSuggestions(data.suggestions);
      setCompletionSuggestion(data.completion_suggestion);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setSuggestions([]);
      setCompletionSuggestion(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const triggerPrompting = useCallback((context: CursorPromptingContext) => {
    // Clear previous suggestions immediately
    setSuggestions([]);
    setCompletionSuggestion(undefined);
    setError(null);

    // Debounce the API call
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      // Only fetch if we have meaningful content
      if (context.currentContent.trim().length > 3) {
        fetchSuggestions(context);
      }
    }, debounceMs);

    setDebounceTimer(timer);
  }, [debounceTimer, debounceMs, fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setCompletionSuggestion(undefined);
    setError(null);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    suggestions,
    completionSuggestion,
    isLoading,
    error,
    triggerPrompting,
    clearSuggestions,
  };
};
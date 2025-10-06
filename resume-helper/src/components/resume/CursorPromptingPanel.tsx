/**
 * Cursor Prompting panel component with real-time context-aware suggestions
 */

'use client';

import React from 'react';
import type { ResumeSection } from '@/types';
import { useCursorPrompting } from '@/hooks/useCursorPrompting';
import { cn } from '@/lib/utils';

interface CursorPromptingPanelProps {
  isVisible: boolean;
  activeSection: ResumeSection | null;
  currentContent: string;
  cursorPosition: number;
  resumeContext: Record<string, any>;
  onClose: () => void;
  onApplySuggestion: (suggestion: string) => void;
  className?: string;
}

export const CursorPromptingPanel: React.FC<CursorPromptingPanelProps> = ({
  isVisible,
  activeSection,
  currentContent,
  cursorPosition,
  resumeContext,
  onClose,
  onApplySuggestion,
  className,
}) => {
  const {
    suggestions,
    completionSuggestion,
    isLoading,
    error,
    triggerPrompting,
    clearSuggestions,
  } = useCursorPrompting({
    enabled: isVisible && activeSection !== null,
    debounceMs: 800, // Slightly longer debounce for better performance
  });

  // Trigger prompting when content changes
  React.useEffect(() => {
    if (activeSection && isVisible) {
      triggerPrompting({
        activeSection,
        cursorPosition,
        currentContent,
        resumeContext,
      });
    } else {
      clearSuggestions();
    }
  }, [activeSection, cursorPosition, currentContent, resumeContext, isVisible, triggerPrompting, clearSuggestions]);

  const handleApplySuggestion = (suggestionText: string) => {
    onApplySuggestion(suggestionText);
    clearSuggestions();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className={cn(
        'cursor-prompting-panel',
        {
          'is-visible': isVisible,
        },
        className
      )}
    >
      <div className="cursor-prompting-card">
        <div className="cursor-prompting-header">
          <span className="icon">✨</span>
          <div>
            <h4>AI Cursor Assistant</h4>
            <span className="cursor-prompting-context">
              {activeSection ? `Editing: ${activeSection}` : 'Select a section to edit'}
              {isLoading && <span className="loading-indicator"> (Thinking...)</span>}
            </span>
          </div>
        </div>

        <div className="cursor-prompting-content">
          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
            </div>
          )}

          {isLoading && suggestions.length === 0 && !error && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Analyzing your content...</p>
            </div>
          )}

          {completionSuggestion && (
            <div className="completion-suggestion">
              <div className="suggestion-header">
                <span className="suggestion-icon">💡</span>
                <strong>Smart Completion</strong>
              </div>
              <p className="suggestion-description">
                {completionSuggestion.description}
              </p>
              <div className="suggestion-text">
                <code>{completionSuggestion.suggested_text}</code>
              </div>
              <button
                className="btn-apply-completion"
                onClick={() => handleApplySuggestion(completionSuggestion.suggested_text)}
              >
                Apply Completion
              </button>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="suggestions-list">
              <h5>💭 Suggestions</h5>
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="prompt-suggestion">
                  <div className="suggestion-header">
                    <span className="suggestion-type">
                      {getSuggestionIcon(suggestion.type)}
                    </span>
                    <strong>{suggestion.title}</strong>
                    <span className="confidence-badge">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                  <p className="suggestion-description">
                    {suggestion.description}
                  </p>
                  <div className="suggestion-text">
                    <code>{suggestion.suggested_text}</code>
                  </div>
                  <div className="suggestion-actions">
                    <button
                      className="btn-apply-suggestion"
                      onClick={() => handleApplySuggestion(suggestion.suggested_text)}
                    >
                      Apply Suggestion
                    </button>
                    <button
                      className="btn-preview-suggestion"
                      onClick={() => {
                        // Could implement preview functionality here
                        console.log('Preview suggestion:', suggestion.suggested_text);
                      }}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {suggestions.length === 0 && !isLoading && !error && !completionSuggestion && (
            <div className="empty-state">
              <p>Start typing in a resume section to get AI-powered suggestions!</p>
              <div className="empty-state-hints">
                <p><strong>Tips:</strong></p>
                <ul>
                  <li>Type a few sentences to get content suggestions</li>
                  <li>Place your cursor where you want help</li>
                  <li>The AI adapts to your writing style</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="cursor-prompting-actions">
          <button
            className="btn-close-cursor-prompting"
            onClick={onClose}
          >
            Close Assistant
          </button>
        </div>
      </div>
    </aside>
  );
};

// Helper function to get appropriate icons for suggestion types
function getSuggestionIcon(type: string): string {
  const icons: Record<string, string> = {
    improvement: '🔧',
    completion: '✨',
    style: '✍️',
    grammar: '📝',
    content: '📋',
  };

  return icons[type] || '💭';
}
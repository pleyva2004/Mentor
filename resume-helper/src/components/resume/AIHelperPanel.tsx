/**
 * AI Helper panel component with context-aware suggestions
 */

'use client';

import React from 'react';
import type { ResumeSection } from '@/types';
import { aiSuggestionsBySection } from '@/constants/aiSuggestions';
import { cn } from '@/lib/utils';

interface AIHelperPanelProps {
  isVisible: boolean;
  activeSection: ResumeSection | null;
  onClose: () => void;
  className?: string;
}

export const AIHelperPanel: React.FC<AIHelperPanelProps> = ({
  isVisible,
  activeSection,
  onClose,
  className,
}) => {
  const suggestions = activeSection ? aiSuggestionsBySection[activeSection] : [];

  return (
    <aside
      id="ai-helper"
      className={cn(
        'ai-helper-panel',
        {
          'is-visible': isVisible,
        },
        className
      )}
    >
      <div className="ai-helper-card">
        <div className="ai-helper-header">
          <span className="icon">🤖</span>
          <div>
            <h4>AI Assistant</h4>
            <span id="ai-helper-context" style={{ fontSize: '0.9rem', color: '#6B7280' }}>
              {activeSection ? `Editing: ${activeSection}` : 'Select a section to edit'}
            </span>
          </div>
        </div>

        <div id="ai-helper-content">
          {suggestions.length > 0 && (
            <div>
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="ai-suggestion">
                  <strong>{suggestion.title}</strong>
                  <p>{suggestion.description}</p>
                  <button
                    className="btn-ai"
                    onClick={suggestion.action}
                  >
                    Apply Suggestion
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ai-actions">
          <button
            className="btn-close-ai"
            onClick={onClose}
          >
            Done Editing
          </button>
        </div>
      </div>
    </aside>
  );
};

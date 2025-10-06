'use client';

import { useState } from 'react';

/**
 * Cursor Prompting Component
 * 
 * Frontend integration for the cursor prompting feature as specified in 
 * section 2.3 of the "Plan of Action for Cursor Prompting" document.
 * 
 * This component handles:
 * - User input capture
 * - API communication with the backend endpoint
 * - Loading states and error handling
 * - Response display
 */

// Type definitions matching backend DTOs
interface CursorPromptRequest {
  prompt: string;
  context?: Record<string, any>;
  user_id?: string;
}

interface CursorPromptResponse {
  response: string;
  timestamp: number;
  cached: boolean;
  processing_time_ms: number;
}

interface CursorPromptingProps {
  context?: Record<string, any>;
  placeholder?: string;
  className?: string;
}

export default function CursorPrompting({ 
  context, 
  placeholder = "Ask me anything about your resume or career...",
  className = ""
}: CursorPromptingProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<CursorPromptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState('demo-token-12345'); // Simplified for MVP

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const requestBody: CursorPromptRequest = {
        prompt: prompt.trim(),
        context: context
      };

      // API call following established pattern with credentials
      const apiResponse = await fetch('http://localhost:8000/api/prompts/cursor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include', // Following established pattern
        body: JSON.stringify(requestBody)
      });

      if (!apiResponse.ok) {
        if (apiResponse.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (apiResponse.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (apiResponse.status === 400) {
          const errorData = await apiResponse.json();
          throw new Error(errorData.detail || 'Invalid request');
        } else {
          throw new Error('Failed to get response. Please try again.');
        }
      }

      const responseData: CursorPromptResponse = await apiResponse.json();
      setResponse(responseData);
      
    } catch (err) {
      console.error('Cursor prompting error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResponse(null);
    setError(null);
  };

  return (
    <div className={`cursor-prompting-container ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          AI Assistant
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={2000}
              disabled={isLoading}
            />
            <div className="text-sm text-gray-500 mt-1">
              {prompt.length}/2000 characters
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Thinking...
                </span>
              ) : (
                'Ask AI'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-800">AI Response</h4>
              <div className="text-xs text-gray-500 space-x-2">
                {response.cached && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    Cached
                  </span>
                )}
                <span>
                  {response.processing_time_ms}ms
                </span>
              </div>
            </div>
            
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {response.response}
            </div>
            
            <div className="text-xs text-gray-400 mt-3">
              Generated at {new Date(response.timestamp * 1000).toLocaleString()}
            </div>
          </div>
        )}

        {/* Context Display (for debugging) */}
        {context && Object.keys(context).length > 0 && (
          <details className="mt-4">
            <summary className="text-sm text-gray-600 cursor-pointer">
              Context Information
            </summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <pre>{JSON.stringify(context, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for managing authentication token
 * 
 * In production, this should integrate with the application's
 * authentication system as specified in the plan.
 */
export function useAuthToken() {
  const [token, setToken] = useState<string | null>('demo-token-12345');
  
  // In production, implement proper token management:
  // - Retrieve from localStorage/cookies
  // - Handle token refresh
  // - Integrate with JWT authentication
  
  return {
    token,
    setToken,
    isAuthenticated: !!token
  };
}
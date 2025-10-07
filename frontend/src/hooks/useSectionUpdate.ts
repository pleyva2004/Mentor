import { useState } from 'react';

interface SectionUpdateResult {
  success: boolean;
  error?: string;
  content?: string;
  education?: string;
  validation?: {
    is_valid: boolean;
    warnings: string[];
    suggestions: string[];
  };
}

export const useSectionUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSection = async (
    resumeId: string,
    sectionId: string,
    content: string
  ): Promise<SectionUpdateResult> => {
    setIsUpdating(true);
    setError(null);

    try {
      // First validate the section
      const validationResponse = await fetch('http://localhost:8000/validate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_id: sectionId,
          content: content
        })
      });

      const validationData = await validationResponse.json();

      // Update the section
      const updateResponse = await fetch('http://localhost:8000/update-section', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_id: sectionId,
          content: content,
          resume_id: resumeId
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.detail || 'Failed to update section');
      }

      const updateData = await updateResponse.json();

      return {
        success: true,
        validation: validationData
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const parseSection = async (sectionId: string, rawText: string): Promise<SectionUpdateResult> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/parse-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_id: sectionId,
          raw_text: rawText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to parse section');
      }

      const data = await response.json();

      return {
        success: true,
        content: data.content
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const integrateCourses = async (
    resumeId: string,
    selectedCourses: Array<{ code: string; name: string }>
  ): Promise<SectionUpdateResult> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/integrate-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: resumeId,
          selected_courses: selectedCourses
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to integrate courses');
      }

      const data = await response.json();

      return {
        success: true,
        education: data.education
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateSection,
    parseSection,
    integrateCourses,
    isUpdating,
    error
  };
};

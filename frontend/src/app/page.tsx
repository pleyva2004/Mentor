'use client';

import { useState } from 'react';
import CourseList, { Course } from '@/components/CourseList';
import CursorPrompting from '@/components/CursorPrompting';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);

      // Transform backend course_work format to component format
      if (data.course_work && Array.isArray(data.course_work)) {
        const transformedCourses = data.course_work.map((course: any) => ({
          id: course.course_number,
          name: course.course_title,
          code: course.course_number
        }));
        setCourses(transformedCourses);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Mentór
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Upload your resume PDF to extract text
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block text-center"
            >
              <div className="text-gray-500 mb-2">
                <svg
                  className="mx-auto h-12 w-12"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-gray-600">
                {file ? file.name : 'Click to select PDF file'}
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>

        {result && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Extracted Text ({result.character_count} characters)
            </h2>
            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {result.text}
              </pre>
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <CourseList
              courses={courses}
              onSelectionChange={setSelectedCourses}
            />
          </div>
        )}

        {/* Cursor Prompting Feature - Always available */}
        <div className="mt-8 border-t pt-6">
          <CursorPrompting
            context={{
              user_background: result ? 'Resume uploaded and processed' : 'No resume uploaded',
              current_resume_section: result ? 'course_selection' : 'file_upload',
              career_level: 'student', // This could be extracted from resume data
              has_resume_data: !!result,
              available_courses: courses.length,
              selected_courses: selectedCourses.length
            }}
            placeholder="Ask me anything about your resume, career advice, or course selection..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

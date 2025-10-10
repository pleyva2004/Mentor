'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourseList, { Course } from '@/components/CourseList';

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);

  // Load resume data from localStorage on component mount only if there's a resume ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resumeIdFromUrl = urlParams.get('id');
    
    if (resumeIdFromUrl) {
      const storedData = localStorage.getItem('resumeData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setResult(data);
          setIsProcessed(true);
          setResumeId(resumeIdFromUrl);
        } catch (err) {
          console.error('Error loading stored resume data:', err);
        }
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
      setIsProcessed(false);
    }
  };

  const handleClearResume = () => {
    setResult(null);
    setFile(null);
    setResumeId(null);
    setIsProcessed(false);
    setSelectedCourses([]);
    setError(null);
    localStorage.removeItem('resumeData');
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
      console.log('Backend response:', data);
      console.log('Header:', data.header);
      console.log('Experience:', data.experience);
      console.log('Education:', data.education);
      console.log('Projects:', data.projects);
      console.log('Skills:', data.skills);
      console.log('🔍 Course Work Data:', data.course_work);
      console.log('📚 Course Work Length:', data.course_work?.length);
      setResult(data);
      setResumeId(data.resume_id as string);
      setIsProcessed(true);

      // Transform backend course_work format to component format
      // Support both old cache format (code/name) and new format (course_number/course_title)
      if (data.course_work && Array.isArray(data.course_work)) {
        console.log('✅ Processing courses array with', data.course_work.length, 'courses');
        const transformedCourses = data.course_work.map((course: Record<string, unknown>) => ({
          id: (course.course_number || course.code) as string,
          name: (course.course_title || course.name) as string,
          code: (course.course_number || course.code) as string
        }));
        console.log('✅ Transformed courses:', transformedCourses);
        setCourses(transformedCourses);
      } else {
        console.log('❌ No course_work found or not an array:', typeof data.course_work, data.course_work);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleIntegrateCourses = async () => {
    if (!resumeId || selectedCourses.length === 0) return;

    try {
      const selectedCourseData = courses.filter(c => selectedCourses.includes(c.id));
      
      const response = await fetch('http://localhost:8000/integrate-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_id: resumeId,
          selected_courses: selectedCourseData.map(c => ({
            code: c.code,
            name: c.name
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update education section with new content
        setResult(prev => prev ? { ...prev, education: data.education } : prev);
        setSelectedCourses([]);
      }
    } catch (err) {
      console.error('Error integrating courses:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Mentór
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Upload your resume PDF to extract and analyze your coursework
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {isUploading ? 'Processing Resume...' : 'Upload & Process Resume'}
            </button>

            {!isProcessed && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg p-8 transition-colors duration-200 bg-gray-50 dark:bg-gray-900/50">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-3">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {file ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        {file.name}
                      </span>
                    ) : (
                      'Click to select PDF file'
                    )}
                  </span>
                  {!file && (
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-2">
                      PDF files only, max 10MB
                    </span>
                  )}
                </label>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Success Message */}
        {isProcessed && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-5 py-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="font-medium">Resume processed successfully! You can now review each section below.</p>
            </div>
            <button
              onClick={handleClearResume}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Resume
            </button>
          </div>
        )}

        {/* Resume Sections */}
        {result && (
          <div className="space-y-6">
            {/* Header Section */}
            {result.header && typeof result.header === 'string' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: result.header as string }} />
              </div>
            ) : null}

            {/* Projects Section */}
            {result.projects && typeof result.projects === 'string' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Projects</h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: result.projects as string }} />
              </div>
            ) : null}

            {/* Experience Section */}
            {result.experience && typeof result.experience === 'string' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Experience</h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: result.experience as string }} />
              </div>
            ) : null}

            {/* Skills Section */}
            {result.skills && typeof result.skills === 'string' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Skills</h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: result.skills as string }} />
              </div>
            ) : null}

            {/* Education Section */}
            {result.education && typeof result.education === 'string' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Education</h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: result.education as string }} />
              </div>
            ) : null}
          </div>
        )}

        {/* Edit Resume Button */}
        {result && resumeId && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                // Store resume data in localStorage before navigating
                localStorage.setItem('resumeData', JSON.stringify(result));
                router.push(`/resume-editor?id=${resumeId}`);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Resume with AI
            </button>
          </div>
        )}

        {/* Coursework Section */}
        {courses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Coursework Preview
              </h2>
            </div>
            <CourseList
              courses={courses}
              onSelectionChange={setSelectedCourses}
            />
            {selectedCourses.length > 0 && (
              <button
                onClick={handleIntegrateCourses}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Add {selectedCourses.length} Selected Course{selectedCourses.length !== 1 ? 's' : ''} to Resume
              </button>
            )}
          </div>
        )}

        {/* Debug Section */}
        {result && (
          <details className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              Debug: Backend Response
            </summary>
            <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {result.text as string}
                </pre>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

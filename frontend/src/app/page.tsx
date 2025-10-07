'use client';

import { useState } from 'react';
import CourseList, { Course } from '@/components/CourseList';
import ResumePreview from '@/components/ResumePreview';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [isSampleCourses, setIsSampleCourses] = useState(false);

  const handleSectionUpdate = (sectionId: string, content: string) => {
    if (resumeData) {
      setResumeData({
        ...resumeData,
        [sectionId]: content
      });
    }
  };

  const handleCourseSelectionChange = async (selectedCourseIds: string[]) => {
    setSelectedCourses(selectedCourseIds);
    
    // Update education section with selected courses using backend API
    if (resumeData && resumeData.resume_id && selectedCourseIds.length > 0) {
      const selectedCoursesData = courses.filter(course => 
        selectedCourseIds.includes(course.id)
      );
      
      try {
        const response = await fetch('http://localhost:8000/integrate-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume_id: resumeData.resume_id,
            selected_courses: selectedCoursesData
          })
        });

        if (response.ok) {
          const data = await response.json();
          setResumeData({
            ...resumeData,
            education: data.education
          });
        } else {
          console.error('Failed to integrate courses');
          // Fallback to local update
          const coursesHtml = selectedCoursesData.map(course => 
            `<li>${course.code}: ${course.name}</li>`
          ).join('');
          
          const coursesSection = `
            <p><strong>Relevant Coursework:</strong></p>
            <ul>${coursesHtml}</ul>
          `;
          
          const updatedEducation = resumeData.education + coursesSection;
          
          setResumeData({
            ...resumeData,
            education: updatedEducation
          });
        }
      } catch (error) {
        console.error('Error integrating courses:', error);
      }
    }
  };

  const handleExportPDF = () => {
    // Simple PDF export using browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow && resumeData) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            h1, h2, h3, h4 { color: #333; }
            .section { margin-bottom: 20px; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 5px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="section">${resumeData.header}</div>
          <div class="section">${resumeData.projects}</div>
          <div class="section">${resumeData.skills}</div>
          <div class="section">${resumeData.experience}</div>
          <div class="section">${resumeData.education}</div>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

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
      console.log('Backend response:', data); // Debug log
      setResult(data);
      setResumeData(data);

      // Transform backend course_work format to component format
      if (data.course_work && Array.isArray(data.course_work) && data.course_work.length > 0) {
        const transformedCourses = data.course_work.map((course: any) => ({
          id: course.course_number,
          name: course.course_title,
          code: course.course_number
        }));
        setCourses(transformedCourses);
        setIsSampleCourses(false);
      } else {
        // Fallback: Show sample courses when quota is exceeded
        const sampleCourses = [
          { id: "CS101", name: "Introduction to Computer Science", code: "CS 101" },
          { id: "CS102", name: "Data Structures and Algorithms", code: "CS 102" },
          { id: "CS201", name: "Software Engineering", code: "CS 201" },
          { id: "CS301", name: "Database Systems", code: "CS 301" },
          { id: "CS401", name: "Machine Learning", code: "CS 401" },
          { id: "MATH101", name: "Calculus I", code: "MATH 101" },
          { id: "MATH102", name: "Calculus II", code: "MATH 102" },
          { id: "STAT101", name: "Statistics", code: "STAT 101" }
        ];
        setCourses(sampleCourses);
        setIsSampleCourses(true);
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
          Upload your resume PDF to extract and edit your resume
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
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Resume...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload & Process Resume
              </>
            )}
          </button>
        </form>

        {resumeData && (
          <div className="mt-8">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              ✅ Resume processed successfully! You can now edit each section below.
            </div>
            
            {/* Debug section - remove in production */}
            <details className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">Debug: Backend Response</summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                {JSON.stringify(resumeData, null, 2)}
              </pre>
            </details>
            <ResumePreview 
              data={{
                header: resumeData.header || '',
                projects: resumeData.projects || '',
                skills: resumeData.skills || '',
                experience: resumeData.experience || '',
                education: resumeData.education || ''
              }}
              rawText={resumeData.text}
              resumeId={resumeData.resume_id}
              onSectionUpdate={handleSectionUpdate}
              onExportPDF={handleExportPDF}
            />
          </div>
        )}

        {result && !resumeData && (
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

        {resumeData && (
          <div className="mt-8 border-t pt-6">
            <CourseList
              courses={courses}
              onSelectionChange={handleCourseSelectionChange}
              isSampleData={isSampleCourses}
            />
          </div>
        )}
      </div>
    </div>
  );
}

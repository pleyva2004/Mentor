'use client';

import { useState } from 'react';
import CourseBox from './CourseBox';

export interface Course {
  id: string;
  name: string;
  code?: string;
}

interface CourseListProps {
  courses: Course[];
  onSelectionChange?: (selectedCourses: string[]) => void;
  isSampleData?: boolean;
}

export default function CourseList({ courses, onSelectionChange, isSampleData = false }: CourseListProps) {
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  const toggleCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const clearSelection = () => {
    setSelectedCourses(new Set());
    onSelectionChange?.([]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Select Your Completed Courses
          </h2>
          {isSampleData && (
            <p className="text-sm text-amber-600 mt-1">
              Showing sample courses (course scraping temporarily unavailable)
            </p>
          )}
        </div>
        {selectedCourses.size > 0 && (
          <button
            onClick={clearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all ({selectedCourses.size})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {courses.map((course) => (
          <CourseBox
            key={course.id}
            courseName={course.name}
            courseCode={course.code}
            isSelected={selectedCourses.has(course.id)}
            onToggle={() => toggleCourse(course.id)}
          />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-yellow-600 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Course Scraping Temporarily Unavailable
            </h3>
            <p className="text-yellow-700 mb-4">
              Due to API quota limits, course recommendations are not available right now. 
              You can still edit your education section manually below.
            </p>
            <div className="text-sm text-yellow-600">
              <p>• Your resume has been processed successfully</p>
              <p>• You can edit all sections manually</p>
              <p>• Course recommendations will be available once quota is restored</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

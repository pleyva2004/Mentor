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
}

export default function CourseList({ courses, onSelectionChange }: CourseListProps) {
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
        <h2 className="text-xl font-semibold text-gray-800">
          Select Your Completed Courses
        </h2>
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
        <div className="text-center py-8 text-gray-500">
          No courses available. Upload your resume to get started.
        </div>
      )}
    </div>
  );
}

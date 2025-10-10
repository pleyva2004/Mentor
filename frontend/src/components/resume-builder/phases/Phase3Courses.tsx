'use client';

import React, { useState, useEffect } from 'react';
import { useResumeBuilderStore, Course } from '@/stores/resumeBuilderStore';
import { Search, Star, CheckSquare, Square } from 'lucide-react';

export function Phase3Courses() {
  const {
    selectedCourses,
    toggleCourseSelection,
    toggleCourseSignificance,
    setSelectedCourses,
    education,
    resumeId,
  } = useResumeBuilderStore();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  useEffect(() => {
    // Fetch courses based on education data
    const fetchCourses = async () => {
      if (!education.school || !education.major) {
        console.log('⚠️ Missing education data:', { school: education.school, major: education.major });
        return;
      }
      
      setIsLoading(true);
      try {
        // First check if courses were already loaded from upload
        if (selectedCourses.length > 0) {
          console.log('✅ Using existing courses from store:', selectedCourses.length);
          setCourses(selectedCourses);
          setIsLoading(false);
          return;
        }
        
        console.log('📡 Fetching courses for:', education.school, education.major);
        
        // Fetch courses from backend using course scraper
        // Note: resumeId is optional for scraping, can be null for initial fetch
        const response = await fetch('http://localhost:8000/scrape-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school: education.school,
            major: education.major,
            resume_id: resumeId || 'temp-id' // Use temp ID if no resume uploaded yet
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Backend error:', response.status, errorText);
          throw new Error(`Failed to fetch courses: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📚 Received course data:', data);
        
        if (!data.courses || !Array.isArray(data.courses)) {
          console.error('❌ Invalid courses data:', data);
          throw new Error('Invalid courses response from server');
        }
        
        const transformedCourses = data.courses.map((c: any) => ({
          id: c.course_number || c.code,
          code: c.course_number || c.code,
          name: c.course_title || c.name
        }));
        
        console.log('✅ Transformed courses:', transformedCourses.length, 'courses');
        setCourses(transformedCourses);
      } catch (error) {
        console.error('❌ Error fetching courses:', error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [education.school, education.major, resumeId]);
  
  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelectAll = () => {
    setSelectedCourses(courses);
  };
  
  const handleClearAll = () => {
    setSelectedCourses([]);
  };
  
  const isSelected = (courseId: string) => {
    return selectedCourses.some((c) => c.id === courseId);
  };
  
  const isSignificant = (courseCode: string) => {
    const course = selectedCourses.find((c) => c.code === courseCode);
    return course?.isSignificant || false;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by code or name (e.g., '6.824' or 'Distributed')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>
      
      {/* Course List */}
      <div className="border border-border rounded-lg max-h-96 overflow-y-auto">
        {filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? (
              <p>No courses found matching "{searchTerm}"</p>
            ) : courses.length === 0 ? (
              <div className="space-y-2">
                <p>No courses found for {education.school}</p>
                <p className="text-sm">You can add courses manually below.</p>
              </div>
            ) : (
              <p>No courses available</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCourses.map((course) => {
              const selected = isSelected(course.id);
              const significant = isSignificant(course.code);
              
              return (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleCourseSelection(course)}
                >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCourseSelection(course);
                    }}
                    className="flex-shrink-0"
                  >
                    {selected ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {course.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {course.name}
                    </div>
                  </div>
                  
                  {/* Star for significance */}
                  {selected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCourseSignificance(course.code);
                      }}
                      className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                        significant
                          ? 'text-warning bg-warning/10'
                          : 'text-muted-foreground hover:text-warning hover:bg-warning/10'
                      }`}
                      title="Mark as significant project course"
                    >
                      <Star
                        className={`w-5 h-5 ${significant ? 'fill-current' : ''}`}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Manual Entry Option */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Can't find your course?{' '}
          <button
            onClick={() => setShowManualEntry(true)}
            className="text-primary hover:text-primary-hover font-medium"
          >
            Enter Manually
          </button>
        </p>
      </div>
      
      {/* Info about star marking */}
      {selectedCourses.some((c) => c.isSignificant) && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-foreground">
            <Star className="w-4 h-4 inline mr-1 fill-warning text-warning" />
            <span className="font-medium">Starred courses</span> will be prioritized when describing projects in the next step.
          </p>
        </div>
      )}
    </div>
  );
}


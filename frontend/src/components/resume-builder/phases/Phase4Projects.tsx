'use client';

import React, { useCallback } from 'react';
import { useResumeBuilderStore, ProjectData } from '@/stores/resumeBuilderStore';
import { FormField } from '../shared/FormField';
import { Star } from 'lucide-react';
import { debounce } from '@/lib/debounce';

export function Phase4Projects() {
  const { selectedCourses, projects, setProject, resumeId } = useResumeBuilderStore();
  
  // Debounced save function
  const debouncedSaveProject = useCallback(
    debounce(async (courseCode: string, projectData: ProjectData) => {
      if (!resumeId) return;
      
      try {
        await fetch('http://localhost:8000/associate-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_id: resumeId,
            course_code: courseCode,
            project: projectData
          })
        });
      } catch (error) {
        console.error('Failed to save project:', error);
      }
    }, 1000),
    [resumeId]
  );
  
  // Update the setProject call
  const handleProjectUpdate = (courseCode: string, field: string, value: string) => {
    const currentProject = projects.get(courseCode) || { description: '', githubUrl: '', technologies: '' };
    const updatedProject = { ...currentProject, [field]: value };
    
    setProject(courseCode, updatedProject);
    
    // Auto-save to backend
    if (updatedProject.description.trim()) {
      debouncedSaveProject(courseCode, updatedProject);
    }
  };
  
  // Sort courses with significant ones first
  const sortedCourses = [...selectedCourses].sort((a, b) => {
    if (a.isSignificant && !b.isSignificant) return -1;
    if (!a.isSignificant && b.isSignificant) return 1;
    return 0;
  });
  
  if (selectedCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No courses selected. Please go back and select courses first.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-medium">Instructions:</span> Describe the main project or learning outcome for each course. This will help us generate compelling bullet points for your resume.
        </p>
      </div>
      
      <div className="space-y-6">
        {sortedCourses.map((course) => {
          const project = projects.get(course.code);
          
          return (
            <div
              key={course.code}
              className="bg-card border border-border rounded-lg p-6 space-y-4"
            >
              {/* Course Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    {course.code}: {course.name}
                    {course.isSignificant && (
                      <Star className="w-4 h-4 fill-warning text-warning" />
                    )}
                  </h3>
                </div>
              </div>
              
              {/* Project Description */}
              <FormField
                label="Project Description"
                name={`project-description-${course.code}`}
                type="textarea"
                value={project?.description || ''}
                onChange={(value) => handleProjectUpdate(course.code, 'description', value)}
                placeholder="Describe what you built or learned. Be specific about technologies used and outcomes achieved."
                required
                rows={4}
              />
              
              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="GitHub URL (Optional)"
                  name={`project-github-${course.code}`}
                  type="url"
                  value={project?.githubUrl || ''}
                  onChange={(value) => handleProjectUpdate(course.code, 'githubUrl', value)}
                  placeholder="https://github.com/username/project"
                />
                
                <FormField
                  label="Technologies Used (Optional)"
                  name={`project-tech-${course.code}`}
                  type="text"
                  value={project?.technologies || ''}
                  onChange={(value) => handleProjectUpdate(course.code, 'technologies', value)}
                  placeholder="e.g., React, Node.js, PostgreSQL"
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
        {selectedCourses.length} {selectedCourses.length === 1 ? 'course' : 'courses'} selected
        {' • '}
        {Array.from(projects.values()).filter((p) => p.description.trim()).length} {' '}
        {Array.from(projects.values()).filter((p) => p.description.trim()).length === 1 ? 'project' : 'projects'} described
      </div>
    </div>
  );
}


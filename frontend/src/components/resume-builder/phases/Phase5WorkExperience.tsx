'use client';

import React, { useCallback } from 'react';
import { useResumeBuilderStore, ExperienceData } from '@/stores/resumeBuilderStore';
import { FormField } from '../shared/FormField';
import { Plus, Trash2 } from 'lucide-react';
import { debounce } from '@/lib/debounce';

export function Phase5WorkExperience() {
  const { workExperiences, addWorkExperience, updateWorkExperience, removeWorkExperience, resumeId } = useResumeBuilderStore();
  
  // Debounced function to save work experience to backend
  const debouncedUpdateExperience = useCallback(
    debounce(async (index: number, experience: ExperienceData) => {
      if (!resumeId) return;
      
      try {
        await fetch('http://localhost:8000/update-work-experience', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_id: resumeId,
            index: index,
            experience: experience
          })
        });
      } catch (error) {
        console.error('Failed to update work experience:', error);
      }
    }, 1000),
    [resumeId]
  );
  
  const handleAddExperience = async () => {
    const newExperience = {
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      location: '',
      leadership: '',
    };
    
    addWorkExperience(newExperience);
    
    // Save to backend
    if (resumeId) {
      try {
        await fetch('http://localhost:8000/add-work-experience', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_id: resumeId,
            experience: newExperience
          })
        });
      } catch (error) {
        console.error('Failed to save work experience:', error);
      }
    }
  };
  
  const handleUpdateField = (index: number, field: keyof ExperienceData, value: string) => {
    const experience = workExperiences[index];
    const updatedExperience = {
      ...experience,
      [field]: value,
    };
    
    updateWorkExperience(index, updatedExperience);
    
    // Auto-save to backend (debounced)
    debouncedUpdateExperience(index, updatedExperience);
  };
  
  const handleRemoveExperience = async (index: number) => {
    removeWorkExperience(index);
    
    if (resumeId) {
      try {
        await fetch('http://localhost:8000/remove-work-experience', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_id: resumeId,
            index: index
          })
        });
      } catch (error) {
        console.error('Failed to remove work experience:', error);
      }
    }
  };
  
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-medium">Tip:</span> Include internships, co-ops, part-time jobs, and volunteer positions. Even retail or service experience can demonstrate valuable skills!
        </p>
      </div>
      
      {workExperiences.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No work experience added yet.</p>
          <button
            onClick={handleAddExperience}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {workExperiences.map((experience, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Experience #{index + 1}
                </h3>
                <button
                  onClick={() => handleRemoveExperience(index)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                  aria-label="Remove experience"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Job Title"
                  name={`title-${index}`}
                  type="text"
                  value={experience.title}
                  onChange={(value) => handleUpdateField(index, 'title', value)}
                  placeholder="e.g., Software Engineering Intern"
                  required
                />
                
                <FormField
                  label="Company"
                  name={`company-${index}`}
                  type="text"
                  value={experience.company}
                  onChange={(value) => handleUpdateField(index, 'company', value)}
                  placeholder="e.g., Google"
                  required
                />
              </div>
              
              {/* Dates and Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Start Date"
                  name={`startDate-${index}`}
                  type="month"
                  value={experience.startDate || ''}
                  onChange={(value) => handleUpdateField(index, 'startDate', value)}
                />
                
                <FormField
                  label="End Date"
                  name={`endDate-${index}`}
                  type="month"
                  value={experience.endDate || ''}
                  onChange={(value) => handleUpdateField(index, 'endDate', value)}
                />
                
                <FormField
                  label="Location"
                  name={`location-${index}`}
                  type="text"
                  value={experience.location || ''}
                  onChange={(value) => handleUpdateField(index, 'location', value)}
                  placeholder="e.g., Mountain View, CA"
                />
              </div>
              
              {/* Leadership Prompt */}
              <div className="p-4 bg-primary-light border border-primary/20 rounded-lg">
                <FormField
                  label="Leadership Experience (Optional)"
                  name={`leadership-${index}`}
                  type="textarea"
                  value={experience.leadership || ''}
                  onChange={(value) => handleUpdateField(index, 'leadership', value)}
                  placeholder="Describe a time you demonstrated leadership or took initiative. For example: mentored new team members, proposed process improvements, led a project, etc."
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Another Button */}
      {workExperiences.length > 0 && (
        <button
          onClick={handleAddExperience}
          className="w-full px-6 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors inline-flex items-center justify-center gap-2 text-foreground"
        >
          <Plus className="w-5 h-5" />
          Add Another Experience
        </button>
      )}
      
      {/* Info about optional */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
        Don't have work experience yet? That's okay! You can skip this step.
      </div>
    </div>
  );
}


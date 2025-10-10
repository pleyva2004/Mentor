'use client';

import React from 'react';
import { useResumeBuilderStore } from '@/stores/resumeBuilderStore';
import { FormField } from '../shared/FormField';

const DEGREE_TYPES = ['BSc', 'BA', 'MSc', 'MA', 'PhD', 'Other'];

const COMMON_SCHOOLS = [
  'Massachusetts Institute of Technology',
  'Stanford University',
  'Carnegie Mellon University',
  'University of California, Berkeley',
  'Georgia Institute of Technology',
  'California Institute of Technology',
  'University of Illinois Urbana-Champaign',
  'University of Michigan',
  'Cornell University',
  'University of Washington',
  'Princeton University',
  'Harvard University',
  'Yale University',
  'Columbia University',
  'University of Texas at Austin',
  'University of California, Los Angeles',
  'University of California, San Diego',
  'New Jersey Institute of Technology',
];

export function Phase2Education() {
  const { education, updateEducation } = useResumeBuilderStore();
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* School */}
      <div>
        <FormField
          label="School / University"
          name="school"
          type="text"
          value={education.school}
          onChange={(value) => updateEducation({ school: value })}
          placeholder="e.g., Massachusetts Institute of Technology"
          required
        />
        {/* Datalist for autocomplete */}
        <datalist id="schools">
          {COMMON_SCHOOLS.map((school) => (
            <option key={school} value={school} />
          ))}
        </datalist>
      </div>
      
      {/* Major */}
      <FormField
        label="Major / Field of Study"
        name="major"
        type="text"
        value={education.major}
        onChange={(value) => updateEducation({ major: value })}
        placeholder="e.g., Computer Science and Engineering"
        required
      />
      
      {/* Degree Type and Graduation Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Degree Type"
          name="degreeType"
          type="select"
          value={education.degreeType}
          onChange={(value) => updateEducation({ degreeType: value })}
          options={DEGREE_TYPES}
          required
        />
        
        <FormField
          label="Expected Graduation"
          name="gradYear"
          type="month"
          value={education.gradYear}
          onChange={(value) => updateEducation({ gradYear: value })}
          required
        />
      </div>
      
      {/* Info Box */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Tip:</span> We'll use this information to find relevant courses and tailor your resume to your field of study.
        </p>
      </div>
    </div>
  );
}


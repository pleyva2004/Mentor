'use client';

import React, { useState, useEffect } from 'react';
import { useResumeBuilderStore, SkillsData } from '@/stores/resumeBuilderStore';
import { X, Plus, AlertTriangle } from 'lucide-react';

type SkillCategory = keyof SkillsData;

const SKILL_CATEGORIES: { key: SkillCategory; label: string; placeholder: string }[] = [
  { key: 'languages', label: 'Programming Languages', placeholder: 'e.g., Python, JavaScript, Java' },
  { key: 'frameworks', label: 'Frameworks & Libraries', placeholder: 'e.g., React, Node.js, Django' },
  { key: 'databases', label: 'Databases', placeholder: 'e.g., PostgreSQL, MongoDB, Redis' },
  { key: 'cloud', label: 'Cloud & DevOps', placeholder: 'e.g., AWS, Docker, Kubernetes' },
];

export function Phase7Skills() {
  const { skills, addSkill, removeSkill, resumeId } = useResumeBuilderStore();
  const [newSkills, setNewSkills] = useState<Record<SkillCategory, string>>({
    languages: '',
    frameworks: '',
    databases: '',
    cloud: '',
  });
  const [unmappedSkills, setUnmappedSkills] = useState<string[]>([]);
  
  // Auto-save when skills change
  useEffect(() => {
    const saveSkills = async () => {
      if (!resumeId) return;
      
      try {
        await fetch('http://localhost:8000/update-skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_id: resumeId,
            skills: skills
          })
        });
      } catch (error) {
        console.error('Failed to save skills:', error);
      }
    };
    
    // Debounce the save
    const timeoutId = setTimeout(saveSkills, 1000);
    return () => clearTimeout(timeoutId);
  }, [skills, resumeId]);
  
  // Validate skills on mount and when entering phase
  useEffect(() => {
    const validateSkills = async () => {
      if (!resumeId) return;
      
      const allSkills = [
        ...skills.languages,
        ...skills.frameworks,
        ...skills.databases,
        ...skills.cloud
      ];
      
      if (allSkills.length === 0) return;
      
      try {
        const response = await fetch('http://localhost:8000/validate-skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_id: resumeId,
            skills: allSkills
          })
        });
        
        const result = await response.json();
        setUnmappedSkills(result.unmapped_skills || []);
      } catch (error) {
        console.error('Failed to validate skills:', error);
      }
    };
    
    validateSkills();
  }, [skills, resumeId]);
  
  const handleAddSkill = (category: SkillCategory) => {
    const skill = newSkills[category].trim();
    if (skill && !skills[category].includes(skill)) {
      addSkill(category, skill);
      setNewSkills({ ...newSkills, [category]: '' });
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, category: SkillCategory) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(category);
    }
  };
  
  const totalSkills = Object.values(skills).reduce((sum, arr) => sum + arr.length, 0);
  
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-medium">Review your skills:</span> We've extracted these from your resume and coursework. Add or remove as needed. Only include skills you're comfortable discussing in an interview.
        </p>
      </div>
      
      {/* Skill Categories */}
      <div className="space-y-6">
        {SKILL_CATEGORIES.map(({ key, label, placeholder }) => (
          <div key={key} className="border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{label}</h3>
            
            {/* Skill Tags */}
            {skills[key].length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills[key].map((skill) => (
                  <div
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-full font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(key, skill)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No skills added yet
              </p>
            )}
            
            {/* Add Skill Form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkills[key]}
                onChange={(e) => setNewSkills({ ...newSkills, [key]: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, key)}
                placeholder={placeholder}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              <button
                onClick={() => handleAddSkill(key)}
                disabled={!newSkills[key].trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Validation Warnings */}
      {totalSkills === 0 && (
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">No skills added</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add at least a few skills to make your resume stand out. Skills are crucial for passing ATS (Applicant Tracking Systems).
            </p>
          </div>
        </div>
      )}
      
      {/* Display warning for unmapped skills */}
      {unmappedSkills.length > 0 && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Skills not found in resume:
              </p>
              <p className="text-sm text-muted-foreground">
                {unmappedSkills.join(', ')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Consider adding these skills to your work experience or project descriptions.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
        {totalSkills} {totalSkills === 1 ? 'skill' : 'skills'} total
      </div>
    </div>
  );
}


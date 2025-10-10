'use client';

import React, { useState } from 'react';
import { useResumeBuilderStore } from '@/stores/resumeBuilderStore';
import { Stepper } from '@/components/resume-builder/Stepper';
import { PhaseContainer } from '@/components/resume-builder/PhaseContainer';
import { NavigationButtons } from '@/components/resume-builder/NavigationButtons';
import { isPhaseValid, getPhaseTitle } from '@/lib/validation';
import { Phase1Upload } from '@/components/resume-builder/phases/Phase1Upload';
import { Phase2Education } from '@/components/resume-builder/phases/Phase2Education';
import { Phase3Courses } from '@/components/resume-builder/phases/Phase3Courses';
import { Phase4Projects } from '@/components/resume-builder/phases/Phase4Projects';
import { Phase5WorkExperience } from '@/components/resume-builder/phases/Phase5WorkExperience';
import { Phase6Editor } from '@/components/resume-builder/phases/Phase6Editor';
import { Phase7Skills } from '@/components/resume-builder/phases/Phase7Skills';
import { Phase8Export } from '@/components/resume-builder/phases/Phase8Export';

export default function ResumeBuilderPage() {
  const store = useResumeBuilderStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const { currentPhase, completedPhases, setPhase, completePhase } = store;
  
  // Check if current phase is valid
  const canProceed = isPhaseValid(currentPhase, store);
  
  const handleNext = async () => {
    if (!canProceed) return;
    
    setIsLoading(true);
    try {
      // Phase 2: Validate education before proceeding
      if (currentPhase === 2) {
        try {
          const response = await fetch('http://localhost:8000/validate-education', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              school: store.education.school,
              major: store.education.major
            })
          });
          
          const result = await response.json();
          
          if (!result.can_scrape_courses) {
            // Show warning that courses may not be available
            console.warn('Course catalog may not be available for this school/major combination');
            // Could add a toast notification here in the future
          }
        } catch (error) {
          console.error('Validation failed:', error);
          // Allow proceeding on error
        }
      }
      
      // Mark current phase as complete
      completePhase(currentPhase);
      
      // Move to next phase
      if (currentPhase < 8) {
        setPhase(currentPhase + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    if (currentPhase > 1) {
      setPhase(currentPhase - 1);
    }
  };
  
  const handlePhase1Complete = () => {
    completePhase(1);
    setPhase(2);
  };
  
  const renderPhase = () => {
    switch (currentPhase) {
      case 1:
        return <Phase1Upload onComplete={handlePhase1Complete} />;
      case 2:
        return <Phase2Education />;
      case 3:
        return <Phase3Courses />;
      case 4:
        return <Phase4Projects />;
      case 5:
        return <Phase5WorkExperience />;
      case 6:
        return <Phase6Editor />;
      case 7:
        return <Phase7Skills />;
      case 8:
        return <Phase8Export />;
      default:
        return (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Phase {currentPhase} content will be implemented here.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This is a placeholder for {getPhaseTitle(currentPhase)}.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Mentor Resume Builder
          </h1>
          <p className="text-muted-foreground">
            Build your professional resume in 8 guided steps
          </p>
        </div>
        
        {/* Stepper */}
        <Stepper
          currentPhase={currentPhase}
          totalPhases={8}
          completedPhases={completedPhases}
        />
        
        {/* Phase Content */}
        <PhaseContainer
          phase={currentPhase}
          title={getPhaseTitle(currentPhase)}
        >
          {renderPhase()}
        </PhaseContainer>
        
        {/* Navigation */}
        <NavigationButtons
          currentPhase={currentPhase}
          totalPhases={8}
          onBack={handleBack}
          onNext={handleNext}
          isNextDisabled={!canProceed}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}


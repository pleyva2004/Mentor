import { ResumeBuilderState } from '@/stores/resumeBuilderStore';

export type PhaseValidator = (state: ResumeBuilderState) => boolean;

export const phaseValidators: Record<number, PhaseValidator> = {
  1: (state) => {
    // Phase 1: Upload - either uploaded a file or has a resume ID (can skip upload)
    return !!state.uploadedFile || !!state.resumeId;
  },
  
  2: (state) => {
    // Phase 2: Education - all required fields must be filled
    return !!(
      state.education.school &&
      state.education.major &&
      state.education.gradYear
    );
  },
  
  3: (state) => {
    // Phase 3: Course Selection - at least one course selected
    return state.selectedCourses.length > 0;
  },
  
  4: (state) => {
    // Phase 4: Projects - all selected courses must have project descriptions
    if (state.selectedCourses.length === 0) return true;
    
    return state.selectedCourses.every((course) => {
      const project = state.projects.get(course.code);
      return project && project.description.trim().length > 0;
    });
  },
  
  5: (state) => {
    // Phase 5: Work Experience - if any experiences added, they must have title and company
    if (state.workExperiences.length === 0) return true;
    
    return state.workExperiences.every(
      (exp) => exp.title && exp.company
    );
  },
  
  6: (state) => {
    // Phase 6: Resume Editor - always valid (editing is optional)
    return true;
  },
  
  7: (state) => {
    // Phase 7: Skills - at least some skills must be present
    return (
      state.skills.languages.length > 0 ||
      state.skills.frameworks.length > 0 ||
      state.skills.databases.length > 0 ||
      state.skills.cloud.length > 0
    );
  },
  
  8: (state) => {
    // Phase 8: Export - always valid (can export anytime)
    return true;
  },
};

export const isPhaseValid = (phase: number, state: ResumeBuilderState): boolean => {
  const validator = phaseValidators[phase];
  return validator ? validator(state) : true;
};

export const canAdvanceToNextPhase = (state: ResumeBuilderState): boolean => {
  return isPhaseValid(state.currentPhase, state);
};

export const getPhaseTitle = (phase: number): string => {
  const titles: Record<number, string> = {
    1: 'Upload Resume',
    2: 'Education',
    3: 'Course Selection',
    4: 'Projects',
    5: 'Work Experience',
    6: 'Resume Editor',
    7: 'Skills Review',
    8: 'Export',
  };
  return titles[phase] || 'Unknown';
};

export const getPhaseDescription = (phase: number): string => {
  const descriptions: Record<number, string> = {
    1: "Upload your current resume or start from scratch",
    2: "Confirm your educational background",
    3: "Select relevant courses you've completed",
    4: "Describe projects from your coursework",
    5: "Add your work experience",
    6: "Edit and refine your resume with AI assistance",
    7: "Review and organize your skills",
    8: "Choose a template and export your resume",
  };
  return descriptions[phase] || '';
};


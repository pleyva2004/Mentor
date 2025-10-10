import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  code: string;
  name: string;
  isSignificant?: boolean;
}

export interface ProjectData {
  description: string;
  githubUrl?: string;
  technologies?: string;
}

export interface ExperienceData {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  leadership?: string;
}

export interface ResumeSection {
  id: string;
  type: 'header' | 'experience' | 'education' | 'skills' | 'summary';
  title: string;
  content: Record<string, unknown>;
}

export interface EducationData {
  school: string;
  major: string;
  degreeType: string;
  gradYear: string;
}

export interface SkillsData {
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloud: string[];
}

export interface ResumeBuilderState {
  // Phase control
  currentPhase: number;
  completedPhases: Set<number>;
  
  // Data from each phase
  uploadedFile: File | null;
  resumeId: string | null;
  education: EducationData;
  selectedCourses: Course[];
  projects: Map<string, ProjectData>;
  workExperiences: ExperienceData[];
  sections: ResumeSection[];
  skills: SkillsData;
  exportConfig: {
    template: 'modern' | 'classic' | 'ats';
  };
  
  // Actions
  setPhase: (phase: number) => void;
  completePhase: (phase: number) => void;
  setUploadedFile: (file: File | null) => void;
  setResumeId: (id: string | null) => void;
  updateEducation: (data: Partial<EducationData>) => void;
  setSelectedCourses: (courses: Course[]) => void;
  toggleCourseSelection: (course: Course) => void;
  toggleCourseSignificance: (courseCode: string) => void;
  setProject: (courseCode: string, project: ProjectData) => void;
  addWorkExperience: (experience: ExperienceData) => void;
  updateWorkExperience: (index: number, experience: ExperienceData) => void;
  removeWorkExperience: (index: number) => void;
  setSections: (sections: ResumeSection[]) => void;
  updateSection: (sectionId: string, content: Record<string, unknown>) => void;
  updateSkills: (skills: Partial<SkillsData>) => void;
  addSkill: (category: keyof SkillsData, skill: string) => void;
  removeSkill: (category: keyof SkillsData, skill: string) => void;
  setExportTemplate: (template: 'modern' | 'classic' | 'ats') => void;
  resetStore: () => void;
}

const initialState = {
  currentPhase: 1,
  completedPhases: new Set<number>(),
  uploadedFile: null,
  resumeId: null,
  education: {
    school: '',
    major: '',
    degreeType: '',
    gradYear: '',
  },
  selectedCourses: [],
  projects: new Map<string, ProjectData>(),
  workExperiences: [],
  sections: [],
  skills: {
    languages: [],
    frameworks: [],
    databases: [],
    cloud: [],
  },
  exportConfig: {
    template: 'modern' as const,
  },
};

export const useResumeBuilderStore = create<ResumeBuilderState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setPhase: (phase) => set({ currentPhase: phase }),
      
      completePhase: (phase) =>
        set((state) => ({
          completedPhases: new Set(state.completedPhases).add(phase),
        })),
      
      setUploadedFile: (file) => set({ uploadedFile: file }),
      
      setResumeId: (id) => set({ resumeId: id }),
      
      updateEducation: (data) =>
        set((state) => ({
          education: { ...state.education, ...data },
        })),
      
      setSelectedCourses: (courses) => set({ selectedCourses: courses }),
      
      toggleCourseSelection: (course) =>
        set((state) => {
          const isSelected = state.selectedCourses.some((c) => c.id === course.id);
          if (isSelected) {
            return {
              selectedCourses: state.selectedCourses.filter((c) => c.id !== course.id),
            };
          } else {
            return {
              selectedCourses: [...state.selectedCourses, course],
            };
          }
        }),
      
      toggleCourseSignificance: (courseCode) =>
        set((state) => ({
          selectedCourses: state.selectedCourses.map((c) =>
            c.code === courseCode ? { ...c, isSignificant: !c.isSignificant } : c
          ),
        })),
      
      setProject: (courseCode, project) =>
        set((state) => {
          const newProjects = new Map(state.projects);
          newProjects.set(courseCode, project);
          return { projects: newProjects };
        }),
      
      addWorkExperience: (experience) =>
        set((state) => ({
          workExperiences: [...state.workExperiences, experience],
        })),
      
      updateWorkExperience: (index, experience) =>
        set((state) => ({
          workExperiences: state.workExperiences.map((exp, i) =>
            i === index ? experience : exp
          ),
        })),
      
      removeWorkExperience: (index) =>
        set((state) => ({
          workExperiences: state.workExperiences.filter((_, i) => i !== index),
        })),
      
      setSections: (sections) => set({ sections }),
      
      updateSection: (sectionId, content) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId ? { ...section, content } : section
          ),
        })),
      
      updateSkills: (skills) =>
        set((state) => ({
          skills: { ...state.skills, ...skills },
        })),
      
      addSkill: (category, skill) =>
        set((state) => ({
          skills: {
            ...state.skills,
            [category]: [...state.skills[category], skill],
          },
        })),
      
      removeSkill: (category, skill) =>
        set((state) => ({
          skills: {
            ...state.skills,
            [category]: state.skills[category].filter((s) => s !== skill),
          },
        })),
      
      setExportTemplate: (template) =>
        set({ exportConfig: { template } }),
      
      resetStore: () => set(initialState),
    }),
    {
      name: 'resume-builder-storage',
      // Custom serialization for Map and Set
      partialize: (state) => ({
        ...state,
        projects: Array.from(state.projects.entries()),
        completedPhases: Array.from(state.completedPhases),
        uploadedFile: null, // Don't persist File objects
      }),
      // Custom deserialization
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        projects: new Map(persistedState.projects || []),
        completedPhases: new Set(persistedState.completedPhases || []),
      }),
    }
  )
);


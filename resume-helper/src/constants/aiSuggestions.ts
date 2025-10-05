/**
 * AI suggestions data for different resume sections
 */

import type { AISuggestion, ResumeSection } from '../types';

export const aiSuggestionsBySection: Record<ResumeSection, AISuggestion[]> = {
  header: [
    {
      id: 'header-1',
      type: 'improve-phrasing',
      title: 'Professional Links',
      description: 'Ensure your LinkedIn and GitHub profiles are up-to-date and professional.',
      action: () => console.log('Improving header links...'),
    },
    {
      id: 'header-2',
      type: 'grammar-check',
      title: 'Email Format',
      description: 'Use a professional email address, preferably yourname@domain.com.',
      action: () => console.log('Checking email format...'),
    },
  ],
  summary: [
    {
      id: 'summary-1',
      type: 'improve-phrasing',
      title: 'Action Verbs',
      description: 'Use strong action verbs to start your sentences. Instead of "Responsible for developing...", try "Developed...".',
      action: () => console.log('Improving summary phrasing...'),
    },
    {
      id: 'summary-2',
      type: 'quantify-achievement',
      title: 'Quantify Impact',
      description: 'Quantify your achievements. How many users did your feature impact? By what percentage did you improve performance?',
      action: () => console.log('Adding quantified achievements...'),
    },
  ],
  skills: [
    {
      id: 'skills-1',
      type: 'improve-phrasing',
      title: 'Soft Skills',
      description: 'Consider creating a sub-section for Soft Skills like Agile Methodologies, Team Leadership, or Problem-Solving.',
      action: () => console.log('Adding soft skills...'),
    },
    {
      id: 'skills-2',
      type: 'grammar-check',
      title: 'Relevance Check',
      description: 'Ensure the skills listed here are relevant to the job description you are targeting.',
      action: () => console.log('Checking skill relevance...'),
    },
  ],
  experience: [
    {
      id: 'experience-1',
      type: 'add-action-verb',
      title: 'Power Verbs',
      description: 'Start each bullet point with a powerful action verb (e.g., "Engineered," "Architected," "Implemented," "Optimized").',
      action: () => console.log('Adding action verbs...'),
    },
    {
      id: 'experience-2',
      type: 'quantify-achievement',
      title: 'Example Quantification',
      description: 'Example: "Optimized database queries, resulting in a 30% reduction in page load times."',
      action: () => console.log('Adding quantified examples...'),
    },
  ],
  education: [
    {
      id: 'education-1',
      type: 'improve-phrasing',
      title: 'Section Order',
      description: 'If you have significant work experience, you can move the Education section below Experience.',
      action: () => console.log('Reordering education section...'),
    },
    {
      id: 'education-2',
      type: 'grammar-check',
      title: 'GPA Inclusion',
      description: 'Include your GPA only if it is high (e.g., 3.5 or above).',
      action: () => console.log('Checking GPA inclusion...'),
    },
  ],
};

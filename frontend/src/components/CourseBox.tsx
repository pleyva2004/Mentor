import React from 'react';

interface CourseBoxProps {
  courseName: string;
  courseCode?: string;
  isSelected: boolean;
  onToggle: () => void;
}

export default function CourseBox({ courseName, courseCode, isSelected, onToggle }: CourseBoxProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        group relative rounded-lg p-4 border-2 transition-all duration-300
        hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]
        ${isSelected
          ? 'bg-primary/10 border-primary text-primary-foreground shadow-md'
          : 'bg-card border-border text-card-foreground hover:border-primary/50'
        }
      `}
    >
      <div className="text-left">
        {courseCode && (
          <div className="font-semibold text-sm mb-1.5 text-foreground/90">
            {courseCode}
          </div>
        )}
        <div className={`text-sm leading-relaxed ${courseCode ? '' : 'font-semibold'}`}>
          {courseName}
        </div>
      </div>
      <div className={`mt-3 flex justify-end transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`}>
        <div className={`rounded-full p-1 ${isSelected ? 'bg-primary' : 'bg-muted'}`}>
          <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        </div>
      </div>
    </button>
  );
}

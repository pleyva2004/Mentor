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
        rounded-lg p-4 border-2 transition-all duration-200
        hover:shadow-md active:scale-95
        ${isSelected
          ? 'bg-blue-100 border-blue-500 text-blue-900'
          : 'bg-white border-gray-300 text-gray-800 hover:border-gray-400'
        }
      `}
    >
      <div className="text-left">
        {courseCode && (
          <div className="font-semibold text-sm mb-1">
            {courseCode}
          </div>
        )}
        <div className={`text-sm ${courseCode ? '' : 'font-semibold'}`}>
          {courseName}
        </div>
      </div>
      {isSelected && (
        <div className="mt-2 flex justify-end">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        </div>
      )}
    </button>
  );
}

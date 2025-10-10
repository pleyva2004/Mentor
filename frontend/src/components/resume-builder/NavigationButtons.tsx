'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface NavigationButtonsProps {
  currentPhase: number;
  totalPhases: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  nextButtonText?: string;
}

export function NavigationButtons({
  currentPhase,
  totalPhases,
  onBack,
  onNext,
  isNextDisabled = false,
  isLoading = false,
  nextButtonText,
}: NavigationButtonsProps) {
  const isFirstPhase = currentPhase === 1;
  const isLastPhase = currentPhase === totalPhases;
  
  const defaultNextText = isLastPhase ? 'Finish' : 'Next';
  const buttonText = nextButtonText || defaultNextText;
  
  return (
    <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={isFirstPhase || isLoading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
          transition-all duration-200
          ${isFirstPhase
            ? 'bg-transparent text-muted-foreground cursor-not-allowed'
            : 'bg-transparent border border-border text-foreground hover:bg-muted'
          }
        `}
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>
      
      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={isNextDisabled || isLoading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
          transition-all duration-200
          ${isNextDisabled || isLoading
            ? 'bg-disabled text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {buttonText}
            {!isLastPhase && <ChevronRight className="w-5 h-5" />}
          </>
        )}
      </button>
    </div>
  );
}


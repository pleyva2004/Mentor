'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { getPhaseTitle } from '@/lib/validation';

interface StepperProps {
  currentPhase: number;
  totalPhases?: number;
  completedPhases: Set<number>;
}

export function Stepper({ currentPhase, totalPhases = 8, completedPhases }: StepperProps) {
  const steps = Array.from({ length: totalPhases }, (_, i) => i + 1);
  
  // Calculate progress percentage for the progress bar
  const progressPercentage = ((currentPhase - 1) / (totalPhases - 1)) * 100;
  
  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
        
        {/* Animated progress bar */}
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-primary -z-10"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
        
        {/* Steps */}
        <div className="flex justify-between items-start">
          {steps.map((step) => {
            const isActive = step === currentPhase;
            const isCompleted = completedPhases.has(step) || step < currentPhase;
            
            return (
              <div
                key={step}
                className="flex flex-col items-center w-1/8 relative bg-background px-2"
              >
                {/* Step circle */}
                <motion.div
                  className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${isActive 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border bg-card text-muted-foreground'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step}</span>
                  )}
                </motion.div>
                
                {/* Step label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center
                    transition-colors duration-300
                    ${isActive 
                      ? 'text-primary' 
                      : isCompleted 
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }
                  `}
                >
                  {getPhaseTitle(step)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


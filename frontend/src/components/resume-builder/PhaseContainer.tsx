'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { phaseTransition } from '@/lib/animations';
import { getPhaseDescription } from '@/lib/validation';

interface PhaseContainerProps {
  phase: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function PhaseContainer({ phase, title, description, children }: PhaseContainerProps) {
  const phaseDescription = description || getPhaseDescription(phase);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        variants={phaseTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="bg-card rounded-xl shadow-lg border border-border p-6 sm:p-8"
      >
        {/* Phase Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {title}
          </h2>
          {phaseDescription && (
            <p className="text-muted-foreground">{phaseDescription}</p>
          )}
        </div>
        
        {/* Phase Content */}
        <div className="phase-content">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


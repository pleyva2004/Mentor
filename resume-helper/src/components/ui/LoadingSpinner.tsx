/**
 * Loading spinner component
 */

import React from 'react';
import type { LoadingSpinnerProps } from '@/types';
import { cn } from '@/lib/utils';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-4 border-gray-200 border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
};

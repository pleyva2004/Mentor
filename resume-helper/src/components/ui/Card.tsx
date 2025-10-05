/**
 * Reusable Card component
 */

import React from 'react';
import type { CardProps } from '@/types';
import { cn } from '@/lib/utils';

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-card-background rounded-xl shadow-default',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

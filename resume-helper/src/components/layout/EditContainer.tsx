/**
 * Edit container component with resume panel and AI helper
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface EditContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const EditContainer: React.FC<EditContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex gap-8 transition-all duration-500 ease-smooth',
        {
          'flex-col lg:flex-row': true,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

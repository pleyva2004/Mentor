/**
 * Screen container component for different app screens
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  className,
}) => {
  return (
    <main
      className={cn(
        'flex-grow px-8 py-8 flex justify-center items-start',
        className
      )}
    >
      <div className="w-full max-w-6xl">
        {children}
      </div>
    </main>
  );
};

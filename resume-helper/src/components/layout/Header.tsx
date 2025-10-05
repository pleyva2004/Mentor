/**
 * Application header component
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn('', className)}>
      <div className="logo">ResumeHelper MVP</div>
      <nav>
        {/* Navigation items can be added here */}
      </nav>
    </header>
  );
};

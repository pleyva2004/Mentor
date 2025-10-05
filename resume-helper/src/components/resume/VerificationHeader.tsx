/**
 * Verification header component for the edit screen
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface VerificationHeaderProps {
  className?: string;
}

export const VerificationHeader: React.FC<VerificationHeaderProps> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        'verification-header',
        className
      )}
    >
      <h2>Step 2: Verify Your Information</h2>
      <p>
        We've extracted the following from your documents. Please review, edit, and confirm each section. 
        You can also drag and drop sections to reorder them.
      </p>
    </div>
  );
};

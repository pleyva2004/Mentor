/**
 * Reusable Button component
 */

import React from 'react';
import type { ButtonProps } from '../../types';
import { cn } from '../../lib/utils';

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none',
    secondary: 'bg-transparent border border-border-color text-text-secondary hover:bg-gray-50 hover:text-text-primary',
    outline: 'bg-transparent border border-primary text-primary hover:bg-indigo-50',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

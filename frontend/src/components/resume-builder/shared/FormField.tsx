'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name?: string;
  type?: 'text' | 'select' | 'month' | 'textarea' | 'url' | 'email';
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: string[] | { value: string; label: string }[];
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  required = false,
  error,
  options,
  disabled = false,
  rows = 3,
  className = '',
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };
  
  const inputClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    ${error 
      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
    }
    ${disabled ? 'bg-muted cursor-not-allowed' : 'bg-card'}
    text-foreground placeholder:text-muted-foreground
    focus:outline-none
  `;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      
      {type === 'select' && options ? (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
        >
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
          {options.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={`${inputClasses} resize-vertical`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
        />
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-error">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  value: string;
  isEditMode: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (value: string) => void;
}

export function EditableText({ value, isEditMode, className = '', onClick, onChange }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.stopPropagation();
      setIsEditing(true);
      onClick?.(e);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onChange && localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  const baseClasses = `${className} ${
    isEditMode ? 'cursor-text hover:bg-primary/5 hover:outline hover:outline-2 hover:outline-primary/30 rounded px-1 transition-all' : ''
  }`;

  if (isEditing) {
    const isMultiline = localValue.length > 60;
    
    if (isMultiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${baseClasses} w-full bg-background border-2 border-primary rounded p-1 resize-none`}
          rows={3}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${baseClasses} bg-background border-2 border-primary rounded p-1`}
      />
    );
  }

  return (
    <span onClick={handleClick} className={baseClasses}>
      {value}
    </span>
  );
}

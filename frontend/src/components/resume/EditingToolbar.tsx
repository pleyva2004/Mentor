'use client';

import React from 'react';
import { Sparkles, CheckCircle, Type, X } from 'lucide-react';

interface EditingToolbarProps {
  position: { x: number; y: number };
  onRephrase: () => void;
  onClose: () => void;
}

export function EditingToolbar({ position, onRephrase, onClose }: EditingToolbarProps) {
  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl p-2 flex items-center gap-1 animate-scale-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <button
        onClick={onRephrase}
        className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 text-primary rounded transition-colors text-sm font-medium"
        title="Rephrase with AI"
      >
        <Sparkles className="w-4 h-4" />
        <span>Improve Phrasing</span>
      </button>

      <div className="w-px h-6 bg-border" />

      <button
        className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded transition-colors text-sm text-muted-foreground"
        title="Check Grammar"
      >
        <CheckCircle className="w-4 h-4" />
        <span>Grammar</span>
      </button>

      <button
        className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded transition-colors text-sm text-muted-foreground"
        title="Add Action Verb"
      >
        <Type className="w-4 h-4" />
        <span>Action Verb</span>
      </button>

      <div className="w-px h-6 bg-border" />

      <button
        onClick={onClose}
        className="p-2 hover:bg-muted rounded transition-colors"
        title="Close toolbar"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

/**
 * Individual resume block component with drag and drop functionality
 */

'use client';

import React from 'react';
import type { ResumeBlock as ResumeBlockType } from '@/types';
import { cn } from '@/lib/utils';

interface ResumeBlockProps {
  block: ResumeBlockType;
  index: number;
  isDragging?: boolean;
  onConfirm: (section: string) => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onClick: (section: string) => void;
}

export const ResumeBlock: React.FC<ResumeBlockProps> = ({
  block,
  index,
  isDragging = false,
  onConfirm,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onClick,
}) => {
  const handleConfirm = () => {
    onConfirm(block.section);
  };

  const handleClick = () => {
    onClick(block.section);
  };

  return (
    <div
      className={cn(
        'resume-block',
        {
          'is-dragging': isDragging,
          'is-confirmed': block.isConfirmed,
        }
      )}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={handleClick}
    >
      <div className="resume-block-header">
        <h3>{block.title}</h3>
        <div className="block-actions">
          <button
            className={cn(
              'btn-confirm',
              {
                'confirmed': block.isConfirmed,
              }
            )}
            onClick={handleConfirm}
          >
            {block.isConfirmed ? '✓ Confirmed' : '✓ Confirm'}
          </button>
        </div>
      </div>
      <div
        className="resume-block-content"
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
};

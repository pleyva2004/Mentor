/**
 * Resume preview component with draggable blocks
 */

import React from 'react';
import type { ResumeData } from '../../types';
import { ResumeBlock } from './ResumeBlock';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useEditMode } from '../../hooks/useEditMode';
import { useResumeStore } from '../../stores/resumeStore';

interface ResumePreviewProps {
  className?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ className }) => {
  const { resumeData, confirmSection } = useResumeStore();
  const { handleSectionClick } = useEditMode();
  const {
    draggedIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  } = useDragAndDrop();

  // Convert resume data to array and sort by order
  const resumeBlocks = Object.values(resumeData).sort((a, b) => a.order - b.order);

  const handleConfirm = (section: string) => {
    confirmSection(section as keyof ResumeData);
  };

  return (
    <div id="resume-preview" className={className}>
      {resumeBlocks.map((block, index) => (
        <ResumeBlock
          key={block.id}
          block={block}
          index={index}
          isDragging={draggedIndex === index}
          onConfirm={handleConfirm}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={(section) => handleSectionClick(section as any)}
        />
      ))}
    </div>
  );
};

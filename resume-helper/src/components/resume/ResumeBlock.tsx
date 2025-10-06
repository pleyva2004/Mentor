/**
 * Individual resume block component with drag and drop functionality
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { ResumeBlock as ResumeBlockType } from '@/types';
import { cn } from '@/lib/utils';
import { useEditMode } from '@/hooks/useEditMode';

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
  const { activeSection, isEditing, updateCursorContent } = useEditMode();
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [editContent, setEditContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isActiveBlock = activeSection === block.section && isEditing;
  const isThisBlockActive = activeSection === block.section;

  const handleConfirm = () => {
    onConfirm(block.section);
  };

  const handleClick = () => {
    onClick(block.section);
  };

  const handleEditStart = () => {
    setIsLocalEditing(true);
    setEditContent(block.content);
    // Focus will be handled by useEffect
  };

  const handleEditSave = () => {
    // In a real implementation, this would save to the backend
    // For now, just update local state
    setIsLocalEditing(false);
    // The parent component would handle saving the content
  };

  const handleEditCancel = () => {
    setIsLocalEditing(false);
    setEditContent(block.content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditContent(newContent);

    // Update cursor position and content in the global store
    const cursorPos = e.target.selectionStart;
    updateCursorContent(cursorPos, newContent);
  };

  // Focus textarea when editing starts
  useEffect(() => {
    if (isLocalEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor to end of content
      const length = editContent.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isLocalEditing, editContent.length]);

  // Handle cursor position changes
  const handleCursorChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const cursorPos = e.currentTarget.selectionStart;
    updateCursorContent(cursorPos, editContent);
  };

  return (
    <div
      className={cn(
        'resume-block',
        {
          'is-dragging': isDragging,
          'is-confirmed': block.isConfirmed,
          'is-active': isThisBlockActive,
          'is-editing': isLocalEditing,
        }
      )}
      draggable={!isLocalEditing} // Disable dragging while editing
      onDragStart={() => onDragStart(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={isLocalEditing ? undefined : handleClick}
    >
      <div className="resume-block-header">
        <h3>{block.title}</h3>
        <div className="block-actions">
          {isActiveBlock && !isLocalEditing && (
            <button
              className="btn-edit"
              onClick={handleEditStart}
            >
              ✏️ Edit
            </button>
          )}
          {isLocalEditing && (
            <>
              <button
                className="btn-save"
                onClick={handleEditSave}
              >
                💾 Save
              </button>
              <button
                className="btn-cancel"
                onClick={handleEditCancel}
              >
                ❌ Cancel
              </button>
            </>
          )}
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

      {isLocalEditing ? (
        <div className="resume-block-edit">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={handleContentChange}
            onSelect={handleCursorChange}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            className="edit-textarea"
            placeholder={`Edit ${block.title.toLowerCase()}...`}
          />
        </div>
      ) : (
        <div
          className="resume-block-content"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      )}
    </div>
  );
};

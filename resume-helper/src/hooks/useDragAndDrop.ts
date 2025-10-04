/**
 * Custom hook for drag and drop functionality
 */

import { useCallback, useState } from 'react';
import { useResumeStore } from '../stores/resumeStore';

export function useDragAndDrop() {
  const { reorderSections } = useResumeStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      
      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        reorderSections(draggedIndex, dropIndex);
      }
      
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, reorderSections]
  );

  const getDragAfterElement = useCallback((container: HTMLElement, y: number) => {
    const draggableElements = [...container.querySelectorAll('.resume-block:not(.is-dragging)')];
    
    return draggableElements.reduce(
      (closest: { offset: number; element: Element | null }, child: Element) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }, []);

  return {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    getDragAfterElement,
  };
}

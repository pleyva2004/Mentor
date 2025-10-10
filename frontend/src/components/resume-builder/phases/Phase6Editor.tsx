'use client';

import React, { useState, useEffect } from 'react';
import { useResumeBuilderStore } from '@/stores/resumeBuilderStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ResumeSection } from '@/components/resume/ResumeSection';
import { AIHelperPanel } from '@/components/resume/AIHelperPanel';
import { Save, Loader2 } from 'lucide-react';

export function Phase6Editor() {
  const { sections, setSections, resumeId } = useResumeBuilderStore();
  const [isEditMode, setIsEditMode] = useState(true); // Always in edit mode in builder
  const [editingElement, setEditingElement] = useState<{ sectionId: string; path: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id);
      const newIndex = sections.findIndex((item) => item.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
    }
  };

  const handleSectionClick = () => {
    setIsEditMode(true);
  };

  const handleTextEdit = (sectionId: string, path: string, event: React.MouseEvent) => {
    setEditingElement({ sectionId, path });
  };

  const handleTextChange = (sectionId: string, path: string, newValue: string) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        // For HTML content, update directly
        if (path === 'html') {
          return { ...section, content: { ...section.content, html: newValue } };
        }
        
        const updatedContent = { ...section.content };
        const pathParts = path.split('.');
        
        let current: any = updatedContent;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = newValue;
        
        return { ...section, content: updatedContent };
      }
      return section;
    });
    
    setSections(updatedSections);
  };

  const handleSave = async () => {
    if (!resumeId) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Save each section to backend
      for (const section of sections) {
        if (section.content.html) {
          await fetch('http://localhost:8000/update-section', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section_id: section.id,
              content: section.content.html,
              resume_id: resumeId
            })
          });
        }
      }
      
      setSaveMessage('Changes saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving resume:', err);
      setSaveMessage('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAISuggestion = async (suggestion: string) => {
    if (editingElement) {
      handleTextChange(editingElement.sectionId, editingElement.path, suggestion);
      setEditingElement(null);
    }
  };

  if (sections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No resume sections found. Please complete the previous phases to generate your resume.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-medium">Edit your resume:</span> Drag sections to reorder them. Click on any text to edit. Use the AI Helper on the right for suggestions.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-6">
          {/* Resume Preview */}
          <div className="flex-1">
            <div className="bg-card border border-border rounded-lg p-6">
              {/* Save Button */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Your Resume</h3>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  saveMessage.includes('success') 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-error/10 text-error border border-error/20'
                }`}>
                  {saveMessage}
                </div>
              )}
              
              {/* Sections */}
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <ResumeSection
                      key={section.id}
                      section={section}
                      isEditMode={isEditMode}
                      onSectionClick={handleSectionClick}
                      onTextEdit={handleTextEdit}
                      onTextChange={handleTextChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>

          {/* AI Helper Panel */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-4">
              <AIHelperPanel
                editingElement={editingElement}
                sections={sections}
                onApplySuggestion={handleAISuggestion}
                onClose={() => setIsEditMode(false)}
              />
            </div>
          </div>
        </div>
      </DndContext>
      
      {/* Info */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
        {sections.length} sections • Drag to reorder • Click to edit
      </div>
    </div>
  );
}


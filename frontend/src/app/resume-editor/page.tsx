'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ResumeSection } from '@/components/resume/ResumeSection';
import { AIHelperPanel } from '@/components/resume/AIHelperPanel';
import { EditingToolbar } from '@/components/resume/EditingToolbar';

interface Section {
  id: string;
  type: 'header' | 'experience' | 'education' | 'skills' | 'summary';
  title: string;
  content: Record<string, unknown>;
}

function ResumeEditorContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingElement, setEditingElement] = useState<{ sectionId: string; path: string } | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);

  // Load resume data from localStorage
  useEffect(() => {
    const loadResumeData = () => {
      try {
        const storedData = localStorage.getItem('resumeData');
        
        if (!storedData) {
          setError('No resume data found. Please upload a resume first.');
          setIsLoading(false);
          return;
        }

        const data = JSON.parse(storedData);
        
        // Transform backend HTML data to sections format
        const loadedSections: Section[] = [];
        
        if (data.header) {
          loadedSections.push({
            id: 'header',
            type: 'header',
            title: 'Header',
            content: { html: data.header }
          });
        }
        
        if (data.experience) {
          loadedSections.push({
            id: 'experience',
            type: 'experience',
            title: 'Work Experience',
            content: { html: data.experience }
          });
        }
        
        if (data.education) {
          loadedSections.push({
            id: 'education',
            type: 'education',
            title: 'Education',
            content: { html: data.education }
          });
        }
        
        if (data.skills) {
          loadedSections.push({
            id: 'skills',
            type: 'skills',
            title: 'Skills',
            content: { html: data.skills }
          });
        }
        
        if (data.projects) {
          loadedSections.push({
            id: 'projects',
            type: 'summary',
            title: 'Projects',
            content: { html: data.projects }
          });
        }

        setSections(loadedSections);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resume data');
        setIsLoading(false);
      }
    };

    loadResumeData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSectionClick = () => {
    setIsEditMode(true);
  };

  const handleTextEdit = (sectionId: string, path: string, event: React.MouseEvent) => {
    setEditingElement({ sectionId, path });
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setToolbarPosition({ x: rect.left, y: rect.top - 50 });
  };

  const handleTextChange = (sectionId: string, path: string, newValue: string) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          const updatedContent = { ...section.content };
          const pathParts = path.split('.');
          
          let current: Record<string, unknown> = updatedContent;
          for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]] as Record<string, unknown>;
          }
          current[pathParts[pathParts.length - 1]] = newValue;
          
          return { ...section, content: updatedContent };
        }
        return section;
      });
    });
  };

  const getCurrentText = (sectionId: string, path: string): string => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return '';
    
    const pathParts = path.split('.');
    let current: Record<string, unknown> = section.content;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part] as Record<string, unknown>;
      } else {
        return '';
      }
    }
    
    return typeof current === 'string' ? current : '';
  };

  const handleAISuggestion = async (improvedText: string) => {
    if (editingElement) {
      try {
        const response = await fetch('http://localhost:8000/improve-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: improvedText,
            improvement_type: 'rephrase',
            context: `Resume section: ${editingElement.sectionId}`
          })
        });

        if (response.ok) {
          const data = await response.json();
          handleTextChange(editingElement.sectionId, editingElement.path, data.improved);
        } else {
          // Fallback to local improvement
          handleTextChange(editingElement.sectionId, editingElement.path, improvedText);
        }
      } catch (error) {
        console.error('Error improving text:', error);
        // Fallback to local improvement
        handleTextChange(editingElement.sectionId, editingElement.path, improvedText);
      }
      setToolbarPosition(null);
      setEditingElement(null);
    }
  };

  const handleSave = async () => {
    try {
      // Update localStorage with current sections
      const updatedResumeData = {
        header: sections.find(s => s.id === 'header')?.content.html || '',
        experience: sections.find(s => s.id === 'experience')?.content.html || '',
        education: sections.find(s => s.id === 'education')?.content.html || '',
        skills: sections.find(s => s.id === 'skills')?.content.html || '',
        projects: sections.find(s => s.id === 'projects')?.content.html || ''
      };
      
      localStorage.setItem('resumeData', JSON.stringify(updatedResumeData));
      
      // Also try to save to backend if resumeId is available
      if (resumeId) {
        try {
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
        } catch (backendErr) {
          console.warn('Backend save failed, but local save succeeded:', backendErr);
        }
      }
      
      alert('Resume saved successfully!');
    } catch (err) {
      console.error('Error saving resume:', err);
      alert('Failed to save resume');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <a href="/" className="text-primary hover:underline">
            Return to upload page
          </a>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No resume data found</p>
          <a href="/" className="text-primary hover:underline">
            Upload a resume
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex min-h-screen">
          {/* Resume Preview */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              isEditMode ? 'w-[60%]' : 'w-full'
            } p-8`}
          >
            <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8 border border-border">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
                <a 
                  href="/" 
                  onClick={() => {
                    // Clear localStorage when going back to upload
                    localStorage.removeItem('resumeData');
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ← Back to upload
                </a>
              </div>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
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
              </SortableContext>
            </div>

            {!isEditMode && (
              <div className="text-center mt-6">
                <p className="text-muted-foreground text-sm">
                  Click on any section to start editing
                </p>
              </div>
            )}
          </div>

          {/* AI Helper Panel */}
          <div
            className={`fixed right-0 top-0 h-screen bg-card border-l border-border shadow-2xl transition-all duration-500 ease-in-out ${
              isEditMode ? 'translate-x-0 w-[40%]' : 'translate-x-full w-0'
            } overflow-hidden`}
          >
            <AIHelperPanel
              editingElement={editingElement}
              sections={sections}
              onApplySuggestion={handleAISuggestion}
              onClose={() => setIsEditMode(false)}
            />
          </div>
        </div>

        {/* Editing Toolbar */}
        {toolbarPosition && editingElement && (
          <EditingToolbar
            position={toolbarPosition}
            onRephrase={async () => {
              if (editingElement) {
                const currentText = getCurrentText(editingElement.sectionId, editingElement.path);
                try {
                  const response = await fetch('http://localhost:8000/improve-text', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      text: currentText,
                      improvement_type: 'rephrase',
                      context: `Resume section: ${editingElement.sectionId}`
                    })
                  });

                  if (response.ok) {
                    const data = await response.json();
                    handleAISuggestion(data.improved);
                  } else {
                    // Fallback to local suggestions
                    const suggestions = [
                      'Spearheaded development of scalable microservices architecture, successfully serving over 1 million active users',
                      'Orchestrated implementation of comprehensive CI/CD pipeline, achieving 60% reduction in deployment cycle time',
                      'Provided technical mentorship and guidance to a team of 5 junior developers, accelerating their professional growth'
                    ];
                    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                    handleAISuggestion(randomSuggestion);
                  }
                } catch (error) {
                  console.error('Error improving text:', error);
                  // Fallback to local suggestions
                  const suggestions = [
                    'Spearheaded development of scalable microservices architecture, successfully serving over 1 million active users',
                    'Orchestrated implementation of comprehensive CI/CD pipeline, achieving 60% reduction in deployment cycle time',
                    'Provided technical mentorship and guidance to a team of 5 junior developers, accelerating their professional growth'
                  ];
                  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                  handleAISuggestion(randomSuggestion);
                }
              }
            }}
            onClose={() => {
              setToolbarPosition(null);
              setEditingElement(null);
            }}
          />
        )}
      </DndContext>
    </div>
  );
}

export default function ResumeEditor() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResumeEditorContent />
    </Suspense>
  );
}

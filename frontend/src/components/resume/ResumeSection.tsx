'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { EditableText } from './EditableText';

interface ResumeSectionProps {
  section: {
    id: string;
    type: string;
    title: string;
    content: Record<string, unknown>;
  };
  isEditMode: boolean;
  onSectionClick: (sectionId: string) => void;
  onTextEdit: (sectionId: string, path: string, event: React.MouseEvent) => void;
  onTextChange: (sectionId: string, path: string, newValue: string) => void;
}

export function ResumeSection({
  section,
  isEditMode,
  onSectionClick,
  onTextEdit,
  onTextChange
}: ResumeSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderContent = () => {
    // Handle HTML content from backend
    if (section.content.html && typeof section.content.html === 'string') {
      return (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: section.content.html }}
        />
      );
    }
    
    switch (section.type) {
      case 'header':
        return (
          <div className="text-center pb-6 border-b border-border">
            <EditableText
              value={section.content.name as string}
              isEditMode={isEditMode}
              className="text-4xl font-bold text-foreground mb-2"
              onClick={(e) => onTextEdit(section.id, 'name', e)}
              onChange={(value) => onTextChange(section.id, 'name', value)}
            />
            <EditableText
              value={section.content.title as string}
              isEditMode={isEditMode}
              className="text-xl text-muted-foreground mb-4"
              onClick={(e) => onTextEdit(section.id, 'title', e)}
              onChange={(value) => onTextChange(section.id, 'title', value)}
            />
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <EditableText
                value={section.content.email as string}
                isEditMode={isEditMode}
                onClick={(e) => onTextEdit(section.id, 'email', e)}
                onChange={(value) => onTextChange(section.id, 'email', value)}
              />
              <span>•</span>
              <EditableText
                value={section.content.phone as string}
                isEditMode={isEditMode}
                onClick={(e) => onTextEdit(section.id, 'phone', e)}
                onChange={(value) => onTextChange(section.id, 'phone', value)}
              />
              <span>•</span>
              <EditableText
                value={section.content.location as string}
                isEditMode={isEditMode}
                onClick={(e) => onTextEdit(section.id, 'location', e)}
                onChange={(value) => onTextChange(section.id, 'location', value)}
              />
            </div>
          </div>
        );

      case 'summary':
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{section.title}</h2>
            <EditableText
              value={section.content.text as string}
              isEditMode={isEditMode}
              className="text-muted-foreground leading-relaxed"
              onClick={(e) => onTextEdit(section.id, 'text', e)}
              onChange={(value) => onTextChange(section.id, 'text', value)}
            />
          </div>
        );

      case 'experience':
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">{section.title}</h2>
            {(section.content.items as Record<string, unknown>[]).map((item: Record<string, unknown>, idx: number) => (
              <div key={item.id as string} className="mb-6 last:mb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <EditableText
                      value={item.jobTitle as string}
                      isEditMode={isEditMode}
                      className="text-lg font-semibold text-foreground"
                      onClick={(e) => onTextEdit(section.id, `items.${idx}.jobTitle`, e)}
                      onChange={(value) => onTextChange(section.id, `items.${idx}.jobTitle`, value)}
                    />
                    <EditableText
                      value={item.company as string}
                      isEditMode={isEditMode}
                      className="text-base text-muted-foreground"
                      onClick={(e) => onTextEdit(section.id, `items.${idx}.company`, e)}
                      onChange={(value) => onTextChange(section.id, `items.${idx}.company`, value)}
                    />
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <EditableText
                      value={item.location as string}
                      isEditMode={isEditMode}
                      onClick={(e) => onTextEdit(section.id, `items.${idx}.location`, e)}
                      onChange={(value) => onTextChange(section.id, `items.${idx}.location`, value)}
                    />
                    <div>
                      <EditableText
                        value={item.dateRange as string}
                        isEditMode={isEditMode}
                        onClick={(e) => onTextEdit(section.id, `items.${idx}.dateRange`, e)}
                        onChange={(value) => onTextChange(section.id, `items.${idx}.dateRange`, value)}
                      />
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {(item.bullets as string[]).map((bullet: string, bulletIdx: number) => (
                    <li key={bulletIdx} className="ml-2">
                      <EditableText
                        value={bullet}
                        isEditMode={isEditMode}
                        className="inline"
                        onClick={(e) => onTextEdit(section.id, `items.${idx}.bullets.${bulletIdx}`, e)}
                        onChange={(value) => onTextChange(section.id, `items.${idx}.bullets.${bulletIdx}`, value)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'education':
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">{section.title}</h2>
            {(section.content.items as Record<string, unknown>[]).map((item: Record<string, unknown>, idx: number) => (
              <div key={item.id as string} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <EditableText
                      value={item.degree as string}
                      isEditMode={isEditMode}
                      className="text-lg font-semibold text-foreground"
                      onClick={(e) => onTextEdit(section.id, `items.${idx}.degree`, e)}
                      onChange={(value) => onTextChange(section.id, `items.${idx}.degree`, value)}
                    />
                    <EditableText
                      value={item.school as string}
                      isEditMode={isEditMode}
                      className="text-base text-muted-foreground"
                      onClick={(e) => onTextEdit(section.id, `items.${idx}.school`, e)}
                      onChange={(value) => onTextChange(section.id, `items.${idx}.school`, value)}
                    />
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <EditableText
                      value={item.location as string}
                      isEditMode={isEditMode}
                      onClick={(e) => onTextEdit(section.id, `items.${idx}.location`, e)}
                      onChange={(value) => onTextChange(section.id, `items.${idx}.location`, value)}
                    />
                    <div>
                      <EditableText
                        value={item.dateRange as string}
                        isEditMode={isEditMode}
                        onClick={(e) => onTextEdit(section.id, `items.${idx}.dateRange`, e)}
                        onChange={(value) => onTextChange(section.id, `items.${idx}.dateRange`, value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{section.title}</h2>
            <div className="flex flex-wrap gap-2">
              {(section.content.items as string[]).map((skill: string, idx: number) => (
                <EditableText
                  key={idx}
                  value={skill}
                  isEditMode={isEditMode}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  onClick={(e) => onTextEdit(section.id, `items.${idx}`, e)}
                  onChange={(value) => onTextChange(section.id, `items.${idx}`, value)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-6 last:mb-0 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105' : ''
      } ${!isEditMode ? 'hover:bg-muted/30 hover:shadow-md rounded-lg' : ''}`}
      onClick={() => !isEditMode && onSectionClick(section.id)}
    >
      {!isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      
      <div className={`${!isEditMode ? 'pl-8' : ''} py-4`}>
        {renderContent()}
      </div>

      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

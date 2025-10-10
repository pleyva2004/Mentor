'use client';

import React from 'react';
import { X, Lightbulb, Sparkles, Target, TrendingUp } from 'lucide-react';

interface AIHelperPanelProps {
  editingElement: { sectionId: string; path: string } | null;
  sections: Array<{id: string; type: string; content: Record<string, unknown>}>;
  onApplySuggestion: (suggestion: string) => void;
  onClose: () => void;
}

export function AIHelperPanel({ editingElement, sections, onApplySuggestion, onClose }: AIHelperPanelProps) {
  const getContextualTips = () => {
    if (!editingElement) {
      return {
        title: 'Welcome to AI Resume Helper',
        tips: [
          'Click on any text in your resume to start editing',
          'Use drag handles to reorder sections',
          'AI suggestions will appear here when you edit'
        ]
      };
    }

    const section = sections.find(s => s.id === editingElement.sectionId);
    
    if (section?.type === 'experience' && editingElement.path.includes('bullets')) {
      return {
        title: 'Enhancing Work Experience',
        tips: [
          'Quantify your achievements with numbers to show impact',
          'Start with strong action verbs like "Orchestrated", "Spearheaded", or "Implemented"',
          'Focus on results and outcomes rather than just responsibilities',
          'Use the STAR method: Situation, Task, Action, Result'
        ],
        suggestions: [
          'Spearheaded development of scalable microservices architecture, successfully serving over 1 million active users',
          'Orchestrated implementation of comprehensive CI/CD pipeline, achieving 60% reduction in deployment cycle time',
          'Cultivated technical excellence by mentoring 5 junior developers, accelerating their professional growth and productivity'
        ]
      };
    }

    if (section?.type === 'summary') {
      return {
        title: 'Crafting Your Summary',
        tips: [
          'Keep it concise - 2-3 sentences max',
          'Highlight your most relevant skills and experience',
          'Tailor it to the job you\'re applying for',
          'Include measurable achievements when possible'
        ],
        suggestions: [
          'Results-driven software engineer with 5+ years of expertise in full-stack development, specializing in building scalable React and Node.js applications that serve millions of users.',
          'Innovative full-stack developer combining deep technical expertise with proven leadership skills, having successfully delivered 20+ enterprise-level projects while mentoring cross-functional teams.'
        ]
      };
    }

    if (section?.type === 'skills') {
      return {
        title: 'Optimizing Skills Section',
        tips: [
          'Group skills by category (e.g., Languages, Frameworks, Tools)',
          'List most relevant skills first',
          'Be honest - only include skills you can discuss confidently',
          'Consider adding proficiency levels'
        ]
      };
    }

    return {
      title: 'Editing Tips',
      tips: [
        'Be specific and concrete in your descriptions',
        'Use professional language throughout',
        'Maintain consistent formatting and tense',
        'Proofread for grammar and spelling'
      ]
    };
  };

  const contextualContent = getContextualTips();

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">AI Helper</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Close AI Helper"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Current Context */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">{contextualContent.title}</h3>
              <p className="text-sm text-muted-foreground">
                {editingElement 
                  ? 'Click on suggestions below to instantly improve your content'
                  : 'Start editing to see AI-powered suggestions'}
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Tips</h3>
          </div>
          <ul className="space-y-2">
            {contextualContent.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Suggestions */}
        {contextualContent.suggestions && contextualContent.suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">AI Suggestions</h3>
            </div>
            <div className="space-y-3">
              {contextualContent.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onApplySuggestion(suggestion)}
                  className="w-full text-left p-4 bg-muted/50 hover:bg-muted border border-border rounded-lg transition-all hover:shadow-md group"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pro Tip */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Pro Tip:</span> The most impactful resumes focus on quantifiable achievements rather than job duties. Always ask yourself: &quot;What was the measurable outcome of my work?&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

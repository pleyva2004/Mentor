"""
Cursor Prompting Service for Resume Helper

This module provides real-time, context-aware suggestions for resume editing
based on cursor position and current content.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import json
import re
from provider import get_llm_provider


@dataclass
class CursorContext:
    """Context information for cursor prompting"""
    active_section: str  # header, summary, skills, experience, education
    cursor_position: int  # Character position in the text
    current_content: str  # Current content of the section
    resume_context: Dict[str, Any]  # Other resume sections for context
    user_intent: Optional[str] = None  # What the user seems to be trying to do


@dataclass
class PromptSuggestion:
    """A suggestion generated for the user"""
    id: str
    type: str  # improvement, completion, grammar, style, content
    title: str
    description: str
    suggested_text: str
    confidence: float  # 0-1 score of how confident we are in this suggestion
    reasoning: str  # Why this suggestion is relevant


class CursorPromptingService:
    """Service for generating contextual cursor-based suggestions"""

    def __init__(self, llm_provider: str = "anthropic"):
        self.llm_provider = get_llm_provider(llm_provider)
        self.max_tokens = 1500

    def analyze_context(self, context: CursorContext) -> List[PromptSuggestion]:
        """
        Analyze the cursor context and generate relevant suggestions

        Args:
            context: The current editing context

        Returns:
            List of suggestions ordered by relevance
        """
        suggestions = []

        # Get section-specific suggestions
        section_suggestions = self._get_section_specific_suggestions(context)
        suggestions.extend(section_suggestions)

        # Get content-based suggestions
        content_suggestions = self._get_content_based_suggestions(context)
        suggestions.extend(content_suggestions)

        # Get grammar/style suggestions
        style_suggestions = self._get_style_suggestions(context)
        suggestions.extend(style_suggestions)

        # Sort by confidence and return top suggestions
        suggestions.sort(key=lambda x: x.confidence, reverse=True)
        return suggestions[:5]  # Return top 5 suggestions

    def _get_section_specific_suggestions(self, context: CursorContext) -> List[PromptSuggestion]:
        """Get suggestions specific to the active section"""
        suggestions = []

        section = context.active_section.lower()

        if section == "header":
            suggestions.extend(self._get_header_suggestions(context))
        elif section == "summary":
            suggestions.extend(self._get_summary_suggestions(context))
        elif section == "skills":
            suggestions.extend(self._get_skills_suggestions(context))
        elif section == "experience":
            suggestions.extend(self._get_experience_suggestions(context))
        elif section == "education":
            suggestions.extend(self._get_education_suggestions(context))

        return suggestions

    def _get_header_suggestions(self, context: CursorContext) -> List[PromptSuggestion]:
        """Generate suggestions for header section"""
        suggestions = []

        content = context.current_content.lower()

        # Check for missing elements
        if "linkedin" not in content and "github" not in content:
            suggestions.append(PromptSuggestion(
                id="header-links",
                type="improvement",
                title="Add Professional Links",
                description="Include LinkedIn and GitHub profiles to showcase your professional presence",
                suggested_text=" | LinkedIn: [linkedin.com/in/yourprofile] | GitHub: [github.com/yourusername]",
                confidence=0.8,
                reasoning="Professional links are missing from header"
            ))

        if "@" not in content or not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content):
            suggestions.append(PromptSuggestion(
                id="header-email",
                type="improvement",
                title="Add Professional Email",
                description="Use a professional email address format",
                suggested_text=" | [your.name@professional-domain.com]",
                confidence=0.7,
                reasoning="No professional email format detected"
            ))

        return suggestions

    def _get_summary_suggestions(self, context: CursorContext) -> List[PromptSuggestion]:
        """Generate suggestions for summary section"""
        suggestions = []

        content = context.current_content

        # Check for action verbs
        action_verbs = ["developed", "created", "implemented", "designed", "managed", "led", "built", "engineered"]
        has_action_verbs = any(verb in content.lower() for verb in action_verbs)

        if not has_action_verbs and len(content.split()) > 10:
            suggestions.append(PromptSuggestion(
                id="summary-action-verbs",
                type="style",
                title="Use Action Verbs",
                description="Start sentences with strong action verbs to make your summary more impactful",
                suggested_text="Developed and implemented...",
                confidence=0.8,
                reasoning="Summary lacks strong action verbs"
            ))

        # Check for quantifiable achievements
        has_numbers = bool(re.search(r'\d+%|\d+\s*(?:%|users|projects|clients|increase|decrease|improvement)', content))

        if not has_numbers and len(content.split()) > 15:
            suggestions.append(PromptSuggestion(
                id="summary-quantify",
                type="improvement",
                title="Add Quantified Achievements",
                description="Include specific metrics to demonstrate impact",
                suggested_text=" resulting in 30% improvement in performance",
                confidence=0.7,
                reasoning="Summary lacks quantifiable achievements"
            ))

        return suggestions

    def _get_skills_suggestions(self, context: CursorContext) -> List[PromptSuggestion]:
        """Generate suggestions for skills section"""
        suggestions = []

        content = context.current_content

        # Check for soft skills section
        soft_skills = ["leadership", "communication", "teamwork", "problem-solving", "agile", "scrum"]
        has_soft_skills = any(skill in content.lower() for skill in soft_skills)

        if not has_soft_skills:
            suggestions.append(PromptSuggestion(
                id="skills-soft-skills",
                type="improvement",
                title="Add Soft Skills",
                description="Include relevant soft skills that complement your technical abilities",
                suggested_text="Team Leadership, Problem Solving, Agile Methodologies",
                confidence=0.6,
                reasoning="Technical skills present but no soft skills mentioned"
            ))

        # Check for trending technologies
        trending_tech = ["ai", "machine learning", "cloud", "aws", "docker", "kubernetes", "react", "typescript"]
        has_trending = any(tech in content.lower() for tech in trending_tech)

        if not has_trending and len(content.split(",")) > 3:
            suggestions.append(PromptSuggestion(
                id="skills-modern-tech",
                type="improvement",
                title="Include Modern Technologies",
                description="Add in-demand technologies relevant to your field",
                suggested_text="React, TypeScript, AWS, Docker",
                confidence=0.5,
                reasoning="Consider adding modern, in-demand technologies"
            ))

        return suggestions

    def _get_experience_suggestions(self, context: CursorContext) -> List[PromptSuggestion]:
        """Generate suggestions for experience section"""
        suggestions = []

        content = context.current_content

        # Check for quantified achievements
        has_quantified = bool(re.search(r'\d+%|\d+\s*(?:%|users|projects|clients|revenue|cost|time|efficiency)', content.lower()))

        if not has_quantified:
            suggestions.append(PromptSuggestion(
                id="experience-quantify",
                type="improvement",
                title="Quantify Achievements",
                description="Add specific metrics to demonstrate impact and results",
                suggested_text=" resulting in 40% increase in user engagement",
                confidence=0.9,
                reasoning="Experience bullets lack quantified achievements"
            ))

        # Check for action verbs
        action_verbs = ["developed", "created", "implemented", "designed", "managed", "led", "built", "engineered", "optimized"]
        has_action_verbs = any(verb in content.lower() for verb in action_verbs)

        if not has_action_verbs:
            suggestions.append(PromptSuggestion(
                id="experience-action-verbs",
                type="style",
                title="Use Strong Action Verbs",
                description="Start bullet points with powerful action verbs",
                suggested_text="Engineered, Architected, Implemented, Optimized",
                confidence=0.8,
                reasoning="Experience section lacks strong action verbs"
            ))

        return suggestions

    def _get_education_suggestions(self, context: CursorContext) -> List[PromptSuggestion]:
        """Generate suggestions for education section"""
        suggestions = []

        content = context.current_content

        # Check for relevant coursework
        has_coursework = "coursework" in content.lower() or "relevant" in content.lower()

        if not has_coursework:
            suggestions.append(PromptSuggestion(
                id="education-coursework",
                type="improvement",
                title="Add Relevant Coursework",
                description="Highlight courses that demonstrate relevant skills for the position",
                suggested_text="Relevant Coursework: Data Structures, Algorithms, Machine Learning",
                confidence=0.7,
                reasoning="Education section lacks relevant coursework mention"
            ))

        # Check for GPA if recent graduate
        words = content.split()
        graduation_year = None
        current_year = 2025  # Update this dynamically

        for word in words:
            if word.isdigit() and len(word) == 4 and int(word) >= current_year - 5:
                graduation_year = int(word)
                break

        if graduation_year and graduation_year >= current_year - 2:
            # Recent graduate - GPA might be relevant
            if "gpa" not in content.lower():
                suggestions.append(PromptSuggestion(
                    id="education-gpa",
                    type="improvement",
                    title="Consider Adding GPA",
                    description="If your GPA is above 3.5, consider including it",
                    suggested_text="GPA: 3.8",
                    confidence=0.6,
                    reasoning="Recent graduate without GPA mentioned"
                ))

        return suggestions

    def _get_content_based_suggestions(self, context: CursorContext) -> List[PromptSuggestion]:
        """Get suggestions based on content analysis"""
        suggestions = []

        content = context.current_content

        # Check for generic phrases
        generic_phrases = [
            "responsible for", "worked on", "helped with", "participated in"
        ]

        for phrase in generic_phrases:
            if phrase in content.lower():
                suggestions.append(PromptSuggestion(
                    id=f"content-generic-{phrase.replace(' ', '-')}",
                    type="style",
                    title="Replace Generic Phrases",
                    description=f"Replace '{phrase}' with more specific, action-oriented language",
                    suggested_text=self._get_action_verb_alternative(phrase),
                    confidence=0.7,
                    reasoning=f"Generic phrase '{phrase}' found that could be more specific"
                ))

        return suggestions

    def _get_style_suggestions(self, context: CursorContext) -> List[PromptSuggestion]:
        """Get grammar and style suggestions"""
        suggestions = []

        content = context.current_content

        # Check sentence length
        sentences = re.split(r'[.!?]+', content)
        long_sentences = [s for s in sentences if len(s.split()) > 25]

        if long_sentences:
            suggestions.append(PromptSuggestion(
                id="style-sentence-length",
                type="style",
                title="Break Up Long Sentences",
                description="Consider breaking long sentences into shorter, more readable ones",
                suggested_text=" [Split into multiple sentences]",
                confidence=0.6,
                reasoning="Found sentences longer than 25 words that could be more readable"
            ))

        return suggestions

    def _get_action_verb_alternative(self, generic_phrase: str) -> str:
        """Get action verb alternatives for generic phrases"""
        alternatives = {
            "responsible for": "Led, Managed, Directed, Oversaw",
            "worked on": "Developed, Created, Built, Implemented",
            "helped with": "Collaborated on, Contributed to, Supported",
            "participated in": "Contributed to, Engaged in, Played key role in"
        }

        return alternatives.get(generic_phrase.lower(), "Used strong action verbs")

    def generate_completion_suggestion(self, context: CursorContext) -> Optional[PromptSuggestion]:
        """
        Generate a completion suggestion for the current cursor position

        Args:
            context: The current editing context

        Returns:
            A completion suggestion or None if not appropriate
        """
        content = context.current_content
        position = context.cursor_position

        # Only suggest completions if we're at the end of content or after a sentence
        if position < len(content) - 10:  # Not near the end
            return None

        # Get context around cursor
        before_cursor = content[max(0, position-50):position]

        # Use LLM to generate contextual completion
        prompt = self._build_completion_prompt(context, before_cursor)

        try:
            completion = self.llm_provider.generate(prompt, max_tokens=200)
            cleaned_completion = self._clean_completion_text(completion)

            if len(cleaned_completion.strip()) > 10:
                return PromptSuggestion(
                    id="completion-suggestion",
                    type="completion",
                    title="Smart Completion",
                    description="AI-generated continuation based on context",
                    suggested_text=cleaned_completion,
                    confidence=0.8,
                    reasoning="Contextual completion generated by LLM"
                )
        except Exception as e:
            print(f"Error generating completion: {e}")

        return None

    def _build_completion_prompt(self, context: CursorContext, before_cursor: str) -> str:
        """Build prompt for completion generation"""
        section = context.active_section

        prompt = f"""
        You are a professional resume writing assistant. A user is editing their {section} section and needs help completing their current thought.

        Current section content before cursor: "{before_cursor}"

        Complete this naturally and professionally, maintaining consistency with the existing content style and tone.
        Focus on making it relevant to a {section} section in a resume.

        Provide ONLY the completion text, no explanations or additional commentary.
        Keep it concise but complete the thought appropriately.
        """

        return prompt

    def _clean_completion_text(self, text: str) -> str:
        """Clean and format completion text"""
        # Remove quotes if they wrap the entire text
        text = text.strip()
        if text.startswith('"') and text.endswith('"'):
            text = text[1:-1]

        # Remove any "Completion:" or similar prefixes
        text = re.sub(r'^(Completion|Response|Suggestion)[:\s]*', '', text, flags=re.IGNORECASE)

        return text.strip()


# Global service instance
cursor_service = CursorPromptingService()
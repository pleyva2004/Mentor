"""
Prompt templates for cursor assistance feature
Contains specialized prompts for different contexts and use cases
"""

from typing import Dict, Any, Optional


class CursorPromptTemplates:
    """Collection of prompt templates for different cursor assistance scenarios"""
    
    # Base system prompts for different contexts
    SYSTEM_PROMPTS = {
        "general": """You are a helpful AI assistant integrated into the Mentor MVP application. 
Your role is to provide real-time, context-aware assistance to users working with resumes and course requirements.

Key responsibilities:
1. Help users improve their resumes with specific, actionable suggestions
2. Explain course requirements and how they relate to career paths
3. Provide guidance on highlighting relevant skills and experiences
4. Answer questions about the application features
5. Offer career advice based on the user's background

Guidelines:
- Be concise and specific in your responses
- Focus on actionable advice that users can immediately apply
- Use bullet points for clarity when listing multiple items
- Emphasize impact, clarity, and relevance in resume content
- Be encouraging and supportive""",

        "resume_editing": """You are a professional resume coach helping users optimize their resumes.
Focus on:
- ATS optimization
- Quantifying achievements with metrics
- Using strong action verbs
- Highlighting relevant skills for target roles
- Proper formatting and structure
- Industry-specific best practices""",

        "course_selection": """You are an academic advisor helping users understand course requirements.
Focus on:
- Explaining how courses relate to career goals
- Identifying skill gaps based on course requirements
- Suggesting relevant coursework to highlight
- Connecting academic experience to industry needs""",
    }
    
    # Section-specific guidance
    SECTION_PROMPTS = {
        "header": """When reviewing the header/contact section:
- Ensure all contact information is professional and current
- Recommend including LinkedIn profile if relevant
- Suggest adding GitHub/portfolio for technical roles
- Advise on professional email addresses
- Guide on location information (city, state only)""",

        "projects": """When reviewing projects:
- Focus on impact and outcomes, not just descriptions
- Recommend quantifying results (users, performance improvements, etc.)
- Suggest highlighting technologies used
- Emphasize problem-solving approach
- Guide on prioritizing most relevant projects
- Recommend 2-4 projects maximum""",

        "skills": """When reviewing skills:
- Organize by categories (Languages, Frameworks, Tools, etc.)
- Prioritize skills relevant to target role
- Remove outdated or basic skills
- Suggest industry-standard skill names
- Recommend proficiency levels only if helpful
- Balance technical and soft skills appropriately""",

        "experience": """When reviewing experience:
- Start each bullet with a strong action verb
- Quantify achievements wherever possible
- Focus on impact and results, not just duties
- Use STAR method (Situation, Task, Action, Result)
- Tailor descriptions to target role
- Recommend 3-5 bullets per position""",

        "education": """When reviewing education:
- Include graduation date (or expected)
- List relevant coursework for entry-level/recent grads
- Include GPA if 3.5+ and recent graduate
- Highlight academic achievements/honors
- Add relevant certifications
- Consider removing high school for experienced professionals""",
    }
    
    # Context-aware prompt enhancers
    CONTEXT_ENHANCERS = {
        "entry_level": "Remember the user is likely a recent graduate or career changer. Focus on academic projects, internships, and transferable skills.",
        "experienced": "The user has professional experience. Emphasize achievements, leadership, and advanced skills.",
        "career_change": "The user is transitioning careers. Help highlight transferable skills and relevant experiences.",
        "technical_role": "This is for a technical position. Emphasize technical skills, projects, and quantifiable improvements.",
        "non_technical_role": "This is for a non-technical position. Focus on soft skills, leadership, and business impact.",
    }
    
    @staticmethod
    def get_enhanced_prompt(base_prompt: str, context: Dict[str, Any]) -> str:
        """Enhance a base prompt with contextual information"""
        enhanced_parts = [base_prompt]
        
        # Add section-specific guidance
        if "current_section" in context and context["current_section"] in CursorPromptTemplates.SECTION_PROMPTS:
            enhanced_parts.append("\n\n" + CursorPromptTemplates.SECTION_PROMPTS[context["current_section"]])
        
        # Add user context
        if "user_data" in context:
            user_context = "\n\nUser Context:"
            user_data = context["user_data"]
            
            if "graduation_year" in user_data:
                try:
                    grad_year = int(user_data["graduation_year"])
                    current_year = 2025
                    years_experience = current_year - grad_year
                    
                    if years_experience <= 2:
                        enhanced_parts.append("\n\n" + CursorPromptTemplates.CONTEXT_ENHANCERS["entry_level"])
                    elif years_experience >= 5:
                        enhanced_parts.append("\n\n" + CursorPromptTemplates.CONTEXT_ENHANCERS["experienced"])
                except:
                    pass
            
            if "major" in user_data:
                major = user_data["major"].lower()
                if any(tech in major for tech in ["computer", "software", "engineering", "data", "information"]):
                    user_context += "\n- Technical background: " + user_data["major"]
                else:
                    user_context += "\n- Non-technical background: " + user_data["major"]
            
            enhanced_parts.append(user_context)
        
        # Add specific course context if available
        if "selected_courses" in context and context["selected_courses"]:
            courses_context = f"\n\nSelected courses to highlight: {', '.join(context['selected_courses'][:5])}"
            enhanced_parts.append(courses_context)
        
        return "\n".join(enhanced_parts)
    
    @staticmethod
    def get_example_improvements(section: str) -> Dict[str, str]:
        """Get before/after examples for common improvements"""
        examples = {
            "projects": {
                "before": "Developed a web application using React",
                "after": "Developed a React-based task management application serving 500+ daily active users, reducing project completion time by 30% through intuitive UI/UX design"
            },
            "experience": {
                "before": "Responsible for customer service",
                "after": "Resolved 50+ customer inquiries daily with 95% satisfaction rate, implementing feedback system that reduced repeat issues by 40%"
            },
            "skills": {
                "before": "Python, Java, JavaScript, HTML, CSS, React, Node.js, MongoDB, Git, Docker",
                "after": "Languages: Python, Java, JavaScript\nFrameworks: React, Node.js, Express\nDatabases: MongoDB, PostgreSQL\nTools: Git, Docker, AWS"
            }
        }
        return examples.get(section, {})


def create_specialized_prompt(prompt_type: str, user_query: str, context: Dict[str, Any]) -> str:
    """Create a specialized prompt based on type and context"""
    
    # Determine the appropriate system prompt
    if prompt_type == "resume_editing" or context.get("current_page", "").endswith("/edit"):
        base_system = CursorPromptTemplates.SYSTEM_PROMPTS["resume_editing"]
    elif prompt_type == "course_selection" or "courses" in context:
        base_system = CursorPromptTemplates.SYSTEM_PROMPTS["course_selection"]
    else:
        base_system = CursorPromptTemplates.SYSTEM_PROMPTS["general"]
    
    # Enhance with context
    enhanced_prompt = CursorPromptTemplates.get_enhanced_prompt(base_system, context)
    
    # Add the user query
    full_prompt = f"{enhanced_prompt}\n\nUser question: {user_query}\n\nProvide a helpful, specific response:"
    
    return full_prompt


def get_contextual_suggestions(context: Dict[str, Any]) -> list[str]:
    """Generate contextual suggestions based on current state"""
    suggestions = []
    
    current_section = context.get("current_section", "")
    
    # Section-specific suggestions
    section_suggestions = {
        "projects": [
            "How can I make my project descriptions more impactful?",
            "What technical details should I include in my projects?",
            "How do I highlight the business value of my projects?",
            "Should I include personal projects or only professional ones?"
        ],
        "skills": [
            "How should I organize my technical skills?",
            "Which skills are most relevant for my target role?",
            "Should I include soft skills on my resume?",
            "How do I show proficiency levels effectively?"
        ],
        "experience": [
            "How can I quantify my achievements better?",
            "What action verbs should I use for impact?",
            "How do I describe my responsibilities concisely?",
            "How many bullet points should each role have?"
        ],
        "education": [
            "Should I include my GPA on my resume?",
            "How do I highlight relevant coursework?",
            "What certifications should I add?",
            "Should I include extracurricular activities?"
        ],
        "header": [
            "What contact information should I include?",
            "Should I add a professional summary?",
            "How do I write an effective LinkedIn headline?",
            "What's the best format for my header?"
        ]
    }
    
    # Course selection suggestions
    if context.get("current_page", "") == "/" or context.get("courses_available", 0) > 0:
        suggestions.extend([
            "Which courses best demonstrate my technical skills?",
            "How do I connect coursework to job requirements?",
            "Should I list all my courses or be selective?",
            "How do I describe course projects effectively?"
        ])
    
    # General suggestions if no specific context
    if not suggestions:
        suggestions = [
            "How can I improve my resume for ATS systems?",
            "What are the most important sections to focus on?",
            "How do I tailor my resume for specific roles?",
            "What are common resume mistakes to avoid?"
        ]
    
    # Get section-specific suggestions or general ones
    return section_suggestions.get(current_section, suggestions)[:4]
# Mentor Resume Helper - Complete Feature Requirements

## 1.0 Overview

This document specifies the complete feature requirements for the Mentor Resume Helper application. The primary objective is to create an end-to-end interactive resume building experience that guides users from initial data collection through resume enhancement, career planning, and project recommendations.

---

## 2.0 Phase 1: User Onboarding & Data Collection

### 2.1 Resume Upload & Parsing

**FR-1.1 File Upload Interface**
- Users must be able to upload their existing resume (PDF, DOCX) or transcript
- Support drag-and-drop functionality
- Display file name and size after successful upload
- Show loading indicator during parsing

**FR-1.2 Automatic Data Extraction**
- Parse uploaded documents to extract:
  - Name and contact information
  - Educational background (school, degree, major, graduation year)
  - Work experience (titles, companies, dates, responsibilities)
  - Skills (technical and soft skills)
  - Projects and coursework
- Display extracted data for user verification

**FR-1.3 Missing Information Prompts**
- If school or major is not detected, prompt user with input fields
- If graduation year is missing, ask for expected or actual graduation year
- Allow manual input for any missing or incorrectly parsed fields

### 2.2 Education Verification

**FR-2.1 School and Major Confirmation**
- Display detected school and major prominently
- Provide dropdown/autocomplete for school selection if needed
- Offer common major categories with search functionality
- Allow custom major input for uncommon programs

**FR-2.2 Academic Standing**
- Ask for current semester standing (e.g., "2nd semester junior", "rising senior")
- Calculate based on graduation year if not explicitly provided
- Use this to determine appropriate course catalog

---

## 3.0 Phase 2: Course Selection

### 3.1 Dynamic Course Catalog

**FR-3.1 Course List Generation**
- Based on confirmed major and year, display relevant courses from catalog
- Organize courses by category (e.g., Core, Electives, Advanced)
- Show courses typically taken by students at their academic level

**FR-3.2 Course Selection Interface**
- Multi-select checkbox interface for completed courses
- Search/filter functionality for large course lists
- "Select All" and "Clear All" options
- Visual indication of selected courses

**FR-3.3 Alternative Input Methods**
- Option to upload transcript for automatic course detection
- Option to upload Degree Works or similar academic planning document
- Manual course entry for courses not in catalog

### 3.2 Course-Project Association

**FR-3.4 Project Details Collection**
- For each selected course, prompt user to add associated projects
- Support multiple input types:
  - Text description
  - GitHub repository link
  - PDF upload (assignment descriptions, reports)
  - Lab reports or class submissions

**FR-3.5 Project Information Fields**
- Project title
- Course association
- Description and outcomes
- Technologies/skills used
- Dates (start and completion)
- Team size and role (if applicable)

---

## 4.0 Phase 3: Interactive Resume Editing

### 4.1 Visual Resume Structure

**FR-4.1 Section Block Display**
- Render resume in distinct, visually separated sections:
  - Education
  - Work Experience
  - Projects
  - Skills
  - Extracurricular Activities (if applicable)
  - Leadership Experience (if applicable)

**FR-4.2 Drag-and-Drop Reordering**
- When user hovers over a section, display subtle highlight (border, shadow, or background change)
- Click and hold to drag section vertically
- Show visual placeholder (dashed outline) indicating drop position
- Animate smooth reflow of all sections upon drop
- Maintain reordering state throughout session

### 4.2 Edit Mode Interface

**FR-4.3 Edit Mode Activation**
- Click on any section or dedicated "Edit" icon to enter Edit Mode
- Animate resume preview to slide left, occupying 60-70% of viewport
- Simultaneously animate AI Helper panel in from right (30-40% of viewport)
- Clear visual transition with smooth animation (300-400ms)

**FR-4.4 Direct In-Line Editing**
- All text fields become editable on click:
  - Job titles, company names, degree titles
  - Location and date ranges
  - Individual bullet points
  - Section headings (optional)
- Show text cursor and input border when field is active
- Auto-save changes after blur or Enter key
- Provide visual feedback for saved changes

**FR-4.5 Bullet Point Management**
- Click bullet point to edit in place
- Add new bullet point button at end of each section
- Delete bullet point with hover-activated X icon
- Reorder bullet points via drag-and-drop within section

### 4.3 AI Helper Panel

**FR-4.6 Context-Aware Content**
- Display relevant tips based on section being edited:
  - **Work Experience**: "Quantify achievements with numbers and percentages"
  - **Projects**: "Highlight technologies used and measurable outcomes"
  - **Skills**: "Group by category: Languages, Frameworks, Tools"
  - **Education**: "Include relevant coursework and GPA if above 3.5"

**FR-4.7 AI-Powered Suggestions**
- "Improve Phrasing" button: Rewrites bullet point with stronger action verbs
- "Quantify Impact" button: Prompts user for metrics to add
- "Expand Details" button: Suggests additional information to include
- "Check for Common Mistakes" button: Identifies passive voice, weak verbs, typos

**FR-4.8 Interactive Suggestion Flow**
- Clicking suggestion button shows AI-generated alternatives
- Display 2-3 rewrite options for user to choose
- "Use This" button replaces original text
- "Keep Original" button dismisses suggestion
- Show loading state while generating suggestions

**FR-4.9 Manual Enhancement Options**
- Collapsible "Writing Tips" section with best practices
- Example bullet points for common roles
- Action verb bank organized by category
- Link to more detailed resume writing resources

---

## 5.0 Phase 4: Experience Enhancement

### 5.1 Work Experience Analysis

**FR-5.1 Experience Level Detection**
- Categorize experience as Low, Mid, or High based on:
  - Number of positions
  - Role titles and responsibilities
  - Industry relevance to target career

**FR-5.2 Low-Mid Experience Enhancement**
- For retail, sales, or service roles:
  - Prompt questions to uncover leadership instances
  - Suggest reframing responsibilities to highlight transferable skills
  - Offer title optimization (e.g., "Team Member" → "Customer Service Associate")
- Generate default bullet points based on common role responsibilities
- Use AI to identify hidden leadership experiences

**FR-5.3 High-Relevance Experience Enhancement**
- Focus on technical skills and technologies used
- Emphasize measurable impact and outcomes
- Suggest industry-specific terminology
- Highlight collaboration and scale of projects

### 5.2 Extracurricular & Leadership

**FR-5.4 Leadership Experience Prompts**
- Ask about club involvement, committees, organizations
- For members: "What responsibilities did you help your leader with?"
- For leaders: "What were your key accomplishments in this role?"
- Cross-reference with examples from similar roles (e.g., directors of other clubs)

**FR-5.5 Role Description Templates**
- Provide template descriptions for common leadership roles
- Allow users to select and customize templates
- Include prompts for specific achievements and initiatives led

---

## 6.0 Phase 5: Skills Synthesis

### 6.1 Automated Skills Extraction

**FR-6.1 Comprehensive Skills Parsing**
- Extract skills from:
  - Work experience bullet points
  - Project descriptions
  - Course listings
  - User-uploaded materials
- Automatically populate Skills section with extracted skills

**FR-6.2 Skills Organization**
- Group skills by category:
  - Programming Languages
  - Frameworks & Libraries
  - Tools & Platforms
  - Soft Skills
- Allow users to reorder and rename categories
- Suggest additional relevant skills based on their experience

**FR-6.3 Skills Validation**
- Cross-check all listed skills appear in resume body (1:1 mapping requirement)
- Flag skills with no supporting evidence
- Suggest removing or adding context for unsupported skills

---

## 7.0 Phase 6: Resume Finalization & Export

### 7.1 Final Review

**FR-7.1 Resume Preview Modes**
- Toggle between edit mode and full preview
- Print-preview mode showing how resume will look on paper
- Mobile preview mode (optional)

**FR-7.2 Export Options**
- Generate professional LaTeX-formatted resume template
- Offer multiple template styles (Modern, Classic, ATS-friendly)
- Export as PDF with proper formatting
- Export as DOCX for further editing
- Copy formatted text to clipboard

---

## 8.0 Phase 7: Career Planning & Job Targeting

### 8.1 Interest Discovery

**FR-8.1 Job Interest Prompts**
- "What types of roles interest you?" (e.g., Software Engineer, Data Analyst)
- "Are there specific companies you're targeting?"
- Provide common job categories based on major

**FR-8.2 AI-Powered Job Recommendations**
- Analyze completed resume to suggest suitable roles
- Match skills and experience to job market demand
- Categorize suggestions by:
  - Immediate fit (ready to apply)
  - Growth roles (with some additional skills/projects)
  - Stretch roles (aspirational targets)

**FR-8.3 Job-Resume Gap Analysis**
- For each target role, identify:
  - Matching qualifications
  - Missing skills or experiences
  - Recommended actions to bridge gap

---

## 9.0 Phase 8: Project Recommendations

### 9.1 Tailored Project Suggestions

**FR-9.1 Context-Aware Project Generation**
- Generate project ideas based on:
  - Target roles and companies
  - Current skill gaps
  - User's major and coursework
  - Time commitment preferences

**FR-9.2 Project Categorization by Duration**
- **1-Week Projects**: Quick wins to demonstrate specific skills
  - Example: "Build a REST API with authentication"
  - Focus: Specific technology or tool
  
- **2-Week Projects**: Moderate complexity with multiple features
  - Example: "Create a full-stack task management app"
  - Focus: Integration of multiple technologies
  
- **1-Month Projects**: Portfolio-worthy substantial projects
  - Example: "Develop a machine learning recommendation system"
  - Focus: End-to-end product with real-world application

**FR-9.3 Project Details**
- Each suggestion includes:
  - Project title and description
  - Learning objectives
  - Technologies to use
  - Key features to implement
  - Estimated time commitment
  - Resume impact (how it strengthens application)

**FR-9.4 Project Planning Support**
- Provide high-level implementation roadmap
- Suggest GitHub repo structure
  - Link to relevant tutorials or resources
- Offer milestone breakdown for tracking progress

---

## 10.0 Visual Feedback & User Experience

### 10.1 Animation & Transitions

**FR-10.1 Smooth State Changes**
- All phase transitions use smooth fade/slide animations (300-400ms)
- Section reordering includes fluid reflow animation
- AI suggestion appearance uses fade-in effect
- Success actions (save, update) trigger subtle positive feedback animation

**FR-10.2 Hover States**
- All interactive elements have clear hover effects:
  - Slight scale increase (1.02x)
  - Color change or underline
  - Cursor changes to pointer
  - Tooltip appears for less obvious actions

**FR-10.3 Loading States**
- Show spinner or skeleton screen during:
  - File upload and parsing
  - AI suggestion generation
  - Resume export generation
- Provide estimated wait time for longer operations

### 10.2 Progress Tracking

**FR-10.4 Progress Indicator**
- Display progress bar or stepper showing current phase
- Show completed phases with checkmark
- Allow users to navigate back to previous phases
- Indicate required vs. optional steps

**FR-10.5 Completion Validation**
- Each phase has clear completion criteria
- "Next" button disabled until requirements met
- Show checklist of required actions for current phase

---

## 11.0 Data Management

### 11.1 Session Persistence

**FR-11.1 Auto-Save**
- Automatically save all changes to in-memory state
- Save state every 30 seconds during active editing
- Show "Saved" indicator after auto-save

**FR-11.2 Export Data**
- Allow users to download their data as JSON
- Enable import of previously exported data to continue session
- Clear data option with confirmation dialog

---

## 12.0 Accessibility & Responsiveness

### 12.1 Accessibility Requirements

**FR-12.1 Keyboard Navigation**
- All interactive elements accessible via Tab key
- Enter key activates buttons and selections
- Escape key closes modals and cancels edit mode

**FR-12.2 Screen Reader Support**
- Proper ARIA labels on all interactive elements
- Announce state changes (e.g., "Entering edit mode")
- Provide text alternatives for icon-only buttons

### 12.2 Responsive Design

**FR-12.3 Mobile Adaptation**
- Stack edit panel below resume on smaller screens
- Touch-friendly button sizes (minimum 44x44px)
- Simplified drag-and-drop for mobile devices
- Optimize for tablet landscape and portrait modes

---

## 13.0 Success Criteria

The Mentor Resume Helper MVP is considered successful when:

1. ✅ Users can upload and parse resume with 90%+ accuracy
2. ✅ All phases flow smoothly with clear transitions
3. ✅ Resume editing feels intuitive and responsive
4. ✅ AI suggestions provide genuine value and improvement
5. ✅ Export generates professional, ATS-compatible resume
6. ✅ Career and project recommendations feel personalized
7. ✅ Users complete entire workflow in under 30 minutes
8. ✅ Zero critical bugs in core functionality
9. ✅ All animations perform smoothly (60fps)
10. ✅ Application works on modern browsers (Chrome, Firefox, Safari, Edge)

---

## 14.0 Out of Scope for MVP

The following features are explicitly **not** included in the MVP:

- ❌ User accounts and authentication
- ❌ Database persistence across sessions
- ❌ Real-time collaboration with mentors
- ❌ Direct job application submission
- ❌ Resume version history
- ❌ Custom template design editor
- ❌ Integration with LinkedIn or other platforms
- ❌ Payment processing or premium features
- ❌ Email notifications
- ❌ Mobile native apps (iOS/Android)

These may be considered for future iterations after MVP validation.
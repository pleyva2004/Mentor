# Mentór - Codebase Structure Documentation

## Project Overview

**Mentór** is an AI-powered resume building and analysis platform designed to help candidates create professional resumes. The platform consists of:

1. **Backend (FastAPI)**: Python-based API server that processes PDF resumes, extracts information using LLMs, and scrapes university course catalogs
2. **Frontend (Next.js)**: Main application for uploading resumes and displaying course requirements
3. **Resume-Helper (Next.js)**: Separate application for comprehensive resume building with AI assistance

**Mission**: "Ex-FAANG engineer wants to give everyone a chance" - democratizing access to professional resume building.

---

## Architecture Overview

```
Mentór/
├── backend/              # FastAPI server (Python)
├── frontend/             # Main Next.js application
├── resume-helper/        # Resume builder Next.js application
├── start.sh             # Startup script for both frontend and backend
└── README.md
```

### System Architecture

```
┌─────────────────┐          ┌──────────────────┐
│   Frontend      │          │  Resume-Helper   │
│   (Next.js)     │          │    (Next.js)     │
│   Port: 3000    │          │    Port: TBD     │
└────────┬────────┘          └────────┬─────────┘
         │                            │
         │    HTTP Requests           │
         │                            │
         └───────────┬────────────────┘
                     │
         ┌───────────▼────────────┐
         │   Backend (FastAPI)    │
         │   Port: 8000           │
         │                        │
         │  ┌──────────────────┐  │
         │  │  LLM Providers   │  │
         │  │  - OpenAI        │  │
         │  │  - Anthropic     │  │
         │  │  - Gemini        │  │
         │  └──────────────────┘  │
         │                        │
         │  ┌──────────────────┐  │
         │  │ Course Scraper   │  │
         │  │ - SerpAPI        │  │
         │  │ - BeautifulSoup  │  │
         │  └──────────────────┘  │
         │                        │
         │  ┌──────────────────┐  │
         │  │  Cache (JSON)    │  │
         │  └──────────────────┘  │
         └────────────────────────┘
```

---

## Backend (FastAPI) - `/backend`

### Tech Stack
- **Framework**: FastAPI
- **Python Version**: 3.9+
- **Package Manager**: Poetry
- **PDF Processing**: PyMuPDF (fitz)
- **Web Scraping**: BeautifulSoup4, Requests
- **Search API**: SerpAPI
- **LLM Providers**: OpenAI, Anthropic (Claude), Google Gemini
- **Server**: Uvicorn

### Directory Structure

```
backend/
├── main.py               # FastAPI app entry point, resume upload endpoint
├── provider.py           # LLM provider abstraction layer
├── course_scraper.py     # University course catalog scraper
├── extract.py            # LLM response parsing utilities
├── cache.py              # File-based caching system
├── search.py             # Search utilities
├── pyproject.toml        # Poetry dependencies
└── cache/                # Cached course data (JSON files)
    ├── mit_computer_science.json
    ├── njit_computer_science.json
    └── ...
```

### Key Files and Their Responsibilities

#### 1. `main.py` (Lines: 276)
**Purpose**: Core FastAPI application with resume processing endpoint

**Key Features**:
- CORS middleware configured for `http://localhost:3000`
- Single endpoint: `POST /upload-resume`
- PDF text extraction using PyMuPDF
- Multi-stage LLM processing pipeline:
  1. Extract college name, major, graduation year
  2. Scrape course requirements
  3. Generate HTML for:
     - Header (contact info)
     - Projects
     - Skills (categorized)
     - Experience
     - Education

**LLM Prompts**:
- **Resume Metadata Extraction** (Lines 54-103): Extracts college, major, year
- **Header Extraction** (Lines 112-128): Formats contact info as HTML
- **Projects Extraction** (Lines 133-160): Formats projects with bullets
- **Skills Extraction** (Lines 165-193): Categorizes skills (Languages, Frameworks, Databases, Cloud/DevOps, AI/ML)
- **Experience Extraction** (Lines 197-225): Formats work experience with bullets
- **Education Extraction** (Lines 230-257): Formats degree info with coursework

**API Response Schema**:
```json
{
  "filename": "string",
  "text": "string",
  "header": "HTML string",
  "projects": "HTML string",
  "skills": "HTML string",
  "experience": "HTML string",
  "education": "HTML string",
  "course_work": [
    {"course_number": "CS 101", "course_title": "Intro to CS"}
  ]
}
```

#### 2. `provider.py` (Lines: 90)
**Purpose**: Abstract interface for multiple LLM providers

**Architecture Pattern**: Strategy Pattern with Factory

**Classes**:
- `LLMProvider` (ABC): Abstract base class
- `OpenAIProvider`: Uses GPT-4o model (default)
- `AnthropicProvider`: Uses Claude Sonnet 4
- `GeminiProvider`: Uses Gemini 2.0 Flash Exp
- `get_llm_provider()`: Factory function

**Current Provider**: OpenAI (main.py:11)

**Environment Variables Required**:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

#### 3. `course_scraper.py` (Lines: 215)
**Purpose**: Scrape university course catalogs using AI

**Key Functions**:

1. `searchCourseCatalogs(school, major)` → List[str]
   - Uses SerpAPI to find course catalog URLs
   - Returns top 3 URLs

2. `fetchPageContent(url)` → Optional[str]
   - HTTP GET with retry logic
   - Custom User-Agent headers

3. `extractCourses(html_content, school, major)` → dict
   - Uses BeautifulSoup to clean HTML
   - LLM extracts course numbers and titles
   - Returns structured JSON array

4. `scrapeCourseRequirements(school, major)` → dict
   - Main entry point
   - Implements cache-first strategy
   - Deduplicates courses by course number
   - Caches results to JSON files

**Cache Key Format**: `{school}_{major}` (lowercase, underscores)
Example: `new_jersey_institute_of_technology_computer_science`

#### 4. `extract.py` (Lines: 1233)
**Purpose**: Parse and clean LLM responses

**Key Functions**:
- `parseLLMResponse()`: Extracts JSON from LLM output
- `parseHTMLResponse()`: Cleans HTML from LLM output

#### 5. `cache.py` (Lines: 1281)
**Purpose**: File-based caching for course data

**Functions**:
- `get_cache(key)`: Load cached JSON
- `set_cache(key, data)`: Save JSON to cache

**Cache Location**: `backend/cache/{key}.json`

### Backend Configuration

**CORS Settings** (main.py:14-20):
- Origin: `http://localhost:3000`
- Credentials: Enabled
- All methods and headers allowed

**File Upload Limits** (main.py:48):
- Max size: 10MB
- Accepted format: PDF only

---

## Frontend (Main) - `/frontend`

### Tech Stack
- **Framework**: Next.js 15.5.4
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx         # Main upload page
│   │   └── layout.tsx       # Root layout
│   └── components/
│       ├── CourseList.tsx   # Course selection component
│       └── CourseBox.tsx    # Individual course card
├── package.json
├── next.config.ts
└── tsconfig.json
```

### Key Components

#### 1. `page.tsx` (Main Upload Page)
**Purpose**: Resume upload interface with course requirements

**State Management**:
- `file`: Selected PDF file
- `isUploading`: Upload status
- `result`: API response data
- `courses`: Transformed course list
- `selectedCourses`: User-selected courses
- `error`: Error messages

**API Integration**:
```typescript
POST http://localhost:8000/upload-resume
Content-Type: multipart/form-data
Body: FormData with 'file' field
```

**Data Transformation** (Lines 50-58):
```typescript
// Backend format
{course_number: "CS 101", course_title: "Intro"}

// Component format
{id: "CS 101", name: "Intro", code: "CS 101"}
```

**UI Features**:
- Drag-and-drop file upload
- Loading states
- Error handling
- Course list with checkboxes
- Gradient background (blue to indigo)

#### 2. `CourseList.tsx`
**Purpose**: Displays courses from scraped catalog

**Props**:
```typescript
interface Course {
  id: string;
  name: string;
  code: string;
}

interface Props {
  courses: Course[];
  onSelectionChange: (selected: string[]) => void;
}
```

**Features**:
- Checkbox selection
- Course code + name display
- Callback for selection changes

---

## Resume-Helper Application - `/resume-helper`

### Tech Stack
- **Framework**: Next.js 15.1.7
- **React**: 19.1.1
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 4.1.14
- **State Management**: Zustand 5.0.8
- **Drag & Drop**: react-dropzone 14.3.8
- **Animations**: Framer Motion 12.23.22
- **Testing**: Vitest 3.2.4, Testing Library
- **Icons**: Lucide React

### Architecture Pattern

**State Management**: Zustand stores (centralized, immutable)
**UI Pattern**: Atomic Design (Atoms → Molecules → Organisms → Screens)
**Routing**: Next.js App Router

### Directory Structure

```
resume-helper/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Upload screen route
│   │   ├── edit/page.tsx      # Edit screen route
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── FileDropzone.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── ScreenContainer.tsx
│   │   │   └── EditContainer.tsx
│   │   ├── resume/            # Resume-specific components
│   │   │   ├── ResumePreview.tsx
│   │   │   ├── ResumeBlock.tsx
│   │   │   ├── AIHelperPanel.tsx
│   │   │   └── VerificationHeader.tsx
│   │   └── screens/           # Full screen components
│   │       ├── UploadScreen.tsx
│   │       └── EditScreen.tsx
│   ├── stores/                # Zustand state stores
│   │   ├── resumeStore.ts     # Resume data management
│   │   ├── uploadStore.ts     # Upload state
│   │   └── editModeStore.ts   # Edit mode state
│   ├── hooks/                 # Custom React hooks
│   │   ├── useFileUpload.ts
│   │   ├── useDragAndDrop.ts
│   │   └── useEditMode.ts
│   ├── types/                 # TypeScript definitions
│   │   ├── resume.ts
│   │   ├── upload.ts
│   │   ├── ui.ts
│   │   └── index.ts
│   ├── constants/             # Static data
│   │   ├── resumeData.ts
│   │   └── aiSuggestions.ts
│   ├── lib/                   # Utility functions
│   │   └── utils.ts
│   └── __tests__/             # Test files
│       └── App.test.tsx
├── package.json
├── vitest.config.ts
└── tsconfig.json
```

### Key Components and Their Responsibilities

#### State Stores (Zustand)

##### 1. `resumeStore.ts` (Lines: 157)
**Purpose**: Central resume data management

**State Schema**:
```typescript
interface ResumeData {
  header: ResumeBlock;      // Contact info
  projects: ResumeBlock;    // Projects section
  skills: ResumeBlock;      // Technical skills
  experience: ResumeBlock;  // Work experience
  education: ResumeBlock;   // Education section
}

interface ResumeBlock {
  id: string;
  section: ResumeSection;
  title: string;
  content: string;          // HTML from backend
  isConfirmed: boolean;     // User verification
  order: number;            // Display order
}
```

**Key Actions**:
1. `updateResumeBlock(section, updates)`: Update section content
2. `confirmSection(section)`: Mark section as verified
3. `reorderSections(fromIndex, toIndex)`: Drag-and-drop reordering
4. `setProcessedResumeData(backendData)`: Transform backend response
5. `resetResumeData()`: Clear all data
6. `setProcessingError(error)`: Handle errors

**Backend Integration** (Lines 92-147):
Transforms backend API response to internal format:
```typescript
// Backend → Frontend transformation
{
  header: "HTML string",
  projects: "HTML string",
  skills: "HTML string",
  experience: "HTML string",
  education: "HTML string"
}
↓
{
  header: {id, section, title, content, isConfirmed, order},
  projects: {...},
  skills: {...},
  experience: {...},
  education: {...}
}
```

##### 2. `uploadStore.ts`
**Purpose**: Manage file upload state

**Expected State**:
- Upload progress
- File validation
- Upload errors

##### 3. `editModeStore.ts`
**Purpose**: Edit mode UI state

**Expected State**:
- Active section being edited
- Edit modal visibility
- Unsaved changes tracking

#### Screen Components

##### 1. `UploadScreen.tsx` (Lines: 138)
**Purpose**: Initial file upload interface

**Features**:
- Multi-file upload (resume, transcript, projects)
- Required vs optional file indicators
- File type validation (PDF only)
- Loading state during analysis
- Privacy notice

**File Types**:
```typescript
{
  resume: {icon: '📄', required: true},
  transcript: {icon: '🎓', required: true},
  projects: {icon: '📂', required: false}
}
```

**Backend Integration** (Lines 32-59):
```typescript
POST http://localhost:8000/upload-resume
FormData: {file: resumeFile}
→ Response transformed and stored in resumeStore
→ Navigate to /edit screen
```

**User Flow**:
1. Upload resume (required) + transcript (required)
2. Optionally upload projects
3. Click "Analyze & Build My Resume"
4. Loading spinner during backend processing
5. Navigate to edit screen on success

##### 2. `EditScreen.tsx`
**Purpose**: Resume editing and verification interface

**Expected Features**:
- Section-by-section editing
- AI suggestions panel
- Live preview
- Section reordering
- Confirm/reject changes
- Export to PDF

#### Custom Hooks

##### 1. `useFileUpload.ts`
**Purpose**: File upload logic and validation

**Expected API**:
```typescript
{
  files: Record<FileType, UploadedFile>,
  isUploading: boolean,
  isAnalyzing: boolean,
  handleFileSelect: (file: File, type: FileType) => void,
  isFileUploaded: (type: FileType) => boolean,
  getUploadedFileName: (type: FileType) => string
}
```

##### 2. `useDragAndDrop.ts`
**Purpose**: Section reordering functionality

##### 3. `useEditMode.ts`
**Purpose**: Edit mode state management

#### Type Definitions

##### `resume.ts`
```typescript
type ResumeSection = 'header' | 'projects' | 'skills' | 'experience' | 'education';

interface ResumeBlock {
  id: string;
  section: ResumeSection;
  title: string;
  content: string;
  isConfirmed: boolean;
  order: number;
}

interface ResumeData {
  header: ResumeBlock;
  projects: ResumeBlock;
  skills: ResumeBlock;
  experience: ResumeBlock;
  education: ResumeBlock;
}
```

##### `upload.ts`
```typescript
type FileType = 'resume' | 'transcript' | 'projects';

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  uploadedAt: Date;
}
```

---

## Data Flow

### Resume Processing Flow

```
┌────────────────────────────────────────────────────────────────┐
│ 1. User Uploads PDF Resume (Frontend or Resume-Helper)         │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. POST /upload-resume (Backend - main.py)                     │
│    - Validate PDF                                              │
│    - Extract text with PyMuPDF                                 │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. LLM Pipeline (Sequential Processing)                        │
│                                                                 │
│    Step 1: Extract Metadata                                    │
│    → college_name, major, graduation_year                      │
│                                                                 │
│    Step 2: Scrape Course Requirements                          │
│    → scrapeCourseRequirements()                                │
│    → Check cache → SerpAPI → BeautifulSoup → LLM extract       │
│                                                                 │
│    Step 3: Generate HTML Sections (5 LLM calls)                │
│    → Header (contact info)                                     │
│    → Projects (with bullets)                                   │
│    → Skills (categorized)                                      │
│    → Experience (with bullets)                                 │
│    → Education (with coursework)                               │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. Return JSON Response                                        │
│    {                                                            │
│      filename, text,                                           │
│      header, projects, skills, experience, education,          │
│      course_work: [{course_number, course_title}]              │
│    }                                                            │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. Frontend Processing                                         │
│                                                                 │
│    Main Frontend:                                              │
│    → Display extracted text                                    │
│    → Show course list with checkboxes                          │
│                                                                 │
│    Resume-Helper:                                              │
│    → Transform to ResumeData format                            │
│    → Store in resumeStore                                      │
│    → Navigate to /edit screen                                  │
│    → User verifies/edits each section                          │
│    → Export final resume                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### 1. **Multi-LLM Provider Support**
**Decision**: Abstract LLM providers behind a common interface
**Rationale**: Flexibility to switch providers based on cost, performance, rate limits
**Implementation**: Strategy pattern in `provider.py`
**Current**: Using OpenAI GPT-4o
**Alternatives**: Claude Sonnet 4, Gemini 2.0 Flash

### 2. **Course Scraping with AI**
**Decision**: Use LLM to extract courses from HTML instead of rigid parsing
**Rationale**: University websites have varying HTML structures
**Tradeoff**: More expensive but more robust
**Optimization**: Cache results to reduce API calls

### 3. **Separate Frontend Applications**
**Decision**: Two Next.js apps (`frontend` and `resume-helper`)
**Rationale**:
- `frontend`: Simple demo/MVP for resume upload
- `resume-helper`: Full-featured resume builder with editing
**Possible Consolidation**: Could be merged into single app with routing

### 4. **HTML Content Storage**
**Decision**: Store resume sections as HTML strings instead of structured data
**Rationale**:
- LLM generates formatted HTML directly
- Easy to render in preview
- Preserves formatting (bold, italics, lists)
**Tradeoff**: Harder to edit individual fields vs structured JSON

### 5. **File-based Caching**
**Decision**: JSON files instead of database for course cache
**Rationale**: Simple, no external dependencies, sufficient for MVP
**Scale Limitation**: Not suitable for high-traffic production
**Migration Path**: Redis or PostgreSQL for production

### 6. **Client-side State Management**
**Decision**: Zustand instead of Redux/Context
**Rationale**:
- Simpler API
- Less boilerplate
- Better TypeScript support
- Small bundle size

### 7. **PDF-only Upload**
**Decision**: Only accept PDF resumes
**Rationale**:
- Most common format
- Reliable text extraction with PyMuPDF
- Avoid complexity of DOCX/images
**Future**: Could add DOCX support with python-docx

---

## Environment Variables

### Backend (.env in `/backend`)
```bash
# LLM Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Search API
SERPAPI_API_KEY=...
```

### Frontend
No environment variables currently required (API URL hardcoded to localhost:8000)

**Production TODO**: Add `NEXT_PUBLIC_API_URL` environment variable

---

## Startup Instructions

### Option 1: Start Script (Recommended)
```bash
./start.sh
```
Starts both backend (port 8000) and frontend (port 3000)

### Option 2: Manual Startup

**Backend**:
```bash
cd backend
poetry install
poetry run uvicorn main:app --reload --port 8000
```

**Frontend**:
```bash
cd frontend
pnpm install
pnpm run dev  # Port 3000
```

**Resume-Helper**:
```bash
cd resume-helper
npm install
npm run dev  # Port 3001 (configure in package.json)
```

---

## API Documentation

### Endpoints

#### `GET /`
**Description**: Health check
**Response**: `{"message": "Mentor Resume Parser API"}`

#### `POST /upload-resume`
**Description**: Upload and process PDF resume

**Request**:
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field (PDF)

**Response** (200 OK):
```json
{
  "filename": "john_doe_resume.pdf",
  "text": "Full extracted text...",
  "header": "<p>John Doe | Software Engineer | ...</p>",
  "projects": "<h4>Project 1</h4><p>...</p><ul><li>...</li></ul>",
  "skills": "<p><strong>Languages:</strong> Python, JS</p>...",
  "experience": "<h4>Senior Engineer</h4><p>...</p><ul>...</ul>",
  "education": "<h4>BS Computer Science</h4><p>...</p>",
  "course_work": [
    {"course_number": "CS 101", "course_title": "Intro to CS"},
    {"course_number": "CS 201", "course_title": "Data Structures"}
  ]
}
```

**Errors**:
- 400: Invalid file type, file too large, empty PDF, extraction error
- 500: Server error

**Interactive Docs**: http://localhost:8000/docs (FastAPI auto-generated)

---

## Testing

### Backend
No tests currently implemented

**TODO**: Add pytest tests for:
- PDF extraction
- LLM response parsing
- Course scraping
- Cache operations

### Resume-Helper
**Framework**: Vitest + Testing Library

**Run Tests**:
```bash
cd resume-helper
npm run test
```

**Test Files**: `src/__tests__/App.test.tsx`

---

## Future Enhancements & TODOs

### High Priority
1. **Consolidate Frontend Apps**: Merge `frontend` and `resume-helper` or clarify purpose
2. **Environment Variables**: Use `.env` for API URLs instead of hardcoding
3. **Error Handling**: User-friendly error messages in UI
4. **Resume Export**: PDF generation from HTML content
5. **Authentication**: User accounts to save resumes

### Medium Priority
6. **Database**: Replace JSON cache with PostgreSQL/Redis
7. **File Storage**: S3/Cloud storage for uploaded PDFs
8. **Rate Limiting**: Prevent API abuse
9. **Tests**: Backend unit tests, frontend integration tests
10. **Resume Templates**: Multiple design options

### Low Priority
11. **DOCX Support**: Accept Word documents
12. **Multi-language**: Support international resumes
13. **AI Suggestions**: Real-time improvement suggestions
14. **Collaboration**: Share resumes with mentors for feedback
15. **Analytics**: Track resume optimization metrics

---

## Common Development Tasks

### Add a New LLM Provider
1. Create class in `backend/provider.py` extending `LLMProvider`
2. Implement `generate(prompt, max_tokens)` method
3. Add to `providers` dict in `get_llm_provider()`
4. Update `.env` with API key
5. Change `main.py:11` to use new provider

### Add a New Resume Section
1. Update `ResumeSection` type in `resume-helper/src/types/resume.ts`
2. Add LLM prompt in `backend/main.py`
3. Update `ResumeData` interface
4. Add to `resumeStore.ts` state
5. Create UI component in `resume-helper/src/components/resume/`

### Modify Course Scraping Logic
1. Edit `backend/course_scraper.py`
2. Update `extractCourses()` LLM prompt
3. Clear cache: `rm backend/cache/*.json`
4. Test with various universities

### Change Resume HTML Structure
1. Modify prompts in `backend/main.py` (search for "OUTPUT FORMAT:")
2. Update `ResumeBlock.content` rendering in `ResumePreview.tsx`
3. Test with sample resumes

---

## Performance Considerations

### LLM API Calls per Resume Upload
- **6 LLM calls total**:
  1. Metadata extraction (college, major, year)
  2. Header HTML generation
  3. Projects HTML generation
  4. Skills HTML generation
  5. Experience HTML generation
  6. Education HTML generation

- **1 additional LLM call** for course scraping (if not cached)

**Optimization Ideas**:
- Batch prompts into single LLM call
- Use cheaper models for simple extraction
- Implement prompt caching (Anthropic)

### Caching Strategy
- Course data cached indefinitely (manual invalidation)
- Cache hit rate ~90% for common schools/majors
- No TTL implemented

**Production TODO**: Add cache expiration and invalidation strategy

---

## Security Considerations

### Current Issues
1. **No authentication**: Anyone can upload and process resumes
2. **No file scanning**: PDFs not checked for malware
3. **API keys in .env**: Not using secrets management
4. **CORS wide open**: Allows all headers/methods
5. **No rate limiting**: Vulnerable to DoS
6. **Uploaded files in memory**: Not cleaned up

### Hardening Checklist
- [ ] Add authentication (JWT, OAuth)
- [ ] Implement file virus scanning
- [ ] Use AWS Secrets Manager / HashiCorp Vault
- [ ] Restrict CORS to specific headers
- [ ] Add rate limiting middleware
- [ ] Delete uploaded PDFs after processing
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (when database added)
- [ ] HTTPS in production

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Install Poetry: `pip install poetry`
- Install dependencies: `cd backend && poetry install`
- Check `.env` file exists with API keys

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Install pnpm: `npm install -g pnpm`
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `pnpm install`

### CORS errors
- Verify backend is running on port 8000
- Check frontend URL in `backend/main.py:16`
- Browser may cache CORS headers (hard refresh)

### Course scraping fails
- Check SerpAPI key and quota
- Verify internet connection
- Check cache: `ls backend/cache/`
- Try different university name format

### LLM errors
- Verify API keys in `.env`
- Check API quota/billing
- Try different provider in `main.py:11`
- Check prompt length (may exceed token limit)

---

## Git Workflow

**Current Branch**: `main-dev`
**Main Branch**: `main`

**Recent Commits**:
```
123e131 - changing start script
524c45a - connected miguel frontend and backend
19759fc - Redendering Course Options
9bc0e15 - printing bug fixed. logger used
9c4c34f - bug fixed
```

**Modified Files**: `start.sh`

---

## Contact & Contribution

**Author**: Pablo Leyva (Ex-FAANG Engineer)
**License**: See LICENSE file

For questions about architectural decisions or to propose changes, please refer to this documentation first.

---

## Glossary

- **LLM**: Large Language Model (GPT-4, Claude, Gemini)
- **SerpAPI**: Search Engine Results Page API (Google search)
- **Zustand**: Lightweight state management library
- **PyMuPDF**: Python library for PDF processing (alias: fitz)
- **CORS**: Cross-Origin Resource Sharing
- **MVP**: Minimum Viable Product
- **ABC**: Abstract Base Class (Python)

---

**Last Updated**: 2025-10-06
**Documentation Version**: 1.0

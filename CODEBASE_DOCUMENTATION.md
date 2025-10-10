# Mentór - Codebase Structure Documentation

## Project Overview

**Mentór** is an AI-powered resume building and analysis platform designed to help candidates create professional resumes. The platform consists of:

1. **Backend (FastAPI)**: Python-based API server that processes PDF resumes, extracts information using LLMs, and scrapes university course catalogs
2. **Frontend (Next.js)**: Complete application featuring resume upload, course analysis, and interactive resume editing with AI assistance

**Mission**: "Ex-FAANG engineer wants to give everyone a chance" - democratizing access to professional resume building.

---

## Implementation Status

### Mentor Feature Requirements Progress: ~30%

Reference: See `mentor-feature-doc.md` for complete feature requirements.

| Feature Requirement | Phase | Status | Notes |
|---------------------|-------|--------|-------|
| **Phase 1: Onboarding & Data Collection (40%)** |
| FR-1.1 Upload Interface | 1 | ✅ Complete | PDF only, DOCX missing |
| FR-1.2 Data Extraction | 1 | ✅ Complete | 5 sections extracted |
| FR-1.3 Missing Info Prompts | 1 | ❌ Not Implemented | No UI for manual correction |
| FR-2.1 School/Major Confirmation | 1 | ❌ Not Implemented | Auto-extracted only |
| FR-2.2 Academic Standing | 1 | ❌ Not Implemented | |
| **Phase 2: Course Selection (50%)** |
| FR-3.1 Course List Generation | 2 | ✅ Complete | AI-scraped catalogs |
| FR-3.2 Course Selection UI | 2 | ⚠️ Partial | Checkboxes + Clear All only |
| FR-3.3 Alternative Input | 2 | ❌ Not Implemented | No transcript upload |
| FR-3.4 Course-Project Association | 2 | ❌ Not Implemented | |
| FR-3.5 Project Details Collection | 2 | ❌ Not Implemented | |
| **Phase 3: Interactive Resume Editing (60%)** |
| FR-4.1 Section Block Display | 3 | ✅ Complete | 5 sections rendered |
| FR-4.2 Drag-Drop Reordering | 3 | ✅ Complete | Full @dnd-kit integration |
| FR-4.3 Edit Mode Activation | 3 | ✅ Complete | Slide animation working |
| FR-4.4 Inline Editing | 3 | ⚠️ Partial | Limited to text fields, not HTML |
| FR-4.5 Bullet Point Management | 3 | ❌ Not Implemented | No CRUD operations |
| FR-4.6 Context-Aware Tips | 3 | ✅ Complete | AI helper panel active |
| FR-4.7 AI Suggestions | 3 | ⚠️ Partial | Only "Rephrase" works |
| FR-4.8 Interactive Suggestion Flow | 3 | ❌ Not Implemented | No multiple options |
| FR-4.9 Manual Enhancement | 3 | ❌ Not Implemented | No verb bank |
| **Phase 4: Experience Enhancement (0%)** |
| FR-5.x All Features | 4 | ❌ Not Implemented | |
| **Phase 5: Skills Synthesis (0%)** |
| FR-6.1 Skills Extraction | 5 | ✅ Complete | From experience/projects |
| FR-6.2 Skills Organization | 5 | ✅ Complete | Categorized output |
| FR-6.3 Skills Validation | 5 | ❌ Not Implemented | Backend ready, not wired |
| **Phase 6: Resume Export (0%)** |
| FR-7.1 Preview Modes | 6 | ⚠️ Partial | Edit mode only |
| FR-7.2 Export Options | 6 | ❌ Not Implemented | No LaTeX/PDF export |
| **Phase 7: Career Planning (0%)** |
| FR-8.x All Features | 7 | ❌ Not Implemented | |
| **Phase 8: Project Recommendations (0%)** |
| FR-9.x All Features | 8 | ❌ Not Implemented | |

### Critical Gaps
- **Phases 4-8**: Completely unimplemented (70% of Mentor spec)
- **PDF Export**: Blocking production use
- **Authentication**: No user accounts
- **Skills Validation**: Backend exists but not connected to UI

---

## Architecture Overview

```
Mentór/
├── backend/              # FastAPI server (Python)
├── frontend/             # Complete Next.js application with resume editing
├── start.sh             # Startup script for both frontend and backend
└── README.md
```

### System Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│              Port: 3000                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Resume Upload & Analysis    │   │
│  │     - PDF Upload                │   │
│  │     - Course Requirements       │   │
│  │     - Course Selection          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Interactive Resume Editor   │   │
│  │     - Drag & Drop Sections      │   │
│  │     - Inline Text Editing       │   │
│  │     - AI Suggestions Panel      │   │
│  │     - Real-time Preview         │   │
│  └─────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │
              │    HTTP Requests
              │
              ▼
┌─────────────────────────────────────────┐
│         Backend (FastAPI)               │
│            Port: 8000                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      LLM Providers              │   │
│  │      - OpenAI                   │   │
│  │      - Anthropic                │   │
│  │      - Gemini                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Course Scraper             │   │
│  │      - SerpAPI                  │   │
│  │      - BeautifulSoup            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Cache (JSON)               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Backend (FastAPI)

**Tech Stack**: Python 3.9+, FastAPI, Poetry, PyMuPDF, BeautifulSoup4, SerpAPI, OpenAI/Anthropic/Gemini

### Core Files

- **`main.py`** (698 lines): FastAPI app with 9 API endpoints. Handles PDF upload, LLM processing pipeline (5 sections), resume persistence (JSON files), and quota-exceeded fallbacks.

- **`provider.py`** (96 lines): LLM provider abstraction using Strategy pattern. Supports OpenAI GPT-4o (default), Anthropic Claude Sonnet 4, and Gemini 2.0 Flash. Switch providers via `get_llm_provider(provider="openai")`.

- **`course_scraper.py`** (215 lines): AI-powered course catalog scraper. Uses SerpAPI for search, BeautifulSoup for HTML cleaning, and LLM for extraction. Implements cache-first strategy with 30-day expiry.

- **`extract.py`** (36 lines): LLM response parsing utilities. Cleans markdown artifacts and extracts JSON/HTML from AI responses.

- **`cache.py`** (56 lines): File-based JSON cache with automatic expiry (30 days) and corruption handling.

### LLM Processing Pipeline

1. Extract metadata (college, major, graduation year)
2. Scrape course requirements (if school/major detected)
3. Generate 5 HTML sections: header, projects, skills, experience, education
4. Fallback to regex parsing if AI fails
5. Save to `/backend/resumes/{uuid}.json`

---

## Frontend (Next.js)

**Tech Stack**: Next.js 15.5.4, React 19, TypeScript, Tailwind CSS 4, @dnd-kit, Lucide Icons

### Pages

**`/` (Upload Page)** - Main entry point. Drag-and-drop PDF upload, displays 5 extracted resume sections, shows course selection with multi-select checkboxes. Uses localStorage to pass data to editor. Implements FR-1.1, FR-1.2, FR-3.1, FR-3.2 (partial).

**`/resume-editor` (Editor Page)** - Interactive resume editor with drag-and-drop section reordering (@dnd-kit), slide-in AI helper panel (60/40 split), and editing toolbar. Loads data from localStorage, saves to both localStorage and backend. Implements FR-4.2, FR-4.3, FR-4.6, FR-4.7 (partial).

### Components

**Resume Editing** (`/components/resume/`):
- `ResumeSection.tsx`: Sortable resume sections with HTML rendering
- `EditableText.tsx`: Click-to-edit with keyboard shortcuts (Enter/Escape)
- `AIHelperPanel.tsx`: Context-aware tips and AI suggestions
- `EditingToolbar.tsx`: Floating toolbar for text improvements

**Course Selection** (`/components/`):
- `CourseList.tsx`: Multi-select checkboxes with Clear All button
- `CourseBox.tsx`: Individual course card

### User Flow

1. Upload PDF → Extract 5 sections → Display course catalog
2. Select courses → Navigate to editor (`?id={uuid}`)
3. Drag sections → Click to edit → Get AI suggestions → Save

---

## Data Flow

### Resume Processing Flow

```
┌────────────────────────────────────────────────────────────────┐
│ 1. User Uploads PDF Resume (Frontend)                          │
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
│    Upload Page:                                                │
│    → Display extracted text                                    │
│    → Show course list with checkboxes                          │
│    → Navigate to resume editor                                 │
│                                                                 │
│    Resume Editor:                                              │
│    → Transform to editable sections                            │
│    → Enable drag-and-drop reordering                           │
│    → Provide inline text editing                               │
│    → Show AI suggestions panel                                 │
│    → Real-time preview updates                                 │
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

### 3. **Integrated Frontend Application**
**Decision**: Single Next.js app with multiple routes
**Rationale**:
- Upload page for resume processing and course analysis
- Resume editor page for interactive editing with AI assistance
- Seamless navigation between upload and editing workflows
**Benefits**: Simplified deployment, shared components, unified state management

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
**Decision**: Local React state with @dnd-kit for drag-and-drop
**Rationale**:
- Simpler for single-page editing workflow
- No external state management needed
- Direct integration with drag-and-drop library
- Reduced bundle size

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
npm install
npm run dev  # Port 3000
```

---

## API Endpoints

| Endpoint | Method | Purpose | Mentor Feature |
|----------|--------|---------|----------------|
| `/` | GET | Health check | - |
| `/upload-resume` | POST | Process PDF, extract 5 sections | FR-1.2 |
| `/update-section` | PUT | Update individual section HTML | FR-4.4 |
| `/resume/{resume_id}` | GET | Retrieve saved resume | - |
| `/parse-section` | POST | Re-parse section with AI + fallback | - |
| `/validate-section` | POST | Check section completeness | FR-6.3 (not wired) |
| `/integrate-courses` | POST | Add courses to education | FR-3.2 |
| `/improve-text` | POST | AI text improvements (4 types) | FR-4.7 |
| `/update-field` | POST | Granular field-level updates | - |

**Total**: 9 endpoints  
**Interactive Documentation**: http://localhost:8000/docs (FastAPI auto-generated with request/response schemas)

---

## Testing

### Backend
No tests currently implemented

**TODO**: Add pytest tests for:
- PDF extraction
- LLM response parsing
- Course scraping
- Cache operations

### Frontend
**Framework**: No testing framework currently configured

**TODO**: Add testing framework (Jest + Testing Library or Vitest)

---

## Roadmap to Complete Mentor Spec

Reference: `mentor-feature-doc.md` for detailed feature requirements.

### Phase 1 Completion (Onboarding - 60% remaining)
- **FR-1.3**: Missing info prompts - Add input fields if school/major/year not detected
- **FR-2.1**: Education verification UI - Dropdown for school, search for major
- **FR-2.2**: Academic standing calculator - Determine semester based on grad year

### Phase 2 Completion (Course Selection - 50% remaining)
- **FR-3.2**: Search/filter for courses - Add search bar and Select All button  
- **FR-3.3**: Transcript upload - Auto-detect courses from academic PDF
- **FR-3.4-3.5**: Course-project association - Link projects to courses with GitHub URLs

### Phase 3 Completion (Resume Editing - 40% remaining)
- **FR-4.4**: Full inline editing - Make HTML sections editable (currently only text fields work)
- **FR-4.5**: Bullet point CRUD - Add/delete/reorder bullets within sections
- **FR-4.7**: Multiple AI suggestions - Show 2-3 rewrite options, not just 1
- **FR-4.8**: Interactive suggestion flow - "Use This" vs "Keep Original" buttons
- **FR-4.9**: Manual enhancement tools - Action verb bank, example bullet points

### Phase 4: Experience Enhancement (100% remaining)
- **FR-5.1-5.3**: Experience level detection and enhancement prompts
- **FR-5.4-5.5**: Leadership experience templates and guided questions

### Phase 5: Skills Synthesis (33% remaining)
- **FR-6.3**: Skills validation - Cross-check skills appear in resume body (backend ready, needs UI)

### Phase 6: Resume Export (100% remaining)
- **FR-7.1**: Preview modes - Print preview and mobile view
- **FR-7.2**: Export options - LaTeX template, PDF, clipboard copy (CRITICAL)

### Phase 7: Career Planning (100% remaining)
- **FR-8.1-8.3**: Job interest prompts, AI recommendations, gap analysis

### Phase 8: Project Recommendations (100% remaining)
- **FR-9.1-9.4**: Tailored project ideas by duration (1-week, 2-week, 1-month)

### Infrastructure (Not in Mentor Spec but Required)
1. Authentication - NextAuth.js + JWT for user accounts
2. Database - PostgreSQL to replace JSON files
3. PDF Export Library - jsPDF or Puppeteer for FR-7.2
4. Testing - pytest + Jest for reliability

---

## Performance Notes

**LLM Usage**: 6 API calls per resume upload (metadata + 5 sections), plus 1 for course scraping if not cached. Consider batching prompts or using cheaper models for simple extraction.

**Caching**: Course catalogs cached 30 days. ~90% hit rate for common schools. Auto-cleanup of expired files.

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

## Production Readiness Assessment

### Critical Blockers (MUST FIX before production)

1. **No Authentication** - Anyone can access any resume. Need NextAuth.js + JWT.
2. **No PDF Export** (FR-7.2) - Blocking core Mentor feature. Users cannot download final resume.
3. **CORS Wide Open** - Allows all origins (`*`). Must whitelist production domain only.
4. **No File Virus Scanning** - Malicious PDFs could compromise server.
5. **API Keys in .env** - Risk of git commits. Migrate to AWS Secrets Manager.

### Known Bugs

1. **HTML Sections Not Editable** - EditableText only works on plain text, not HTML content from LLM
2. **Toolbar Positioning** - May go off-screen on small displays
3. **Partial Button Wiring** - Only "Rephrase" button works; Grammar/Action Verb are UI-only
4. **Section Reorder Not Saved** - Drag-and-drop changes lost unless user clicks "Save"
5. **LocalStorage Limit** - Large resumes (>5MB) will silently fail to save

### Technical Debt (Top Priority)

1. **Hardcoded API URLs** - `localhost:8000` in 6+ files. Use `NEXT_PUBLIC_API_URL` env var.
2. **No Rate Limiting** - Vulnerable to DoS and excessive LLM API costs.
3. **XSS Risk** - Using `dangerouslySetInnerHTML` without DOMPurify sanitization.

---

## Quick Troubleshooting

**Backend won't start**: Check Python 3.9+, run `cd backend && poetry install`, verify `.env` has API keys.

**Frontend won't start**: Check Node 18+, run `cd frontend && npm install`, clear `.next` cache.

**CORS errors**: Verify backend on port 8000, frontend on port 3000, try hard refresh.

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
- **@dnd-kit**: Drag and drop library for React
- **PyMuPDF**: Python library for PDF processing (alias: fitz)
- **CORS**: Cross-Origin Resource Sharing
- **MVP**: Minimum Viable Product
- **ABC**: Abstract Base Class (Python)

---

**Last Updated**: 2025-10-08
**Documentation Version**: 3.0 (Simplified, Mentor-focused)
**Mentor Spec Completion**: 30% (Phases 1-3 partial, Phases 4-8 not implemented)
**Production Ready**: No (see Production Readiness Assessment)

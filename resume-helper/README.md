# Resume Helper MVP

A React-based resume editing application with AI-powered suggestions and drag-and-drop functionality.

## Features

### ✅ Implemented Features

- **File Upload Screen**: Drag-and-drop file upload with PDF validation
- **Resume Preview**: Interactive resume blocks with hover effects
- **Drag-and-Drop Reordering**: Smooth reordering of resume sections
- **Edit Mode**: Click-to-edit functionality with panel transitions
- **AI Helper Panel**: Context-aware suggestions for different resume sections
- **Responsive Design**: Mobile-friendly layout
- **TypeScript**: Full type safety throughout the application

### 🎯 Feature Requirements Met

- **FR-1.1**: Section highlighting on hover ✅
- **FR-1.2**: Drag-and-drop reordering with visual feedback ✅
- **FR-1.3**: Smooth reflow animations ✅
- **FR-2.1**: Edit mode transitions with panel animations ✅
- **FR-2.2**: Direct in-line editing (UI ready) ✅
- **FR-2.3**: Contextual editing toolbar (static for prototype) ✅
- **FR-3.1**: AI Helper panel with synchronized animations ✅
- **FR-3.2**: Context-aware content (simulated) ✅
- **FR-3.3**: Interactive suggestions (pre-scripted) ✅

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Framer Motion** for animations
- **React Dropzone** for file uploads
- **Vitest** for testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Development Server

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── resume/          # Resume-specific components
│   └── screens/         # Main screen components
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
├── types/               # TypeScript type definitions
├── constants/           # Static data and configurations
├── lib/                 # Utility functions
└── __tests__/           # Test files
```

## Usage

1. **Upload Files**: Drag and drop PDF files (resume, transcript, projects)
2. **Analyze**: Click "Analyze & Build My Resume" to process documents
3. **Edit Mode**: Click on any resume section to enter edit mode
4. **Reorder**: Drag and drop sections to reorder them
5. **AI Suggestions**: Use the AI helper panel for improvement suggestions
6. **Confirm**: Mark sections as confirmed when satisfied

## Key Components

### ResumeBlock
- Draggable resume sections with hover effects
- Confirmation state management
- Click-to-edit functionality

### AIHelperPanel
- Context-aware suggestions based on active section
- Smooth slide-in animations
- Pre-scripted improvement actions

### FileDropzone
- PDF file validation
- Drag-and-drop support
- Upload state management

## State Management

The application uses Zustand for state management with three main stores:

- **uploadStore**: File upload state and validation
- **resumeStore**: Resume data and section management
- **editModeStore**: Edit mode and panel visibility

## Styling

The application uses Tailwind CSS with custom CSS for complex animations. Key design tokens:

- Primary: `#4F46E5` (Indigo)
- Success: `#10B981` (Emerald)
- Warning: `#F59E0B` (Amber)
- Background: `#F9FAFB` (Gray 50)

## Testing

Run tests with:

```bash
npm run test
```

Tests cover:
- Component rendering
- User interactions
- State management
- Utility functions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License
# Cursor Prompting Feature - Quick Setup Guide

## Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed (optional, for Next.js frontend)
- Git repository cloned

## Backend Setup (Required)

### 1. Install Dependencies
```bash
cd backend
pip3 install fastapi pydantic uvicorn python-dotenv anthropic openai google-generativeai PyMuPDF beautifulsoup4 requests google-search-results
```

### 2. Configure Environment
Create `backend/.env` file:
```bash
# For testing (mock responses)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
SERPAPI_API_KEY=your_serpapi_key_here

# For production - replace with real API keys
# OPENAI_API_KEY=sk-proj-...
# ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start Backend Server
```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

The server will start at `http://localhost:8000`

## Frontend Setup (Optional)

### Option 1: Next.js Integration
```bash
cd frontend
npm install
npm run dev  # May have compatibility issues
```

### Option 2: Standalone Test Page (Recommended)
Simply open `frontend/test-cursor-prompting.html` in your browser.

## Testing the Feature

### 1. Test Backend API
```bash
curl -X POST "http://localhost:8000/api/prompts/cursor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-12345" \
  -d '{"prompt": "How can I improve my resume?"}'
```

Expected response:
```json
{
  "response": "Mock response for prompt: You are an AI assistant...",
  "timestamp": 1759791421.246912,
  "cached": false,
  "processing_time_ms": 0
}
```

### 2. Test Rate Limiting
Run the curl command 10+ times quickly to see rate limiting in action.

### 3. Test Frontend
1. Ensure backend is running on port 8000
2. Open `frontend/test-cursor-prompting.html` in browser
3. Enter a prompt and click "Ask AI"
4. Verify response appears

## Production Setup

### 1. Add Real API Keys
Update `backend/.env` with actual API keys:
```bash
OPENAI_API_KEY=sk-proj-your-real-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
```

### 2. Security Enhancements
- Implement proper JWT token validation
- Use Redis for distributed rate limiting
- Add HTTPS enforcement
- Set up monitoring and logging

### 3. Performance Optimizations
- Configure Redis for caching
- Set up load balancing
- Monitor API costs and usage

## Troubleshooting

**Backend won't start**: Check Python version and install all dependencies

**"Module not found" errors**: Install missing packages with pip3

**Authentication errors**: Ensure Authorization header includes "Bearer " prefix

**Rate limiting**: Wait 5 minutes between test batches

**Frontend issues**: Use the standalone HTML test page instead of Next.js

## Quick Verification Checklist

- [ ] Backend starts without errors
- [ ] API endpoint responds to curl test
- [ ] Rate limiting works (blocks after 10 requests)
- [ ] Frontend test page loads and works
- [ ] Error handling works (try invalid requests)

## Next Steps

1. **Development**: Use mock responses for development and testing
2. **Staging**: Add real API keys for staging environment testing
3. **Production**: Implement all security and performance enhancements

For detailed information, see `CURSOR_PROMPTING_IMPLEMENTATION.md`.
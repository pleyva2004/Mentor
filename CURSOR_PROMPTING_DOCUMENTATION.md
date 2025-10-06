# Cursor Prompting Feature Documentation

## Overview

The Cursor Prompting feature provides real-time, context-aware AI assistance within the Mentor MVP application. This feature enables users to get instant help with resume optimization, course selection, and career guidance through a conversational interface.

**Feature Status**: ✅ Implemented and Tested  
**Implementation Date**: October 6, 2025  
**Version**: 1.0.0

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [API Reference](#api-reference)
5. [Security Features](#security-features)
6. [Performance Optimizations](#performance-optimizations)
7. [Testing](#testing)
8. [Deployment Guide](#deployment-guide)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

### System Design

```
┌─────────────────────┐         ┌──────────────────────┐
│   Frontend Apps     │         │   Resume-Helper App  │
│   (Next.js)         │         │      (Next.js)       │
│                     │         │                      │
│ ┌─────────────────┐ │         │ ┌──────────────────┐ │
│ │ CursorPrompt    │ │         │ │ CursorPrompt     │ │
│ │ Component       │ │         │ │ Component        │ │
│ └────────┬────────┘ │         │ └────────┬─────────┘ │
└──────────┼──────────┘         └──────────┼───────────┘
           │                               │
           └───────────┬───────────────────┘
                       │ HTTPS
                       ▼
        ┌──────────────────────────────┐
        │   FastAPI Backend            │
        │                              │
        │  ┌────────────────────────┐  │
        │  │ Cursor Prompting API   │  │
        │  │ /api/prompts/cursor    │  │
        │  │ /api/prompts/suggestions│  │
        │  └───────────┬────────────┘  │
        │              │               │
        │  ┌───────────▼────────────┐  │
        │  │  PromptingService      │  │
        │  │  - Context handling    │  │
        │  │  - Prompt engineering  │  │
        │  │  - Caching            │  │
        │  └───────────┬────────────┘  │
        │              │               │
        │  ┌───────────▼────────────┐  │
        │  │   LLM Providers        │  │
        │  │  - OpenAI (default)    │  │
        │  │  - Anthropic          │  │
        │  │  - Google Gemini      │  │
        │  └────────────────────────┘  │
        └──────────────────────────────┘
```

### Key Components

1. **Frontend Components**
   - `CursorPrompt.tsx`: Main UI component with chat interface
   - Context-aware state management
   - Real-time response handling

2. **Backend Services**
   - `prompting.py`: Core service logic
   - `cursor_prompts.py`: Prompt templates and engineering
   - `security.py`: Authentication and rate limiting
   - `performance.py`: Caching and optimization

3. **Integration Points**
   - Seamless integration with existing resume upload flow
   - Context sharing with course selection
   - Session continuity across pages

## Backend Implementation

### File Structure

```
backend/
├── prompting.py           # Main prompting service
├── cursor_prompts.py      # Prompt templates and strategies
├── security.py            # Security utilities
├── performance.py         # Performance optimization
├── test_prompting.py      # Unit tests
├── test_api_integration.py # Integration tests
└── test_security.py       # Security tests
```

### Core Service (`prompting.py`)

The `PromptingService` class handles all cursor prompting logic:

```python
class PromptingService:
    async def process_prompt(self, request: CursorPromptRequest) -> CursorPromptResponse:
        """Process a cursor prompt with context awareness and caching"""
        # 1. Generate semantic cache key
        # 2. Check cache for existing response
        # 3. Construct specialized prompt based on context
        # 4. Generate response using LLM
        # 5. Cache response for future use
        # 6. Return response with metadata
```

### Prompt Engineering (`cursor_prompts.py`)

Specialized prompts for different contexts:

- **General Assistance**: Basic help and guidance
- **Resume Editing**: ATS optimization, formatting, content improvement
- **Course Selection**: Academic advising, skill mapping
- **Section-Specific**: Tailored advice for each resume section

Example prompt template:
```python
SECTION_PROMPTS = {
    "experience": """When reviewing experience:
    - Start each bullet with a strong action verb
    - Quantify achievements wherever possible
    - Focus on impact and results, not just duties
    - Use STAR method (Situation, Task, Action, Result)
    - Tailor descriptions to target role
    - Recommend 3-5 bullets per position"""
}
```

### Security Implementation (`security.py`)

#### Authentication
- Bearer token authentication (JWT ready)
- Token validation on all endpoints
- Session management

#### Rate Limiting
- 30 requests/minute for cursor prompts
- 60 requests/minute for suggestions
- Per-user tracking with token identification

#### Input Sanitization
- HTML escaping to prevent XSS
- Control character removal
- Context whitelisting
- Prompt length validation (max 1000 chars)

### Performance Optimizations (`performance.py`)

#### Advanced Caching System
- Semantic cache key generation
- LRU eviction policy
- TTL-based expiration (1 hour default)
- Hit rate tracking and metrics

#### Response Optimization
- Response preview for quick display
- Async processing with thread pool
- Performance monitoring and metrics
- Background cache cleanup

## Frontend Implementation

### Component Architecture

#### Main Frontend (`frontend/src/components/CursorPrompt.tsx`)
```typescript
interface CursorPromptProps {
  currentSection?: string;
  context?: Record<string, any>;
  authToken?: string;
}
```

Features:
- Floating action button
- Expandable chat panel
- Suggestion display
- Real-time response streaming
- Error handling with retry

#### Resume Helper (`resume-helper/src/components/ui/CursorPrompt.tsx`)
- Integrated with resume editing workflow
- Section-aware context
- Tracks confirmation status
- Synced with edit mode state

### State Management

Context tracked includes:
- Current page/section
- User data (sanitized)
- Selected courses
- Resume upload status
- Section confirmation status

## API Reference

### POST `/api/prompts/cursor`

Process a cursor prompt request.

**Request Body:**
```json
{
  "prompt": "How can I improve my skills section?",
  "context": {
    "current_section": "skills",
    "current_page": "/edit",
    "user_data": {
      "major": "Computer Science"
    }
  },
  "session_id": "optional-session-id",
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "response": "To improve your skills section...",
  "session_id": "generated-or-provided-session-id",
  "timestamp": "2025-10-06T12:00:00Z",
  "tokens_used": 150,
  "cached": false,
  "response_preview": "To improve your skills section...",
  "response_time_ms": 250
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request (empty prompt, invalid session ID)
- 403: Authentication failed
- 429: Rate limit exceeded
- 500: Server error

### GET `/api/prompts/suggestions`

Get contextual prompt suggestions.

**Query Parameters:**
- `current_section` (optional): Current resume section

**Response:**
```json
{
  "suggestions": [
    "How can I make my project descriptions more impactful?",
    "What technical details should I include?",
    "How do I highlight the business value?",
    "Should I include personal projects?"
  ]
}
```

### GET `/api/prompts/performance`

Get performance metrics (requires authentication).

**Response:**
```json
{
  "cache": {
    "size": 245,
    "max_size": 5000,
    "hit_rate": 78.5,
    "total_hits": 1523,
    "avg_age_seconds": 1820.5
  },
  "performance": {
    "avg_response_time": 0.245,
    "p95_response_time": 0.890,
    "avg_prompt_length": 42,
    "avg_tokens_used": 175
  },
  "timestamp": "2025-10-06T12:00:00Z"
}
```

## Security Features

### 1. Authentication & Authorization
- Bearer token required for all endpoints
- JWT validation ready (currently using simple token check)
- Per-user session tracking

### 2. Rate Limiting
- Configurable limits per endpoint
- Token-based user identification
- Headers indicate limit status:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp for limit reset

### 3. Input Validation & Sanitization
- Maximum prompt length: 1000 characters
- HTML/script tag escaping
- Control character removal
- Context field whitelisting
- Session ID format validation

### 4. Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Performance Optimizations

### 1. Intelligent Caching
- **Semantic Key Generation**: Cache based on normalized prompt + context
- **Cache Eligibility**: Skip personal/sensitive prompts
- **LRU Eviction**: Maintain optimal cache size
- **TTL Management**: Automatic expiration

### 2. Response Optimization
- **Preview Generation**: Show first 200 chars immediately
- **Async Processing**: Non-blocking LLM calls
- **Connection Pooling**: Efficient API communication

### 3. Monitoring & Metrics
- Average response time tracking
- P95 latency monitoring
- Cache hit rate analysis
- Token usage tracking

### 4. Frontend Optimizations
- Debounced API calls
- Optimistic UI updates
- Response streaming simulation
- Local suggestion caching

## Testing

### Unit Tests (`test_prompting.py`)
- Cache key generation
- Prompt construction
- Context sanitization
- Error handling

### Integration Tests (`test_api_integration.py`)
- Full API flow testing
- Authentication verification
- Rate limit enforcement
- CORS configuration

### Security Tests (`test_security.py`)
- Input sanitization
- XSS prevention
- Rate limiter accuracy
- Token validation

### E2E Tests (Cypress)
- User interaction flows
- Context awareness
- Error scenarios
- Performance validation

### Running Tests

Backend:
```bash
cd backend
./run_tests.sh
```

Frontend E2E:
```bash
./run-e2e-tests.sh
```

## Deployment Guide

### Prerequisites
1. Python 3.9+ with Poetry
2. Node.js 18+ with npm/pnpm
3. Environment variables configured
4. LLM provider API keys

### Environment Variables

Add to `backend/.env`:
```env
# Existing variables...

# LLM Provider (already configured)
OPENAI_API_KEY=sk-...

# Optional: Rate limiting config
CURSOR_PROMPT_RATE_LIMIT=30
CURSOR_PROMPT_WINDOW_SECONDS=60

# Optional: Cache settings
CURSOR_PROMPT_CACHE_SIZE=5000
CURSOR_PROMPT_CACHE_TTL=3600
```

### Deployment Steps

1. **Install Dependencies**
   ```bash
   cd backend
   poetry install
   
   cd ../frontend
   npm install
   
   cd ../resume-helper
   npm install
   ```

2. **Run Migrations** (if database changes)
   ```bash
   # No database changes required for this feature
   ```

3. **Start Services**
   ```bash
   # Using the existing start script
   ./start.sh
   ```

4. **Verify Deployment**
   - Check `/api/prompts/performance` endpoint
   - Test cursor prompt functionality
   - Monitor error logs

### Production Considerations

1. **Authentication**: Implement proper JWT validation
2. **Rate Limiting**: Use Redis for distributed rate limiting
3. **Caching**: Consider Redis/Memcached for production cache
4. **Monitoring**: Set up APM and error tracking
5. **Scaling**: Use connection pooling for LLM providers

## Configuration

### LLM Provider Selection

In `backend/main.py`:
```python
client = get_llm_provider(provider="openai")  # or "anthropic", "gemini"
```

### Cache Configuration

In `backend/performance.py`:
```python
prompt_cache = AdvancedCache(
    max_size=5000,      # Maximum cached entries
    default_ttl=3600    # TTL in seconds
)
```

### Rate Limit Configuration

In `backend/security.py`:
```python
prompt_rate_limiter = RateLimiter(
    max_requests=30,    # Requests per window
    window_seconds=60   # Window duration
)
```

### Prompt Customization

Edit `backend/cursor_prompts.py` to modify:
- System prompts
- Section-specific guidance
- Context enhancers
- Suggestion generation

## Troubleshooting

### Common Issues

1. **"Rate limit exceeded" errors**
   - Check rate limit configuration
   - Verify token identification
   - Consider increasing limits

2. **Slow response times**
   - Check cache hit rate: `/api/prompts/performance`
   - Verify LLM provider latency
   - Enable response preview

3. **Authentication failures**
   - Verify Bearer token is sent
   - Check CORS configuration
   - Validate token format

4. **Context not updating**
   - Verify context is properly sanitized
   - Check frontend state management
   - Enable debug logging

### Debug Mode

Enable debug logging:
```python
# In prompting.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

Frontend console logging:
```javascript
// Automatic in development mode
if (process.env.NODE_ENV === 'development') {
  console.log(`Response time: ${data.response_time_ms}ms`);
}
```

### Performance Debugging

1. Check cache metrics:
   ```bash
   curl -H "Authorization: Bearer token" \
     http://localhost:8000/api/prompts/performance
   ```

2. Monitor rate limits:
   - Check `X-RateLimit-*` headers
   - Review rate limit storage

3. Analyze response times:
   - Use performance endpoint
   - Check LLM provider dashboards

## Future Enhancements

### Planned Features

1. **Conversation Memory**
   - Multi-turn conversations
   - Context persistence across sessions
   - Conversation history UI

2. **Advanced Caching**
   - Redis integration
   - Distributed cache
   - Cache warming strategies

3. **Enhanced Security**
   - Full JWT implementation
   - OAuth2 integration
   - Audit logging

4. **Analytics**
   - Usage patterns tracking
   - Popular prompts analysis
   - User satisfaction metrics

5. **UI Improvements**
   - Voice input support
   - Rich text responses
   - Code syntax highlighting
   - Export conversation history

### API Version 2.0

Potential additions:
- Streaming responses
- Multi-language support
- Custom model selection
- Batch prompt processing

## Support & Maintenance

### Monitoring Checklist

Daily:
- [ ] Check error rates
- [ ] Monitor response times
- [ ] Review cache hit rates

Weekly:
- [ ] Analyze usage patterns
- [ ] Update prompt templates
- [ ] Review security logs

Monthly:
- [ ] Performance optimization
- [ ] Cost analysis
- [ ] User feedback review

### Contact

For issues or questions:
- Create GitHub issue
- Review existing documentation
- Check test coverage

---

**Last Updated**: October 6, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
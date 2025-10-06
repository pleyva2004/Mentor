# Cursor Prompting Backend Module

## Quick Start

### Installation
```bash
cd backend
poetry install
```

### Environment Setup
Ensure your `.env` file has:
```
OPENAI_API_KEY=sk-...
# or ANTHROPIC_API_KEY=... or GEMINI_API_KEY=...
```

### Running Tests
```bash
# Run all cursor prompting tests
poetry run pytest test_prompting.py test_api_integration.py test_security.py -v

# Run with coverage
poetry run pytest test_prompting.py -v --cov=prompting --cov=cursor_prompts
```

## Module Structure

```
backend/
├── prompting.py              # Main service (PromptingService class)
├── cursor_prompts.py         # Prompt templates and engineering
├── security.py               # Auth, rate limiting, sanitization
├── performance.py            # Caching and optimization
├── test_prompting.py         # Unit tests
├── test_api_integration.py   # API integration tests
└── test_security.py          # Security tests
```

## Key Features

### 1. Context-Aware Prompting
- Tracks user's current section and page
- Provides specialized advice based on context
- Maintains conversation sessions

### 2. Advanced Security
- Rate limiting: 30 requests/minute per user
- Input sanitization to prevent injection
- Token-based authentication

### 3. Performance Optimization
- Semantic caching with LRU eviction
- Response preview for instant feedback
- Performance metrics tracking

### 4. Flexible LLM Support
- Works with OpenAI, Anthropic, and Google Gemini
- Easy to switch providers
- Consistent interface across providers

## API Endpoints

### POST /api/prompts/cursor
Process a user prompt with context.

Example:
```bash
curl -X POST http://localhost:8000/api/prompts/cursor \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "How can I improve my skills section?",
    "context": {
      "current_section": "skills",
      "current_page": "/edit"
    }
  }'
```

### GET /api/prompts/suggestions
Get contextual prompt suggestions.

Example:
```bash
curl http://localhost:8000/api/prompts/suggestions?current_section=projects \
  -H "Authorization: Bearer your-token"
```

### GET /api/prompts/performance
View performance metrics (cache stats, response times).

Example:
```bash
curl http://localhost:8000/api/prompts/performance \
  -H "Authorization: Bearer your-token"
```

## Configuration

### Change LLM Provider
In `main.py`, update:
```python
client = get_llm_provider(provider="anthropic")  # or "openai", "gemini"
```

### Adjust Rate Limits
In `security.py`:
```python
prompt_rate_limiter = RateLimiter(max_requests=50, window_seconds=60)
```

### Modify Cache Settings
In `performance.py`:
```python
prompt_cache = AdvancedCache(max_size=10000, default_ttl=7200)
```

## Development Tips

### Adding New Prompt Templates
Edit `cursor_prompts.py`:
```python
SECTION_PROMPTS["new_section"] = """
Your specialized guidance here...
"""
```

### Testing Prompts Locally
```python
from prompting import prompting_service, CursorPromptRequest

# Test a prompt
request = CursorPromptRequest(
    prompt="Test question",
    context={"current_section": "skills"}
)
response = await prompting_service.process_prompt(request)
print(response.response)
```

### Monitoring Performance
Check cache hit rate and response times:
```python
from performance import get_performance_stats
stats = get_performance_stats()
print(f"Cache hit rate: {stats['cache']['hit_rate']}%")
print(f"Avg response time: {stats['performance']['avg_response_time']}s")
```

## Troubleshooting

### "Rate limit exceeded"
- User has made too many requests
- Check `X-RateLimit-Remaining` header
- Wait for `X-RateLimit-Reset` time

### Slow responses
- Check if caching is working: `get_performance_stats()`
- Verify LLM provider isn't rate limiting
- Consider adjusting max_tokens

### Authentication errors
- Ensure Bearer token is included
- Token format: `Authorization: Bearer <token>`

## Best Practices

1. **Always sanitize user input** - Already handled by security module
2. **Monitor cache hit rates** - Aim for >70% on common queries
3. **Keep prompts focused** - Shorter, specific prompts work better
4. **Use appropriate context** - Only include relevant context data
5. **Test edge cases** - Empty prompts, long prompts, special characters

## Contributing

1. Add tests for new features
2. Update prompt templates as needed
3. Document any API changes
4. Run full test suite before submitting

For more details, see the full [Cursor Prompting Documentation](../CURSOR_PROMPTING_DOCUMENTATION.md).
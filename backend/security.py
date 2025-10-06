"""
Security utilities for the cursor prompting feature
Includes authentication, rate limiting, and input sanitization
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import re
import html
from collections import defaultdict
import time


# Bearer token authentication
security = HTTPBearer()

# Simple in-memory rate limiting (in production, use Redis)
rate_limit_storage: Dict[str, list] = defaultdict(list)


class RateLimiter:
    """Simple rate limiter for API endpoints"""
    
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
    
    def check_rate_limit(self, identifier: str) -> bool:
        """Check if the identifier has exceeded rate limit"""
        now = time.time()
        
        # Clean old entries
        rate_limit_storage[identifier] = [
            timestamp for timestamp in rate_limit_storage[identifier]
            if now - timestamp < self.window_seconds
        ]
        
        # Check current rate
        if len(rate_limit_storage[identifier]) >= self.max_requests:
            return False
        
        # Add current request
        rate_limit_storage[identifier].append(now)
        return True
    
    def get_reset_time(self, identifier: str) -> int:
        """Get the time when rate limit resets"""
        if not rate_limit_storage[identifier]:
            return 0
        
        oldest_request = min(rate_limit_storage[identifier])
        reset_time = oldest_request + self.window_seconds
        return int(reset_time)


# Create rate limiters for different endpoints
prompt_rate_limiter = RateLimiter(max_requests=30, window_seconds=60)  # 30 requests per minute
suggestions_rate_limiter = RateLimiter(max_requests=60, window_seconds=60)  # 60 requests per minute


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent injection attacks"""
    if not text:
        return ""
    
    # Truncate to max length
    text = text[:max_length]
    
    # Remove any potential HTML/script tags
    text = html.escape(text)
    
    # Remove any control characters except newlines and tabs
    text = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]', '', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text


def sanitize_context(context: Dict) -> Dict:
    """Sanitize context dictionary to prevent data leakage"""
    if not context:
        return {}
    
    # Whitelist of allowed context keys
    allowed_keys = {
        "current_section", "current_page", "has_resume_data",
        "courses_available", "selected_courses", "sections_confirmed",
        "user_data"
    }
    
    # Filter to only allowed keys
    sanitized = {k: v for k, v in context.items() if k in allowed_keys}
    
    # Sanitize user_data if present
    if "user_data" in sanitized and isinstance(sanitized["user_data"], dict):
        allowed_user_fields = {"name", "major", "graduation_year"}
        sanitized["user_data"] = {
            k: sanitize_input(str(v), 100) 
            for k, v in sanitized["user_data"].items() 
            if k in allowed_user_fields
        }
    
    # Sanitize selected courses
    if "selected_courses" in sanitized and isinstance(sanitized["selected_courses"], list):
        sanitized["selected_courses"] = [
            sanitize_input(str(course), 50) 
            for course in sanitized["selected_courses"][:10]  # Limit to 10 courses
        ]
    
    # Sanitize string values
    for key, value in sanitized.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_input(value, 200)
    
    return sanitized


async def verify_token_with_rate_limit(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Verify token and check rate limits"""
    # In production, validate JWT token properly
    if not credentials.credentials:
        raise HTTPException(status_code=403, detail="Invalid authentication credentials")
    
    # Use token as identifier for rate limiting
    # In production, extract user ID from JWT
    identifier = f"token:{credentials.credentials[:20]}"  # Use first 20 chars of token
    
    # Check rate limit for prompt endpoint
    if request.url.path == "/api/prompts/cursor":
        if not prompt_rate_limiter.check_rate_limit(identifier):
            reset_time = prompt_rate_limiter.get_reset_time(identifier)
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
                headers={"X-RateLimit-Reset": str(reset_time)}
            )
    
    # Check rate limit for suggestions endpoint
    elif request.url.path == "/api/prompts/suggestions":
        if not suggestions_rate_limiter.check_rate_limit(identifier):
            reset_time = suggestions_rate_limiter.get_reset_time(identifier)
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
                headers={"X-RateLimit-Reset": str(reset_time)}
            )
    
    return credentials.credentials


def validate_prompt_length(prompt: str, max_length: int = 1000) -> str:
    """Validate and sanitize prompt length"""
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    if len(prompt) > max_length:
        raise HTTPException(
            status_code=400, 
            detail=f"Prompt too long. Maximum length is {max_length} characters"
        )
    
    return sanitize_input(prompt, max_length)


def validate_session_id(session_id: Optional[str]) -> Optional[str]:
    """Validate session ID format"""
    if not session_id:
        return None
    
    # Session ID should be alphanumeric with hyphens, max 50 chars
    if not re.match(r'^[a-zA-Z0-9\-]{1,50}$', session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID format")
    
    return session_id


# Security headers middleware
async def add_security_headers(request: Request, call_next):
    """Add security headers to responses"""
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Add rate limit headers for API endpoints
    if request.url.path.startswith("/api/prompts/"):
        # Get identifier from auth header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            identifier = f"token:{auth_header[7:27]}"  # First 20 chars of token
            
            if "/cursor" in request.url.path:
                remaining = prompt_rate_limiter.max_requests - len(rate_limit_storage.get(identifier, []))
                response.headers["X-RateLimit-Limit"] = str(prompt_rate_limiter.max_requests)
                response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
            elif "/suggestions" in request.url.path:
                remaining = suggestions_rate_limiter.max_requests - len(rate_limit_storage.get(identifier, []))
                response.headers["X-RateLimit-Limit"] = str(suggestions_rate_limiter.max_requests)
                response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
    
    return response
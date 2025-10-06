"""
Cursor Prompting Service for Mentor MVP

This module implements the cursor prompting feature as outlined in the 
"Plan of Action for Cursor Prompting" document. It provides real-time, 
context-aware assistance to users through LLM integration.

Architecture follows the established FastAPI patterns while implementing
the security and performance requirements specified in the plan.
"""

import hashlib
import json
import time
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, validator
from fastapi import HTTPException
from provider import LLMProvider
from cache import get_cache, set_cache


# Data Transfer Objects (DTOs) as specified in the plan
class CursorPromptRequest(BaseModel):
    """
    Request DTO for cursor prompting endpoint.
    
    As specified in section 2.2 of the plan, this should be placed in a 
    shared types folder for type safety between frontend and backend.
    """
    prompt: str = Field(..., min_length=1, max_length=2000, description="User's prompt input")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context data")
    user_id: Optional[str] = Field(default=None, description="User identifier for rate limiting")
    
    @validator('prompt')
    def sanitize_prompt(cls, v):
        """Input sanitization as required in section 5.1"""
        if not v or not v.strip():
            raise ValueError("Prompt cannot be empty")
        
        # Basic sanitization - remove potential injection attempts
        dangerous_patterns = ['<script', 'javascript:', 'eval(', 'exec(']
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError("Prompt contains potentially dangerous content")
        
        return v.strip()


class CursorPromptResponse(BaseModel):
    """
    Response DTO for cursor prompting endpoint.
    """
    response: str = Field(..., description="LLM generated response")
    timestamp: float = Field(..., description="Response generation timestamp")
    cached: bool = Field(default=False, description="Whether response was served from cache")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")


class PromptingService:
    """
    Core prompting service implementing the business logic for cursor prompting.
    
    As specified in section 2.2, this service encapsulates all logic for:
    - Constructing prompts
    - Communicating with LLM providers
    - Processing responses
    """
    
    def __init__(self, llm_provider: LLMProvider):
        self.llm_provider = llm_provider
        self.rate_limits: Dict[str, List[float]] = {}  # Simple in-memory rate limiting
        
    def _generate_cache_key(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate cache key for prompt and context"""
        cache_data = {
            "prompt": prompt,
            "context": context or {}
        }
        cache_string = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_string.encode()).hexdigest()
    
    def _check_rate_limit(self, user_id: str, max_requests: int = 10, window_minutes: int = 5) -> bool:
        """
        Check rate limiting as specified in section 5.2.
        
        Args:
            user_id: User identifier
            max_requests: Maximum requests allowed in window
            window_minutes: Time window in minutes
            
        Returns:
            True if request is allowed, False if rate limited
        """
        current_time = time.time()
        window_seconds = window_minutes * 60
        
        if user_id not in self.rate_limits:
            self.rate_limits[user_id] = []
        
        # Clean old requests outside the window
        self.rate_limits[user_id] = [
            req_time for req_time in self.rate_limits[user_id]
            if current_time - req_time < window_seconds
        ]
        
        # Check if under limit
        if len(self.rate_limits[user_id]) >= max_requests:
            return False
        
        # Add current request
        self.rate_limits[user_id].append(current_time)
        return True
    
    def _construct_system_prompt(self) -> str:
        """
        Construct the system prompt for cursor prompting.
        
        Note: The plan states that prompt engineering strategy cannot be 
        formulated without specific use case definition. This is a generic
        implementation that should be customized based on product requirements.
        """
        return """You are an AI assistant integrated into the Mentor MVP application, designed to help users with resume building and career guidance.

Your role is to provide helpful, accurate, and contextually relevant assistance. Follow these guidelines:

1. **Tone & Style**: Professional yet approachable, concise but thorough
2. **Focus Areas**: Resume optimization, career advice, skill development, job search strategies
3. **Constraints**: 
   - Keep responses under 500 words unless more detail is specifically requested
   - Avoid giving legal, medical, or financial advice
   - Do not make up specific company information or job postings
   - Focus on actionable, practical advice

4. **Context Awareness**: Use any provided context about the user's background, resume, or current situation to personalize your response.

Provide helpful, actionable guidance that helps users improve their professional prospects."""

    def _construct_user_prompt(self, request: CursorPromptRequest) -> str:
        """
        Construct the full user prompt including context.
        
        As noted in section 3.1, contextual data integration requires
        assessment of data privacy and relevance.
        """
        prompt_parts = [request.prompt]
        
        if request.context:
            # Add context information if available
            context_info = []
            
            # Example context fields - customize based on product requirements
            if 'user_background' in request.context:
                context_info.append(f"User Background: {request.context['user_background']}")
            
            if 'current_resume_section' in request.context:
                context_info.append(f"Current Resume Section: {request.context['current_resume_section']}")
            
            if 'career_level' in request.context:
                context_info.append(f"Career Level: {request.context['career_level']}")
            
            if context_info:
                context_str = "\n".join(context_info)
                prompt_parts.insert(0, f"Context:\n{context_str}\n\nUser Question:")
        
        return "\n".join(prompt_parts)
    
    async def process_prompt(self, request: CursorPromptRequest) -> CursorPromptResponse:
        """
        Main entry point for processing cursor prompts.
        
        Implements the full pipeline as specified in the plan:
        1. Rate limiting check
        2. Cache lookup
        3. LLM interaction
        4. Response processing
        5. Cache storage
        """
        start_time = time.time()
        
        # Rate limiting check (section 5.2)
        user_id = request.user_id or "anonymous"
        if not self._check_rate_limit(user_id):
            raise HTTPException(
                status_code=429, 
                detail="Rate limit exceeded. Please try again later."
            )
        
        # Check cache first (section 5.2 optimization)
        cache_key = self._generate_cache_key(request.prompt, request.context)
        cached_response = get_cache(f"cursor_prompt_{cache_key}")
        
        if cached_response:
            processing_time = int((time.time() - start_time) * 1000)
            return CursorPromptResponse(
                response=cached_response["response"],
                timestamp=time.time(),
                cached=True,
                processing_time_ms=processing_time
            )
        
        # Construct prompts
        system_prompt = self._construct_system_prompt()
        user_prompt = self._construct_user_prompt(request)
        
        # Combine prompts for LLM
        full_prompt = f"{system_prompt}\n\nUser: {user_prompt}\n\nAssistant:"
        
        try:
            # Generate response using LLM provider
            llm_response = self.llm_provider.generate(
                prompt=full_prompt,
                max_tokens=1000  # Configurable based on requirements
            )
            
            # Process and clean response
            cleaned_response = self._clean_response(llm_response)
            
            # Cache the response (section 5.2 optimization)
            cache_data = {"response": cleaned_response}
            set_cache(f"cursor_prompt_{cache_key}", cache_data)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return CursorPromptResponse(
                response=cleaned_response,
                timestamp=time.time(),
                cached=False,
                processing_time_ms=processing_time
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating response: {str(e)}"
            )
    
    def _clean_response(self, response: str) -> str:
        """
        Clean and validate LLM response.
        
        Implements quality assurance as mentioned in section 4.1.
        """
        if not response or not response.strip():
            raise ValueError("Empty response from LLM")
        
        # Basic cleaning
        cleaned = response.strip()
        
        # Remove any potential harmful content
        # This is a basic implementation - expand based on requirements
        if len(cleaned) > 2000:  # Reasonable response length limit
            cleaned = cleaned[:2000] + "..."
        
        return cleaned


# Global service instance - initialized when module is imported
_prompting_service: Optional[PromptingService] = None


def get_prompting_service(llm_provider: LLMProvider) -> PromptingService:
    """
    Factory function to get the prompting service instance.
    
    Follows the established pattern in the codebase for service management.
    """
    global _prompting_service
    if _prompting_service is None:
        _prompting_service = PromptingService(llm_provider)
    return _prompting_service
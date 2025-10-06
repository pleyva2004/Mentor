"""
Cursor Prompting Module for Mentor MVP
Handles real-time, context-aware assistance using LLM
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import json
from provider import get_llm_provider
from cache import get_cache, set_cache
import hashlib
from fastapi import HTTPException
from cursor_prompts import create_specialized_prompt, get_contextual_suggestions as get_prompt_suggestions
from performance import optimized_prompt_processing, prompt_cache, CacheKeyGenerator, ResponseOptimizer


# Request/Response Schemas (DTOs)
class CursorPromptRequest(BaseModel):
    """Request schema for cursor prompting endpoint"""
    prompt: str = Field(..., description="User's input prompt or question")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context (e.g., current page, user data)")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    max_tokens: Optional[int] = Field(1000, description="Maximum tokens for response")


class CursorPromptResponse(BaseModel):
    """Response schema for cursor prompting endpoint"""
    response: str = Field(..., description="LLM-generated response")
    session_id: str = Field(..., description="Session ID for conversation continuity")
    timestamp: datetime = Field(default_factory=datetime.now)
    tokens_used: Optional[int] = Field(None, description="Number of tokens used")
    cached: bool = Field(False, description="Whether response was from cache")
    response_preview: Optional[str] = Field(None, description="Preview of response for quick display")
    response_time_ms: Optional[int] = Field(None, description="Response time in milliseconds")


class PromptingService:
    """Service class for handling cursor prompting logic"""
    
    def __init__(self):
        self.llm_provider = get_llm_provider()
    
    def _generate_cache_key(self, prompt: str, context: Dict[str, Any]) -> str:
        """Generate a cache key based on prompt and context"""
        # Create a deterministic string from prompt and context
        cache_data = {
            "prompt": prompt,
            "context": context
        }
        cache_str = json.dumps(cache_data, sort_keys=True)
        return f"cursor_prompt_{hashlib.md5(cache_str.encode()).hexdigest()}"
    
    def _construct_prompt(self, user_prompt: str, context: Dict[str, Any]) -> str:
        """Construct the full prompt with context using specialized templates"""
        # Determine prompt type based on context
        prompt_type = "general"
        if context.get("current_page", "").endswith("/edit"):
            prompt_type = "resume_editing"
        elif context.get("courses_available", 0) > 0:
            prompt_type = "course_selection"
        
        # Use specialized prompt creation
        return create_specialized_prompt(prompt_type, user_prompt, context)
    
    async def process_prompt(self, request: CursorPromptRequest) -> CursorPromptResponse:
        """Process a cursor prompt request with performance optimizations"""
        try:
            # Generate a semantic cache key
            if CacheKeyGenerator.is_cacheable_prompt(request.prompt):
                cache_key = CacheKeyGenerator.generate_semantic_key(
                    request.prompt, 
                    request.context or {}
                )
            else:
                # Non-cacheable prompts still need a session ID
                cache_key = self._generate_cache_key(request.prompt, request.context or {})
            
            # Construct the full prompt
            full_prompt = self._construct_prompt(request.prompt, request.context or {})
            
            # Use optimized processing with advanced caching
            result = await optimized_prompt_processing(
                prompt=full_prompt,
                context=request.context or {},
                llm_provider=self.llm_provider,
                max_tokens=request.max_tokens or 1000
            )
            
            # Get response preview for quick display
            response_preview = ResponseOptimizer.get_response_preview(result["response"])
            
            return CursorPromptResponse(
                response=result["response"],
                session_id=request.session_id or cache_key,
                cached=result["cached"],
                tokens_used=result.get("tokens_used"),
                response_preview=response_preview,  # Add preview for quick display
                response_time_ms=int(result.get("response_time", 0) * 1000)  # Convert to ms
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing prompt: {str(e)}")
    
    def get_prompt_suggestions(self, context: Dict[str, Any]) -> List[str]:
        """Get contextual prompt suggestions based on current state"""
        return get_prompt_suggestions(context)


# Singleton instance
prompting_service = PromptingService()
"""
Test suite for cursor prompting functionality

This implements the testing strategy outlined in section 4 of the 
"Plan of Action for Cursor Prompting" document.
"""

import asyncio
from unittest.mock import Mock, patch
from cursor_prompting import (
    CursorPromptRequest, 
    CursorPromptResponse, 
    PromptingService,
    get_prompting_service
)
from provider import LLMProvider


class MockLLMProvider(LLMProvider):
    """Mock LLM provider for testing"""
    
    def __init__(self, mock_response: str = "This is a test response"):
        self.mock_response = mock_response
        self.call_count = 0
        self.last_prompt = None
    
    def generate(self, prompt: str, max_tokens: int = 2000) -> str:
        self.call_count += 1
        self.last_prompt = prompt
        return self.mock_response


def test_cursor_prompt_request_validation():
    """Test request DTO validation"""
    
    # Valid request
    valid_request = CursorPromptRequest(
        prompt="Help me with my resume",
        context={"user_background": "student"}
    )
    assert valid_request.prompt == "Help me with my resume"
    assert valid_request.context["user_background"] == "student"
    
    # Test prompt sanitization
    try:
        CursorPromptRequest(prompt="")
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Prompt cannot be empty" in str(e)
    
    try:
        CursorPromptRequest(prompt="   ")
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Prompt cannot be empty" in str(e)
    
    # Test dangerous content detection
    try:
        CursorPromptRequest(prompt="<script>alert('xss')</script>")
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "potentially dangerous content" in str(e)
    
    try:
        CursorPromptRequest(prompt="javascript:alert(1)")
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "potentially dangerous content" in str(e)


def test_prompting_service_initialization():
    """Test service initialization"""
    mock_provider = MockLLMProvider()
    service = PromptingService(mock_provider)
    
    assert service.llm_provider == mock_provider
    assert isinstance(service.rate_limits, dict)


def test_rate_limiting():
    """Test rate limiting functionality"""
    mock_provider = MockLLMProvider()
    service = PromptingService(mock_provider)
    
    user_id = "test_user"
    
    # Should allow first requests
    for i in range(10):
        assert service._check_rate_limit(user_id) == True
    
    # Should block 11th request
    assert service._check_rate_limit(user_id) == False


def test_cache_key_generation():
    """Test cache key generation"""
    mock_provider = MockLLMProvider()
    service = PromptingService(mock_provider)
    
    # Same prompt and context should generate same key
    key1 = service._generate_cache_key("test prompt", {"context": "test"})
    key2 = service._generate_cache_key("test prompt", {"context": "test"})
    assert key1 == key2
    
    # Different prompts should generate different keys
    key3 = service._generate_cache_key("different prompt", {"context": "test"})
    assert key1 != key3


async def test_process_prompt_success():
    """Test successful prompt processing"""
    mock_provider = MockLLMProvider("Great question! Here's my advice...")
    service = PromptingService(mock_provider)
    
    request = CursorPromptRequest(
        prompt="How do I improve my resume?",
        user_id="test_user"
    )
    
    response = await service.process_prompt(request)
    
    assert isinstance(response, CursorPromptResponse)
    assert response.response == "Great question! Here's my advice..."
    assert response.cached == False
    assert response.processing_time_ms > 0
    assert mock_provider.call_count == 1


async def test_process_prompt_with_context():
    """Test prompt processing with context"""
    mock_provider = MockLLMProvider("Context-aware response")
    service = PromptingService(mock_provider)
    
    request = CursorPromptRequest(
        prompt="Help me with skills section",
        context={
            "user_background": "software engineer",
            "current_resume_section": "skills"
        },
        user_id="test_user"
    )
    
    response = await service.process_prompt(request)
    
    assert response.response == "Context-aware response"
    # Verify context was included in prompt
    assert "software engineer" in mock_provider.last_prompt
    assert "skills" in mock_provider.last_prompt


async def test_rate_limiting_in_process_prompt():
    """Test rate limiting during prompt processing"""
    mock_provider = MockLLMProvider()
    service = PromptingService(mock_provider)
    
    user_id = "rate_limit_test_user"
    
    # Exhaust rate limit
    for i in range(10):
        request = CursorPromptRequest(
            prompt=f"Test prompt {i}",
            user_id=user_id
        )
        await service.process_prompt(request)
    
    # Next request should fail
    try:
        request = CursorPromptRequest(
            prompt="This should fail",
            user_id=user_id
        )
        await service.process_prompt(request)
        assert False, "Should have raised rate limit exception"
    except Exception as e:
        assert "Rate limit exceeded" in str(e)


async def test_llm_error_handling():
    """Test error handling when LLM fails"""
    
    class FailingLLMProvider(LLMProvider):
        def generate(self, prompt: str, max_tokens: int = 2000) -> str:
            raise Exception("LLM API error")
    
    service = PromptingService(FailingLLMProvider())
    
    request = CursorPromptRequest(
        prompt="This will fail",
        user_id="test_user"
    )
    
    try:
        await service.process_prompt(request)
        assert False, "Should have raised exception"
    except Exception as e:
        assert "Error generating response" in str(e)


def test_response_cleaning():
    """Test response cleaning functionality"""
    mock_provider = MockLLMProvider()
    service = PromptingService(mock_provider)
    
    # Test normal response
    cleaned = service._clean_response("This is a normal response")
    assert cleaned == "This is a normal response"
    
    # Test whitespace trimming
    cleaned = service._clean_response("  \n  Padded response  \n  ")
    assert cleaned == "Padded response"
    
    # Test length limiting
    long_response = "x" * 3000
    cleaned = service._clean_response(long_response)
    assert len(cleaned) <= 2003  # 2000 + "..."
    assert cleaned.endswith("...")
    
    # Test empty response
    try:
        service._clean_response("")
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Empty response from LLM" in str(e)
    
    try:
        service._clean_response("   ")
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Empty response from LLM" in str(e)


def test_get_prompting_service_singleton():
    """Test service factory function"""
    mock_provider1 = MockLLMProvider()
    mock_provider2 = MockLLMProvider()
    
    # First call creates service
    service1 = get_prompting_service(mock_provider1)
    
    # Second call returns same instance (singleton pattern)
    service2 = get_prompting_service(mock_provider2)
    
    assert service1 is service2


if __name__ == "__main__":
    # Run basic tests
    print("Running cursor prompting tests...")
    
    # Test request validation
    test_cursor_prompt_request_validation()
    print("✓ Request validation tests passed")
    
    # Test service initialization
    test_prompting_service_initialization()
    print("✓ Service initialization tests passed")
    
    # Test rate limiting
    test_rate_limiting()
    print("✓ Rate limiting tests passed")
    
    # Test cache key generation
    test_cache_key_generation()
    print("✓ Cache key generation tests passed")
    
    # Test response cleaning
    test_response_cleaning()
    print("✓ Response cleaning tests passed")
    
    # Test singleton pattern
    test_get_prompting_service_singleton()
    print("✓ Service factory tests passed")
    
    print("\nAll basic tests passed!")
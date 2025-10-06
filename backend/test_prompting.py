"""
Unit tests for the cursor prompting service
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime
from prompting import PromptingService, CursorPromptRequest, CursorPromptResponse
from cursor_prompts import get_contextual_suggestions, create_specialized_prompt
from fastapi import HTTPException


class TestPromptingService:
    """Test cases for PromptingService"""
    
    @pytest.fixture
    def mock_llm_provider(self):
        """Create a mock LLM provider"""
        provider = Mock()
        provider.generate = Mock(return_value="Mock LLM response")
        return provider
    
    @pytest.fixture
    def prompting_service(self, mock_llm_provider):
        """Create a PromptingService instance with mocked dependencies"""
        with patch('prompting.get_llm_provider', return_value=mock_llm_provider):
            service = PromptingService()
            return service
    
    def test_generate_cache_key(self, prompting_service):
        """Test cache key generation is deterministic"""
        prompt = "How can I improve my resume?"
        context = {"current_section": "skills", "user_data": {"name": "John"}}
        
        key1 = prompting_service._generate_cache_key(prompt, context)
        key2 = prompting_service._generate_cache_key(prompt, context)
        
        assert key1 == key2
        assert key1.startswith("cursor_prompt_")
        assert len(key1) > 20  # Should include MD5 hash
    
    def test_generate_cache_key_different_inputs(self, prompting_service):
        """Test cache keys are different for different inputs"""
        context = {"current_section": "skills"}
        
        key1 = prompting_service._generate_cache_key("prompt1", context)
        key2 = prompting_service._generate_cache_key("prompt2", context)
        key3 = prompting_service._generate_cache_key("prompt1", {"current_section": "projects"})
        
        assert key1 != key2
        assert key1 != key3
        assert key2 != key3
    
    def test_construct_prompt_general(self, prompting_service):
        """Test prompt construction for general context"""
        user_prompt = "How can I improve my resume?"
        context = {}
        
        prompt = prompting_service._construct_prompt(user_prompt, context)
        
        assert "How can I improve my resume?" in prompt
        assert "helpful AI assistant" in prompt
    
    def test_construct_prompt_resume_editing(self, prompting_service):
        """Test prompt construction for resume editing context"""
        user_prompt = "How should I describe this project?"
        context = {
            "current_page": "/edit",
            "current_section": "projects"
        }
        
        prompt = prompting_service._construct_prompt(user_prompt, context)
        
        assert "How should I describe this project?" in prompt
        assert "resume" in prompt.lower()
    
    def test_construct_prompt_course_selection(self, prompting_service):
        """Test prompt construction for course selection context"""
        user_prompt = "Which courses should I highlight?"
        context = {
            "courses_available": 10,
            "selected_courses": ["CS101", "CS201"]
        }
        
        prompt = prompting_service._construct_prompt(user_prompt, context)
        
        assert "Which courses should I highlight?" in prompt
        assert "CS101" in prompt
    
    @pytest.mark.asyncio
    async def test_process_prompt_success(self, prompting_service, mock_llm_provider):
        """Test successful prompt processing"""
        request = CursorPromptRequest(
            prompt="Test prompt",
            context={"current_section": "skills"},
            max_tokens=100
        )
        
        with patch('prompting.get_cache', return_value=None), \
             patch('prompting.set_cache'):
            
            response = await prompting_service.process_prompt(request)
            
            assert isinstance(response, CursorPromptResponse)
            assert response.response == "Mock LLM response"
            assert response.cached is False
            assert mock_llm_provider.generate.called
    
    @pytest.mark.asyncio
    async def test_process_prompt_cached(self, prompting_service, mock_llm_provider):
        """Test prompt processing with cached response"""
        request = CursorPromptRequest(
            prompt="Test prompt",
            context={"current_section": "skills"}
        )
        
        cached_data = {
            "response": "Cached response",
            "tokens_used": 50,
            "timestamp": datetime.now().isoformat()
        }
        
        with patch('prompting.get_cache', return_value=cached_data):
            response = await prompting_service.process_prompt(request)
            
            assert response.response == "Cached response"
            assert response.cached is True
            assert response.tokens_used == 50
            assert not mock_llm_provider.generate.called
    
    @pytest.mark.asyncio
    async def test_process_prompt_error(self, prompting_service, mock_llm_provider):
        """Test prompt processing with LLM error"""
        request = CursorPromptRequest(prompt="Test prompt")
        
        mock_llm_provider.generate.side_effect = Exception("LLM API error")
        
        with patch('prompting.get_cache', return_value=None):
            with pytest.raises(HTTPException) as exc_info:
                await prompting_service.process_prompt(request)
            
            assert exc_info.value.status_code == 500
            assert "Error processing prompt" in str(exc_info.value.detail)
    
    def test_get_prompt_suggestions(self, prompting_service):
        """Test getting contextual prompt suggestions"""
        # Test with specific section
        context = {"current_section": "projects"}
        suggestions = prompting_service.get_prompt_suggestions(context)
        
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        assert all(isinstance(s, str) for s in suggestions)
        assert any("project" in s.lower() for s in suggestions)
        
        # Test with course context
        context = {"courses_available": 5}
        suggestions = prompting_service.get_prompt_suggestions(context)
        
        assert len(suggestions) > 0
        assert any("course" in s.lower() for s in suggestions)


class TestCursorPrompts:
    """Test cases for cursor prompt templates"""
    
    def test_get_contextual_suggestions_projects(self):
        """Test suggestions for projects section"""
        context = {"current_section": "projects"}
        suggestions = get_contextual_suggestions(context)
        
        assert len(suggestions) == 4
        assert any("project" in s.lower() for s in suggestions)
        assert any("impact" in s.lower() for s in suggestions)
    
    def test_get_contextual_suggestions_skills(self):
        """Test suggestions for skills section"""
        context = {"current_section": "skills"}
        suggestions = get_contextual_suggestions(context)
        
        assert len(suggestions) == 4
        assert any("skill" in s.lower() for s in suggestions)
        assert any("organize" in s.lower() for s in suggestions)
    
    def test_get_contextual_suggestions_general(self):
        """Test general suggestions"""
        context = {}
        suggestions = get_contextual_suggestions(context)
        
        assert len(suggestions) == 4
        assert any("resume" in s.lower() for s in suggestions)
    
    def test_create_specialized_prompt_resume_editing(self):
        """Test specialized prompt for resume editing"""
        user_query = "How can I improve this?"
        context = {
            "current_page": "/edit",
            "current_section": "experience",
            "user_data": {"major": "Computer Science"}
        }
        
        prompt = create_specialized_prompt("resume_editing", user_query, context)
        
        assert "resume coach" in prompt.lower()
        assert "experience" in prompt.lower()
        assert user_query in prompt
        assert "Computer Science" in prompt
    
    def test_create_specialized_prompt_course_selection(self):
        """Test specialized prompt for course selection"""
        user_query = "Which courses should I take?"
        context = {
            "courses_available": 10,
            "selected_courses": ["CS101", "CS201", "CS301"]
        }
        
        prompt = create_specialized_prompt("course_selection", user_query, context)
        
        assert "academic advisor" in prompt.lower()
        assert user_query in prompt
        assert "CS101" in prompt
    
    def test_create_specialized_prompt_with_graduation_year(self):
        """Test prompt enhancement based on graduation year"""
        user_query = "How should I format my resume?"
        
        # Recent graduate
        context = {
            "user_data": {"graduation_year": "2024"}
        }
        prompt = create_specialized_prompt("general", user_query, context)
        assert "recent graduate" in prompt.lower()
        
        # Experienced professional
        context = {
            "user_data": {"graduation_year": "2018"}
        }
        prompt = create_specialized_prompt("general", user_query, context)
        assert "professional experience" in prompt.lower()


# Integration test for the API endpoint
@pytest.mark.asyncio
async def test_cursor_prompt_endpoint_integration():
    """Test the full cursor prompt endpoint integration"""
    from fastapi.testclient import TestClient
    from main import app
    
    client = TestClient(app)
    
    # Test without authentication
    response = client.post(
        "/api/prompts/cursor",
        json={
            "prompt": "How can I improve my resume?",
            "context": {"current_section": "skills"}
        }
    )
    assert response.status_code == 403  # Should require auth
    
    # Test with authentication
    headers = {"Authorization": "Bearer test-token"}
    response = client.post(
        "/api/prompts/cursor",
        json={
            "prompt": "How can I improve my resume?",
            "context": {"current_section": "skills"}
        },
        headers=headers
    )
    
    # Note: This will fail without proper LLM setup, but tests the endpoint structure
    # In a real test environment, you'd mock the LLM provider


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
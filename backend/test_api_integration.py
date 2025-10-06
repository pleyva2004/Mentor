"""
Integration tests for the cursor prompting API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from main import app
from prompting import CursorPromptResponse
from datetime import datetime


class TestCursorPromptingAPI:
    """Integration tests for cursor prompting endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create a test client"""
        return TestClient(app)
    
    @pytest.fixture
    def auth_headers(self):
        """Create authentication headers"""
        return {"Authorization": "Bearer test-token"}
    
    @pytest.fixture
    def mock_llm_provider(self):
        """Mock LLM provider for integration tests"""
        provider = Mock()
        provider.generate = Mock(return_value="This is a helpful response about improving your resume.")
        return provider
    
    def test_cursor_prompt_without_auth(self, client):
        """Test cursor prompt endpoint requires authentication"""
        response = client.post(
            "/api/prompts/cursor",
            json={
                "prompt": "How can I improve my resume?",
                "context": {"current_section": "skills"}
            }
        )
        
        assert response.status_code == 403
        assert "Not authenticated" in response.text
    
    def test_cursor_prompt_invalid_request(self, client, auth_headers):
        """Test cursor prompt with invalid request body"""
        response = client.post(
            "/api/prompts/cursor",
            json={
                # Missing required 'prompt' field
                "context": {"current_section": "skills"}
            },
            headers=auth_headers
        )
        
        assert response.status_code == 422
        assert "prompt" in response.text
    
    def test_cursor_prompt_success(self, client, auth_headers, mock_llm_provider):
        """Test successful cursor prompt request"""
        with patch('prompting.get_llm_provider', return_value=mock_llm_provider), \
             patch('prompting.get_cache', return_value=None), \
             patch('prompting.set_cache'):
            
            response = client.post(
                "/api/prompts/cursor",
                json={
                    "prompt": "How can I improve my skills section?",
                    "context": {
                        "current_section": "skills",
                        "current_page": "/edit"
                    },
                    "max_tokens": 500
                },
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert "response" in data
            assert data["response"] == "This is a helpful response about improving your resume."
            assert "session_id" in data
            assert "timestamp" in data
            assert data["cached"] is False
    
    def test_cursor_prompt_with_cache(self, client, auth_headers):
        """Test cursor prompt with cached response"""
        cached_response = {
            "response": "Cached helpful response",
            "tokens_used": 100,
            "timestamp": datetime.now().isoformat()
        }
        
        with patch('prompting.get_cache', return_value=cached_response):
            response = client.post(
                "/api/prompts/cursor",
                json={
                    "prompt": "How can I improve my skills section?",
                    "context": {"current_section": "skills"}
                },
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["response"] == "Cached helpful response"
            assert data["cached"] is True
            assert data["tokens_used"] == 100
    
    def test_cursor_prompt_with_full_context(self, client, auth_headers, mock_llm_provider):
        """Test cursor prompt with comprehensive context"""
        with patch('prompting.get_llm_provider', return_value=mock_llm_provider), \
             patch('prompting.get_cache', return_value=None), \
             patch('prompting.set_cache'):
            
            response = client.post(
                "/api/prompts/cursor",
                json={
                    "prompt": "Should I include this course?",
                    "context": {
                        "current_section": "education",
                        "current_page": "/edit",
                        "user_data": {
                            "name": "John Doe",
                            "major": "Computer Science",
                            "graduation_year": "2023"
                        },
                        "selected_courses": ["CS101", "CS201", "CS301"],
                        "has_resume_data": True,
                        "sections_confirmed": {
                            "header": True,
                            "projects": False,
                            "skills": True,
                            "experience": False,
                            "education": False
                        }
                    },
                    "session_id": "test-session-123"
                },
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert "response" in data
            assert data["session_id"] == "test-session-123"
            
            # Verify the context was passed to the prompt construction
            mock_llm_provider.generate.assert_called_once()
            call_args = mock_llm_provider.generate.call_args
            prompt_text = call_args[1]["prompt"]
            
            # Context should be included in the prompt
            assert "Computer Science" in prompt_text
            assert "education" in prompt_text.lower()
    
    def test_prompt_suggestions_endpoint(self, client, auth_headers):
        """Test the prompt suggestions endpoint"""
        response = client.get(
            "/api/prompts/suggestions?current_section=projects",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "suggestions" in data
        assert isinstance(data["suggestions"], list)
        assert len(data["suggestions"]) > 0
        assert all(isinstance(s, str) for s in data["suggestions"])
        
        # Should have project-related suggestions
        assert any("project" in s.lower() for s in data["suggestions"])
    
    def test_prompt_suggestions_without_section(self, client, auth_headers):
        """Test prompt suggestions without specific section"""
        response = client.get(
            "/api/prompts/suggestions",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "suggestions" in data
        assert len(data["suggestions"]) > 0
        # Should have general suggestions
        assert any("resume" in s.lower() for s in data["suggestions"])
    
    def test_cursor_prompt_error_handling(self, client, auth_headers, mock_llm_provider):
        """Test error handling in cursor prompt"""
        mock_llm_provider.generate.side_effect = Exception("LLM API is down")
        
        with patch('prompting.get_llm_provider', return_value=mock_llm_provider), \
             patch('prompting.get_cache', return_value=None):
            
            response = client.post(
                "/api/prompts/cursor",
                json={
                    "prompt": "Help me",
                    "context": {}
                },
                headers=auth_headers
            )
            
            assert response.status_code == 500
            assert "Error processing prompt" in response.json()["detail"]
    
    def test_cursor_prompt_rate_limiting(self, client, auth_headers, mock_llm_provider):
        """Test that multiple requests work (rate limiting would be added in production)"""
        with patch('prompting.get_llm_provider', return_value=mock_llm_provider), \
             patch('prompting.get_cache', return_value=None), \
             patch('prompting.set_cache'):
            
            # Make multiple requests
            for i in range(3):
                response = client.post(
                    "/api/prompts/cursor",
                    json={
                        "prompt": f"Question {i}",
                        "context": {}
                    },
                    headers=auth_headers
                )
                assert response.status_code == 200
            
            # In production, would test rate limiting here
            # For now, just verify all requests succeeded
            assert mock_llm_provider.generate.call_count == 3


class TestCORSConfiguration:
    """Test CORS is properly configured for the new endpoints"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_cors_headers_on_prompt_endpoint(self, client):
        """Test CORS headers are present on cursor prompt endpoint"""
        response = client.options(
            "/api/prompts/cursor",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,authorization"
            }
        )
        
        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
        assert "POST" in response.headers["access-control-allow-methods"]
        assert "authorization" in response.headers["access-control-allow-headers"].lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
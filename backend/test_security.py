"""
Security tests for cursor prompting feature
"""

import pytest
from security import (
    sanitize_input,
    sanitize_context,
    validate_prompt_length,
    validate_session_id,
    RateLimiter,
    rate_limit_storage
)
from fastapi import HTTPException
import time


class TestInputSanitization:
    """Test input sanitization functions"""
    
    def test_sanitize_input_basic(self):
        """Test basic input sanitization"""
        assert sanitize_input("Hello World") == "Hello World"
        assert sanitize_input("  Hello   World  ") == "Hello World"
        assert sanitize_input("") == ""
        assert sanitize_input(None) == ""
    
    def test_sanitize_input_html_escape(self):
        """Test HTML escaping"""
        assert sanitize_input("<script>alert('xss')</script>") == "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
        assert sanitize_input("Hello <b>World</b>") == "Hello &lt;b&gt;World&lt;/b&gt;"
    
    def test_sanitize_input_control_chars(self):
        """Test control character removal"""
        assert sanitize_input("Hello\x00World") == "Hello World"
        assert sanitize_input("Hello\nWorld") == "Hello World"  # Newlines normalized to space
        assert sanitize_input("Hello\tWorld") == "Hello World"  # Tabs normalized to space
    
    def test_sanitize_input_max_length(self):
        """Test max length truncation"""
        long_text = "a" * 2000
        result = sanitize_input(long_text, max_length=100)
        assert len(result) == 100
        assert result == "a" * 100
    
    def test_sanitize_context_basic(self):
        """Test context sanitization"""
        context = {
            "current_section": "skills",
            "current_page": "/edit",
            "malicious_key": "should be removed"
        }
        
        sanitized = sanitize_context(context)
        
        assert "current_section" in sanitized
        assert "current_page" in sanitized
        assert "malicious_key" not in sanitized
    
    def test_sanitize_context_user_data(self):
        """Test user data sanitization in context"""
        context = {
            "user_data": {
                "name": "John <script>alert('xss')</script>",
                "major": "Computer Science",
                "graduation_year": "2023",
                "ssn": "123-45-6789"  # Should be removed
            }
        }
        
        sanitized = sanitize_context(context)
        
        assert sanitized["user_data"]["name"] == "John &lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
        assert sanitized["user_data"]["major"] == "Computer Science"
        assert "ssn" not in sanitized["user_data"]
    
    def test_sanitize_context_courses(self):
        """Test course list sanitization"""
        context = {
            "selected_courses": ["CS101", "CS201<script>", "CS301"] * 5  # 15 courses
        }
        
        sanitized = sanitize_context(context)
        
        # Should limit to 10 courses
        assert len(sanitized["selected_courses"]) == 10
        assert "CS201&lt;script&gt;" in sanitized["selected_courses"]


class TestValidation:
    """Test validation functions"""
    
    def test_validate_prompt_length_valid(self):
        """Test valid prompt validation"""
        prompt = "How can I improve my resume?"
        result = validate_prompt_length(prompt)
        assert result == prompt
    
    def test_validate_prompt_length_empty(self):
        """Test empty prompt validation"""
        with pytest.raises(HTTPException) as exc_info:
            validate_prompt_length("")
        assert exc_info.value.status_code == 400
        assert "empty" in exc_info.value.detail
    
    def test_validate_prompt_length_too_long(self):
        """Test too long prompt validation"""
        long_prompt = "a" * 1500
        with pytest.raises(HTTPException) as exc_info:
            validate_prompt_length(long_prompt, max_length=1000)
        assert exc_info.value.status_code == 400
        assert "too long" in exc_info.value.detail
    
    def test_validate_session_id_valid(self):
        """Test valid session ID"""
        assert validate_session_id("abc123-def456") == "abc123-def456"
        assert validate_session_id("SESSION-123") == "SESSION-123"
        assert validate_session_id(None) is None
        assert validate_session_id("") is None
    
    def test_validate_session_id_invalid(self):
        """Test invalid session ID"""
        invalid_ids = [
            "session with spaces",
            "session@special!chars",
            "a" * 51,  # Too long
            "../../../etc/passwd",
            "<script>alert('xss')</script>"
        ]
        
        for session_id in invalid_ids:
            with pytest.raises(HTTPException) as exc_info:
                validate_session_id(session_id)
            assert exc_info.value.status_code == 400
            assert "Invalid session ID" in exc_info.value.detail


class TestRateLimiter:
    """Test rate limiting functionality"""
    
    def setup_method(self):
        """Clear rate limit storage before each test"""
        rate_limit_storage.clear()
    
    def test_rate_limit_allows_requests(self):
        """Test rate limiter allows requests within limit"""
        limiter = RateLimiter(max_requests=3, window_seconds=1)
        
        assert limiter.check_rate_limit("user1") is True
        assert limiter.check_rate_limit("user1") is True
        assert limiter.check_rate_limit("user1") is True
    
    def test_rate_limit_blocks_excess_requests(self):
        """Test rate limiter blocks requests over limit"""
        limiter = RateLimiter(max_requests=2, window_seconds=1)
        
        assert limiter.check_rate_limit("user1") is True
        assert limiter.check_rate_limit("user1") is True
        assert limiter.check_rate_limit("user1") is False  # Should be blocked
    
    def test_rate_limit_different_users(self):
        """Test rate limiter tracks different users separately"""
        limiter = RateLimiter(max_requests=1, window_seconds=1)
        
        assert limiter.check_rate_limit("user1") is True
        assert limiter.check_rate_limit("user2") is True
        assert limiter.check_rate_limit("user1") is False  # user1 blocked
        assert limiter.check_rate_limit("user2") is False  # user2 blocked
    
    def test_rate_limit_window_expiry(self):
        """Test rate limit resets after window expires"""
        limiter = RateLimiter(max_requests=1, window_seconds=0.1)  # 100ms window
        
        assert limiter.check_rate_limit("user1") is True
        assert limiter.check_rate_limit("user1") is False
        
        time.sleep(0.15)  # Wait for window to expire
        
        assert limiter.check_rate_limit("user1") is True
    
    def test_rate_limit_get_reset_time(self):
        """Test getting rate limit reset time"""
        limiter = RateLimiter(max_requests=1, window_seconds=60)
        
        current_time = time.time()
        limiter.check_rate_limit("user1")
        
        reset_time = limiter.get_reset_time("user1")
        
        # Reset time should be approximately 60 seconds from now
        assert reset_time > current_time
        assert reset_time <= current_time + 61  # Allow 1 second tolerance


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
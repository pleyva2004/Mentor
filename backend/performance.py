"""
Performance optimization utilities for cursor prompting
Includes caching strategies, response streaming, and monitoring
"""

import asyncio
from typing import Dict, Optional, Any, AsyncGenerator
from datetime import datetime, timedelta
import json
import hashlib
from dataclasses import dataclass
import time
from collections import deque
import statistics


@dataclass
class CacheEntry:
    """Cache entry with metadata"""
    value: Any
    created_at: datetime
    hit_count: int = 0
    last_accessed: datetime = None
    ttl_seconds: int = 3600  # Default 1 hour TTL


class AdvancedCache:
    """Advanced caching system with TTL, LRU eviction, and hit tracking"""
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 3600):
        self.cache: Dict[str, CacheEntry] = {}
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.access_order = deque(maxlen=max_size)
        self.hit_rate_window = deque(maxlen=1000)  # Track last 1000 accesses
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache with TTL check"""
        if key not in self.cache:
            self.hit_rate_window.append(0)  # Cache miss
            return None
        
        entry = self.cache[key]
        
        # Check TTL
        age = (datetime.now() - entry.created_at).total_seconds()
        if age > entry.ttl_seconds:
            del self.cache[key]
            self.hit_rate_window.append(0)  # Cache miss (expired)
            return None
        
        # Update access info
        entry.hit_count += 1
        entry.last_accessed = datetime.now()
        
        # Update LRU order
        if key in self.access_order:
            self.access_order.remove(key)
        self.access_order.append(key)
        
        self.hit_rate_window.append(1)  # Cache hit
        return entry.value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache with optional TTL"""
        # Evict LRU items if at capacity
        while len(self.cache) >= self.max_size:
            if self.access_order:
                lru_key = self.access_order.popleft()
                if lru_key in self.cache:
                    del self.cache[lru_key]
        
        self.cache[key] = CacheEntry(
            value=value,
            created_at=datetime.now(),
            ttl_seconds=ttl or self.default_ttl
        )
        self.access_order.append(key)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        hit_rate = statistics.mean(self.hit_rate_window) if self.hit_rate_window else 0
        
        total_hits = sum(entry.hit_count for entry in self.cache.values())
        avg_age = 0
        if self.cache:
            ages = [(datetime.now() - entry.created_at).total_seconds() 
                    for entry in self.cache.values()]
            avg_age = statistics.mean(ages)
        
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "hit_rate": round(hit_rate * 100, 2),
            "total_hits": total_hits,
            "avg_age_seconds": round(avg_age, 2)
        }
    
    def clear_expired(self):
        """Remove expired entries"""
        now = datetime.now()
        expired_keys = [
            key for key, entry in self.cache.items()
            if (now - entry.created_at).total_seconds() > entry.ttl_seconds
        ]
        for key in expired_keys:
            del self.cache[key]
            if key in self.access_order:
                self.access_order.remove(key)


class ResponseOptimizer:
    """Optimize response times and streaming"""
    
    @staticmethod
    async def stream_response(text: str, chunk_size: int = 100) -> AsyncGenerator[str, None]:
        """Stream response in chunks for better perceived performance"""
        words = text.split()
        current_chunk = []
        
        for word in words:
            current_chunk.append(word)
            
            if len(current_chunk) >= chunk_size:
                yield " ".join(current_chunk) + " "
                current_chunk = []
                await asyncio.sleep(0.01)  # Small delay for streaming effect
        
        if current_chunk:
            yield " ".join(current_chunk)
    
    @staticmethod
    def get_response_preview(text: str, max_length: int = 200) -> str:
        """Get preview of response for quick initial display"""
        if len(text) <= max_length:
            return text
        
        # Find last complete sentence within limit
        sentences = text[:max_length].split('. ')
        if len(sentences) > 1:
            return '. '.join(sentences[:-1]) + '.'
        
        # Fall back to word boundary
        words = text[:max_length].split()
        return ' '.join(words[:-1]) + '...'


class PerformanceMonitor:
    """Monitor performance metrics"""
    
    def __init__(self, window_size: int = 100):
        self.response_times = deque(maxlen=window_size)
        self.prompt_lengths = deque(maxlen=window_size)
        self.token_counts = deque(maxlen=window_size)
    
    def record_request(self, response_time: float, prompt_length: int, tokens_used: Optional[int] = None):
        """Record metrics for a request"""
        self.response_times.append(response_time)
        self.prompt_lengths.append(prompt_length)
        if tokens_used:
            self.token_counts.append(tokens_used)
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get performance metrics"""
        metrics = {
            "avg_response_time": 0,
            "p95_response_time": 0,
            "avg_prompt_length": 0,
            "avg_tokens_used": 0
        }
        
        if self.response_times:
            metrics["avg_response_time"] = round(statistics.mean(self.response_times), 3)
            if len(self.response_times) >= 20:
                sorted_times = sorted(self.response_times)
                p95_index = int(len(sorted_times) * 0.95)
                metrics["p95_response_time"] = round(sorted_times[p95_index], 3)
        
        if self.prompt_lengths:
            metrics["avg_prompt_length"] = round(statistics.mean(self.prompt_lengths))
        
        if self.token_counts:
            metrics["avg_tokens_used"] = round(statistics.mean(self.token_counts))
        
        return metrics


class CacheKeyGenerator:
    """Generate optimized cache keys"""
    
    @staticmethod
    def generate_semantic_key(prompt: str, context: Dict[str, Any]) -> str:
        """Generate cache key based on semantic content"""
        # Normalize prompt
        normalized_prompt = prompt.lower().strip()
        
        # Extract key context elements
        key_context = {
            "section": context.get("current_section", ""),
            "has_courses": bool(context.get("selected_courses")),
            "page_type": "edit" if "/edit" in context.get("current_page", "") else "other"
        }
        
        # Create deterministic key
        cache_data = {
            "prompt": normalized_prompt,
            "context": key_context
        }
        
        cache_str = json.dumps(cache_data, sort_keys=True)
        return f"prompt_v2_{hashlib.md5(cache_str.encode()).hexdigest()}"
    
    @staticmethod
    def is_cacheable_prompt(prompt: str) -> bool:
        """Determine if a prompt should be cached"""
        # Don't cache very short or very long prompts
        if len(prompt) < 10 or len(prompt) > 500:
            return False
        
        # Don't cache prompts with specific personal info
        personal_indicators = ["my name", "i am", "my email", "my phone"]
        prompt_lower = prompt.lower()
        if any(indicator in prompt_lower for indicator in personal_indicators):
            return False
        
        return True


# Global instances
prompt_cache = AdvancedCache(max_size=5000, default_ttl=3600)  # 1 hour TTL
performance_monitor = PerformanceMonitor()


async def optimized_prompt_processing(
    prompt: str,
    context: Dict[str, Any],
    llm_provider,
    max_tokens: int = 1000
) -> Dict[str, Any]:
    """Process prompt with performance optimizations"""
    start_time = time.time()
    
    # Check if prompt is cacheable
    if CacheKeyGenerator.is_cacheable_prompt(prompt):
        cache_key = CacheKeyGenerator.generate_semantic_key(prompt, context)
        
        # Try cache first
        cached = prompt_cache.get(cache_key)
        if cached:
            response_time = time.time() - start_time
            performance_monitor.record_request(response_time, len(prompt), cached.get("tokens_used"))
            
            return {
                "response": cached["response"],
                "cached": True,
                "tokens_used": cached.get("tokens_used"),
                "response_time": response_time
            }
    
    # Generate response
    try:
        llm_response = await asyncio.to_thread(
            llm_provider.generate,
            prompt=prompt,
            max_tokens=max_tokens
        )
        
        response_time = time.time() - start_time
        tokens_used = None  # TODO: Extract from provider
        
        # Record metrics
        performance_monitor.record_request(response_time, len(prompt), tokens_used)
        
        result = {
            "response": llm_response,
            "cached": False,
            "tokens_used": tokens_used,
            "response_time": response_time
        }
        
        # Cache if appropriate
        if CacheKeyGenerator.is_cacheable_prompt(prompt):
            cache_data = {
                "response": llm_response,
                "tokens_used": tokens_used
            }
            prompt_cache.set(cache_key, cache_data)
        
        return result
        
    except Exception as e:
        response_time = time.time() - start_time
        performance_monitor.record_request(response_time, len(prompt))
        raise


# Background task to clean expired cache entries
async def cache_cleanup_task():
    """Periodically clean up expired cache entries"""
    while True:
        await asyncio.sleep(300)  # Run every 5 minutes
        prompt_cache.clear_expired()


# Export performance endpoints for monitoring
def get_performance_stats() -> Dict[str, Any]:
    """Get comprehensive performance statistics"""
    return {
        "cache": prompt_cache.get_stats(),
        "performance": performance_monitor.get_metrics(),
        "timestamp": datetime.now().isoformat()
    }
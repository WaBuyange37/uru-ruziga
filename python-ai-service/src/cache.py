"""
Redis-based caching service for performance optimization.
"""

import os
import logging
import json
from typing import Optional, Any
import redis
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)


class CacheService:
    """
    Redis-based caching service.
    """
    
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.enabled = os.getenv('CACHE_ENABLED', 'true').lower() == 'true'
        self.ttl = int(os.getenv('CACHE_TTL', '3600'))  # 1 hour default
        
        self.client = None
        
        if self.enabled:
            try:
                self.client = redis.from_url(self.redis_url, decode_responses=True)
                # Test connection
                self.client.ping()
                logger.info(f"CacheService initialized with Redis at {self.redis_url}")
            except RedisError as e:
                logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
                self.enabled = False
                self.client = None
        else:
            logger.info("CacheService initialized with caching disabled")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        if not self.enabled or not self.client:
            return None
        
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.warning(f"Cache get failed for key '{key}': {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (optional)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.client:
            return False
        
        try:
            ttl = ttl or self.ttl
            serialized = json.dumps(value)
            self.client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.warning(f"Cache set failed for key '{key}': {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.client:
            return False
        
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete failed for key '{key}': {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """
        Clear all keys matching a pattern.
        
        Args:
            pattern: Key pattern (e.g., 'reference:*')
            
        Returns:
            Number of keys deleted
        """
        if not self.enabled or not self.client:
            return 0
        
        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache clear pattern failed for '{pattern}': {e}")
            return 0
    
    def is_healthy(self) -> bool:
        """
        Check if cache service is healthy.
        
        Returns:
            True if healthy, False otherwise
        """
        if not self.enabled or not self.client:
            return False
        
        try:
            self.client.ping()
            return True
        except Exception:
            return False

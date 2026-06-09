"""
Redis-based caching service for font rendering and feature vector optimization.
Provides high-performance caching for rendered characters and precomputed features.
"""

import json
import pickle
import logging
import asyncio
from typing import Dict, List, Optional, Any, Union
from dataclasses import asdict, dataclass
import numpy as np
from PIL import Image
import io
import base64

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logging.warning("Redis not available, falling back to memory cache")

from .font_renderer import ReferenceData, CharacterMetrics


@dataclass
class CacheConfig:
    redis_url: str = "redis://localhost:6379"
    default_ttl: int = 3600
    reference_ttl: int = 86400
    feature_ttl: int = 43200


class CacheService:
    """
    High-performance Redis-based caching service for font rendering optimization.
    Supports caching of rendered characters, feature vectors, and precomputed data.
    """
    
    def __init__(self, redis_url: str = "redis://localhost:6379", ttl: int = 3600):
        self.redis_url = redis_url
        self.ttl = ttl  # Time to live in seconds
        self.redis_client = None
        self.memory_cache: Dict[str, Any] = {}  # Fallback memory cache
        self.use_redis = REDIS_AVAILABLE
        
        if self.use_redis:
            self._initialize_redis()
        else:
            logging.warning("Using memory cache fallback - not suitable for production")
    
    def _initialize_redis(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=False)
            logging.info(f"Redis cache service initialized: {self.redis_url}")
        except Exception as e:
            logging.error(f"Failed to initialize Redis: {e}")
            self.use_redis = False
    
    async def ping(self) -> bool:
        """Test Redis connection"""
        if not self.use_redis or not self.redis_client:
            return False
        
        try:
            await self.redis_client.ping()
            return True
        except Exception as e:
            logging.error(f"Redis ping failed: {e}")
            return False
    
    def _serialize_image(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string for storage"""
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    def _deserialize_image(self, data: str) -> Image.Image:
        """Convert base64 string back to PIL Image"""
        image_data = base64.b64decode(data)
        return Image.open(io.BytesIO(image_data))
    
    def _serialize_numpy(self, array: np.ndarray) -> str:
        """Convert numpy array to base64 string"""
        buffer = io.BytesIO()
        np.save(buffer, array)
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    def _deserialize_numpy(self, data: str) -> np.ndarray:
        """Convert base64 string back to numpy array"""
        array_data = base64.b64decode(data)
        buffer = io.BytesIO(array_data)
        return np.load(buffer)
    
    def _serialize_reference_data(self, ref_data: ReferenceData) -> Dict[str, Any]:
        """Serialize ReferenceData for storage"""
        return {
            'image': self._serialize_image(ref_data.image),
            'processed_image': self._serialize_numpy(ref_data.processed_image),
            'metrics': asdict(ref_data.metrics),
            'rendering_engine': ref_data.rendering_engine,
            'quality_score': ref_data.quality_score
        }
    
    def _deserialize_reference_data(self, data: Dict[str, Any]) -> ReferenceData:
        """Deserialize ReferenceData from storage"""
        return ReferenceData(
            image=self._deserialize_image(data['image']),
            processed_image=self._deserialize_numpy(data['processed_image']),
            metrics=CharacterMetrics(**data['metrics']),
            rendering_engine=data['rendering_engine'],
            quality_score=data['quality_score']
        )
    
    async def get_reference_data(self, character: str) -> Optional[ReferenceData]:
        """Get cached reference data for a character"""
        cache_key = f"ref_data:{character}"
        
        try:
            if self.use_redis and self.redis_client:
                # Try Redis first
                data = await self.redis_client.get(cache_key)
                if data:
                    serialized_data = pickle.loads(data)
                    return self._deserialize_reference_data(serialized_data)
            
            # Fallback to memory cache
            if cache_key in self.memory_cache:
                return self.memory_cache[cache_key]
            
        except Exception as e:
            logging.error(f"Failed to get cached reference data for '{character}': {e}")
        
        return None
    
    async def set_reference_data(self, character: str, ref_data: ReferenceData):
        """Cache reference data for a character"""
        cache_key = f"ref_data:{character}"
        
        try:
            serialized_data = self._serialize_reference_data(ref_data)
            
            if self.use_redis and self.redis_client:
                # Store in Redis
                await self.redis_client.setex(
                    cache_key, 
                    self.ttl, 
                    pickle.dumps(serialized_data)
                )
            
            # Also store in memory cache as backup
            self.memory_cache[cache_key] = ref_data
            
            logging.debug(f"Cached reference data for character '{character}'")
            
        except Exception as e:
            logging.error(f"Failed to cache reference data for '{character}': {e}")
    
    async def get_feature_vector(self, character: str) -> Optional[Dict[str, float]]:
        """Get cached feature vector for a character"""
        cache_key = f"features:{character}"
        
        try:
            if self.use_redis and self.redis_client:
                data = await self.redis_client.get(cache_key)
                if data:
                    return json.loads(data)
            
            # Fallback to memory cache
            if cache_key in self.memory_cache:
                return self.memory_cache[cache_key]
            
        except Exception as e:
            logging.error(f"Failed to get cached features for '{character}': {e}")
        
        return None
    
    async def set_feature_vector(self, character: str, features: Dict[str, float]):
        """Cache feature vector for a character"""
        cache_key = f"features:{character}"
        
        try:
            if self.use_redis and self.redis_client:
                await self.redis_client.setex(
                    cache_key, 
                    self.ttl, 
                    json.dumps(features)
                )
            
            # Also store in memory cache
            self.memory_cache[cache_key] = features
            
            logging.debug(f"Cached feature vector for character '{character}'")
            
        except Exception as e:
            logging.error(f"Failed to cache features for '{character}': {e}")
    
    async def warm_cache(self, characters: List[str], font_renderer):
        """Warm cache with commonly used characters"""
        logging.info(f"Warming cache for {len(characters)} characters...")
        
        results: Dict[str, bool] = {}
        tasks = []
        for char in characters:
            # Check if already cached
            cached_ref = await self.get_reference_data(char)
            if cached_ref:
                results[char] = True
            else:
                # Need to generate and cache
                task = self._warm_character(char, font_renderer)
                tasks.append(task)
        
        if tasks:
            task_results = await asyncio.gather(*tasks, return_exceptions=True)
            pending_characters = [char for char in characters if char not in results]
            for char, result in zip(pending_characters, task_results):
                results[char] = result is True
            logging.info(f"Cache warming completed for {len(tasks)} characters")
        else:
            logging.info("All characters already cached")

        return results
    
    async def _warm_character(self, character: str, font_renderer):
        """Warm cache for a single character"""
        try:
            # Generate reference data
            img = font_renderer.render_character(character, 256)
            metrics = font_renderer.get_character_metrics(character)
            quality = font_renderer._assess_rendering_quality(img)
            processed = np.array(img, dtype=np.float32) / 255.0
            
            ref_data = ReferenceData(
                image=img,
                processed_image=processed,
                metrics=metrics,
                rendering_engine=font_renderer.selected_engine.value,
                quality_score=quality
            )
            
            # Cache the reference data
            await self.set_reference_data(character, ref_data)
            
            # Also cache basic features
            features = {
                'width': float(metrics.width),
                'height': float(metrics.height),
                'aspect_ratio': float(metrics.width / max(metrics.height, 1)),
                'quality_score': float(quality)
            }
            await self.set_feature_vector(character, features)
            return True
            
        except Exception as e:
            logging.error(f"Failed to warm cache for character '{character}': {e}")
            return False
    
    async def get_evaluation_result(self, character: str, image_hash: str) -> Optional[Dict[str, Any]]:
        """Get cached evaluation result"""
        cache_key = f"eval:{character}:{image_hash}"
        
        try:
            if self.use_redis and self.redis_client:
                data = await self.redis_client.get(cache_key)
                if data:
                    return json.loads(data)
            
            if cache_key in self.memory_cache:
                return self.memory_cache[cache_key]
            
        except Exception as e:
            logging.error(f"Failed to get cached evaluation result: {e}")
        
        return None
    
    async def set_evaluation_result(self, character: str, image_hash: str, result: Dict[str, Any]):
        """Cache evaluation result"""
        cache_key = f"eval:{character}:{image_hash}"
        
        try:
            # Shorter TTL for evaluation results (30 minutes)
            eval_ttl = min(self.ttl, 1800)
            
            if self.use_redis and self.redis_client:
                await self.redis_client.setex(
                    cache_key, 
                    eval_ttl, 
                    json.dumps(result)
                )
            
            self.memory_cache[cache_key] = result
            
        except Exception as e:
            logging.error(f"Failed to cache evaluation result: {e}")
    
    async def invalidate_character(self, character: str):
        """Invalidate all cached data for a character"""
        patterns = [
            f"ref_data:{character}",
            f"features:{character}",
            f"eval:{character}:*"
        ]
        
        try:
            if self.use_redis and self.redis_client:
                for pattern in patterns:
                    if '*' in pattern:
                        # Delete by pattern
                        keys = await self.redis_client.keys(pattern)
                        if keys:
                            await self.redis_client.delete(*keys)
                    else:
                        await self.redis_client.delete(pattern)
            
            # Clear from memory cache
            keys_to_remove = [k for k in self.memory_cache.keys() 
                            if k.startswith(f"ref_data:{character}") or 
                               k.startswith(f"features:{character}") or
                               k.startswith(f"eval:{character}:")]
            
            for key in keys_to_remove:
                del self.memory_cache[key]
            
            logging.info(f"Invalidated cache for character '{character}'")
            
        except Exception as e:
            logging.error(f"Failed to invalidate cache for '{character}': {e}")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        stats = {
            'redis_available': self.use_redis,
            'memory_cache_size': len(self.memory_cache),
            'redis_connected': False
        }
        
        if self.use_redis and self.redis_client:
            try:
                info = await self.redis_client.info()
                stats.update({
                    'redis_connected': True,
                    'redis_memory_used': info.get('used_memory_human', 'unknown'),
                    'redis_keys': info.get('db0', {}).get('keys', 0) if 'db0' in info else 0
                })
            except Exception as e:
                logging.error(f"Failed to get Redis stats: {e}")
        
        return stats

    async def health_check(self) -> Dict[str, Any]:
        """Return cache health in the shape expected by the API layer."""
        stats = await self.get_cache_stats()
        return {
            **stats,
            'healthy': (not self.use_redis) or stats.get('redis_connected', False),
        }
    
    async def clear_cache(self):
        """Clear all cached data"""
        try:
            if self.use_redis and self.redis_client:
                await self.redis_client.flushdb()
            
            self.memory_cache.clear()
            logging.info("Cache cleared successfully")
            
        except Exception as e:
            logging.error(f"Failed to clear cache: {e}")

    async def clear_all_cache(self) -> bool:
        """Compatibility wrapper for API cache management."""
        await self.clear_cache()
        return True
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()


async def get_cache_service(config: CacheConfig) -> CacheService:
    """Factory used by the FastAPI startup path."""
    return CacheService(redis_url=config.redis_url, ttl=config.default_ttl)


# Cache warming utility
class CacheWarmer:
    """Utility for warming cache with common Umwero characters"""
    
    # Common Umwero characters for cache warming
    COMMON_CHARACTERS = ['"', "|", "}", "{", ":"] + list("BCDFGHJKLMNPRSTVWYZ")
    
    @staticmethod
    async def warm_common_characters(cache_service: CacheService, font_renderer):
        """Warm cache with most commonly used characters"""
        await cache_service.warm_cache(CacheWarmer.COMMON_CHARACTERS, font_renderer)
    
    @staticmethod
    async def warm_character_set(cache_service: CacheService, font_renderer, characters: List[str]):
        """Warm cache with specific character set"""
        await cache_service.warm_cache(characters, font_renderer)


# Example usage
if __name__ == "__main__":
    import asyncio
    
    async def test_cache():
        # Initialize cache service
        cache = CacheService()
        
        # Test connection
        connected = await cache.ping()
        print(f"Cache connected: {connected}")
        
        # Get stats
        stats = await cache.get_cache_stats()
        print(f"Cache stats: {stats}")
        
        await cache.close()
    
    # Run test
    asyncio.run(test_cache())

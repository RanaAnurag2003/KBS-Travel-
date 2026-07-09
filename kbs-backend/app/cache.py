import time

class SimpleCache:
    def __init__(self, default_ttl=30):
        self.default_ttl = default_ttl
        self.cache = {}

    def get(self, key):
        if key in self.cache:
            val, expiry = self.cache[key]
            if time.time() < expiry:
                return val
            else:
                del self.cache[key]
        return None

    def set(self, key, val, ttl=None):
        duration = ttl if ttl is not None else self.default_ttl
        self.cache[key] = (val, time.time() + duration)

    def clear(self):
        self.cache.clear()

global_cache = SimpleCache(default_ttl=60)  # 60 seconds default cache TTL

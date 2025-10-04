import json
import os
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path

CACHE_DIR = Path(__file__).parent / "cache"
CACHE_EXPIRY_DAYS = 30


def _ensure_cache_dir():
    CACHE_DIR.mkdir(exist_ok=True)


def get_cache(key: str) -> Optional[dict]:

    _ensure_cache_dir()
    cache_file = CACHE_DIR / f"{key}.json"

    if not cache_file.exists():
        return None

    try:
        with open(cache_file, 'r') as f:
            data = json.load(f)

        # Check if cache is expired
        cached_time = datetime.fromisoformat(data.get('timestamp', ''))
        expiry_time = cached_time + timedelta(days=CACHE_EXPIRY_DAYS)

        if datetime.now() > expiry_time:
            # Cache expired, delete it
            cache_file.unlink()
            return None

        return data.get('data')

    except (json.JSONDecodeError, KeyError, ValueError):
        # Corrupted cache, delete it
        cache_file.unlink()
        return None


def set_cache(key: str, value: dict) -> None:

    _ensure_cache_dir()
    cache_file = CACHE_DIR / f"{key}.json"

    cache_data = {
        'timestamp': datetime.now().isoformat(),
        'data': value
    }

    with open(cache_file, 'w') as f:
        json.dump(cache_data, f, indent=2)

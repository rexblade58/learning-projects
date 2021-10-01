# Solution: Token Bucket Rate Limiter

## Approach

Each key has a bucket storing:

- `tokens` — current available tokens (float, may be fractional)
- `last_refill` — timestamp of the last update

Instead of a background refill loop, we compute tokens **lazily** on every call:

```
elapsed = now - last_refill
tokens   = min(capacity, tokens + elapsed * rate)
last_refill = now
```

## The Code

```python
import threading
import time


class TokenBucket:
    """Per-key token bucket with continuous refill and O(1) cost."""

    def __init__(self, rate: float, capacity: int):
        if rate <= 0 or capacity <= 0:
            raise ValueError("rate and capacity must be positive")
        self.rate = rate          # tokens refilled per second
        self.capacity = capacity  # maximum burst size
        self._buckets: dict[str, tuple[float, float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str, cost: int = 1) -> bool:
        if cost <= 0:
            raise ValueError("cost must be positive")
        if cost > self.capacity:
            return False  # never allow a request bigger than the bucket

        now = time.monotonic()

        with self._lock:
            tokens, last = self._buckets.get(key, (float(self.capacity), now))

            # Lazy refill: add tokens for the elapsed time, capped at capacity
            tokens = min(self.capacity, tokens + (now - last) * self.rate)

            if tokens >= cost:
                self._buckets[key] = (tokens - cost, now)
                return True

            # Not enough tokens - store the refilled value for next time
            self._buckets[key] = (tokens, now)
            return False

    def reset(self, key: str) -> None:
        """Drop a bucket (e.g., on account ban or test teardown)."""
        with self._lock:
            self._buckets.pop(key, None)


# --- Tests ---
limiter = TokenBucket(rate=2, capacity=5)

allowed = [limiter.allow("user-1") for _ in range(5)]
assert allowed == [True] * 5, "first 5 burst allowed"
assert limiter.allow("user-1") is False, "6th blocked"

time.sleep(0.5)  # 0.5s * 2/s = 1 token
assert limiter.allow("user-1") is True, "refill allowed"

# Fractional refill: rate 0.5 → 1 token every 2s
slow = TokenBucket(rate=0.5, capacity=1)
assert slow.allow("k") is True
assert slow.allow("k") is False
time.sleep(1.0)
assert slow.allow("k") is False, "0.5 token < cost 1"
time.sleep(1.2)
assert slow.allow("k") is True, "~1 token after 2s"

# Oversized cost
big = TokenBucket(rate=1, capacity=3)
assert big.allow("k", cost=10) is False, "cost > capacity blocked"

print("TokenBucket tests passed")
```

## Step-by-Step Explanation

| Component | Purpose |
| :--- | :--- |
| `time.monotonic()` | Immune to wall-clock jumps (NTP sync, DST) |
| `tokens + (now - last) * rate` | Continuous refill — the core formula |
| `min(capacity, ...)` | Cap at burst size; extra tokens are lost |
| `float` tokens | Handles fractional rates (0.5/s) without losing accuracy |
| `threading.Lock` | One bucket update is atomic across threads |
| `cost > capacity → False` | Prevent a request that can never be satisfied |

## The Lazy Refill Math

At rate 2/s, after 0.5s idle: `tokens = min(5, 1 + 0.5 * 2) = 2`. No timers, no loops — the math is derived from `tokens = capacity - (consumed since last refill)`.

Fractional case (rate 0.5): after 1s idle, `tokens = min(1, 1 + 0.5) = 1` (float). A `cost=1` request is allowed. Had we stored integers, this would falsely block.

## Complexity

- `allow`: O(1) time, O(keys) memory
- No background threads — refill is computed, not scheduled

## Common Mistakes

1. **Using `time.time()`** — jumps with wall-clock changes; use monotonic
2. **Discrete refill** — adding a whole token per second allows bursts every second
3. **Integer tokens with fractional rates** — rounding drops refill accuracy
4. **Not locking** — two threads can double-spend the same token
5. **Global bucket instead of per-key** — one user drains everyone's budget

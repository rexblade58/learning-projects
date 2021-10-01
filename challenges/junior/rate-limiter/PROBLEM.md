# Challenge: Token Bucket Rate Limiter

**Difficulty:** Junior
**Language:** Python

## Problem

Implement a **token bucket** rate limiter — the algorithm behind API rate limits (GitHub, Stripe, Twilio).

- `allow(key, cost=1) -> bool` — consume `cost` tokens for a key; `True` if allowed
- Tokens refill **continuously** at a fixed rate (not in discrete jumps)
- Burst of up to `capacity` tokens allowed at once
- Different keys (users/API keys/IPs) have independent buckets

## Example

```python
limiter = TokenBucket(rate=2, capacity=5)   # 2 tokens/sec, burst 5
limiter.allow("user-1")      # True (5 → 4)
limiter.allow("user-1")      # True (4 → 3)
limiter.allow("user-1")      # True
limiter.allow("user-1")      # True
limiter.allow("user-1")      # True (1 → 0)
limiter.allow("user-1")      # False (empty)
time.sleep(0.5)              # +1 token
limiter.allow("user-1")      # True (refilled)
```

## Requirements

- O(1) time per call — do NOT loop to refill
- Use a **lazy refill** formula: `tokens = min(capacity, tokens + elapsed * rate)`
- Handle `cost > capacity` gracefully (never allow)
- Thread-safe (use `threading.Lock`)

## Interview Follow-Up

1. What happens to tokens when the rate is fractional (e.g., `rate=0.5`)?
2. How would you scale this to multiple servers (distributed rate limiting)?
3. Compare token bucket vs **sliding window log** vs **fixed window counter**.

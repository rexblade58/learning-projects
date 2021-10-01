# Explanation: Token Bucket Rate Limiter

## Why Rate Limiting Matters

Every serious API ships one. Without it:

- One client can exhaust your DB connections
- A buggy retry loop can DDoS you
- Abuse can burn real money (LLM APIs!)

GitHub: 5,000 requests/hour. Stripe: 100/s. Twilio: 1 request/sec per account. All token bucket (or sliding window) under the hood.

## The Token Bucket Mental Model

Imagine a bucket that holds up to `capacity` tokens. Every `1/rate` seconds, one token drips in. A request costs `cost` tokens — allowed only if enough remain.

```
        rate tokens/sec drip in
              |
    ┌───────┐▼────────┐
    │  tokens <= cap  │   <- request costs N tokens
    └───────┴─────────┘
```

**Burst** is why the bucket exists: 5 tokens → 5 instant requests, then the refill rate governs.

## Lazy Refill vs Timer Refill

| Approach | Mechanism | Problems |
| :--- | :--- | :--- |
| Timer loop | background thread adds tokens | thread leaks, clock drift, CPU wakeups |
| Lazy (ours) | compute on access | none — pure math |

Lazy refill is O(1) per request and uses zero background resources. The formula `tokens = min(cap, tokens + elapsed * rate)` is derived from integral calculus — this is the same pattern as **leaky bucket** and TCP's congestion window updates.

## Distributed Rate Limiting (Interview Answer)

One process can't share state. Options:

1. **Redis + Lua script** — atomic `INCR + EXPIRE` per window (fixed window, simple)
2. **Redis sorted sets** — sliding window log, exact but O(window size) memory
3. **Token bucket in Redis** — same math, `EVALSHA` for atomicity

Trade-offs: fixed window allows 2x bursts at window edges; sliding window is exact but heavier; token bucket is burst-friendly but needs a shared clock.

## Comparison Table

| Algorithm | Burst OK | Memory | Accuracy | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| Fixed window | 2x at edge | O(1) | coarse | trivial |
| Sliding log | yes | O(n) | exact | medium |
| Token bucket | yes | O(1) | smooth | medium |

## Learning Outcomes

- Monotonic clocks vs wall clocks
- Lazy computation instead of timers
- Thread safety with locks
- Per-key state isolation
- Algorithm trade-off reasoning for interviews

## Next Steps

- Implement a sliding window log version and compare memory
- Add a `RedisBucket` using a Lua script (redis-py + EVAL)
- Add a `drain(key, seconds)` API that projects future availability

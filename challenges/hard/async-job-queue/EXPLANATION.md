# Explanation: Resilient Async Job Queue

## Why This Problem Is Hard

It combines five async concepts that each trip up developers:

1. Concurrency limiting (the pump loop)
2. Retry with backoff
3. Timeout-as-failure
4. Drain semantics (waiting for work that may arrive later)
5. Error surfacing

Real production queues (Sidekiq, BullMQ, Celery) implement all of these. This challenge is a miniature version.

## The Pump Pattern

The heart is `_pump()`:

```
enqueue → _pump → while (active < limit && queue not empty)
                     start job
                     job.finally → active--, finished++, _pump
```

Two properties fall out naturally:

- **No polling** — a job finishing triggers the next start
- **Bounded memory** — at most `concurrency` jobs in flight

This is the same event-driven pattern as Node's `stream` backpressure and browser task schedulers.

## Exponential Backoff

```
attempt 1 failure → wait 200ms
attempt 2 failure → wait 400ms
attempt 3 failure → wait 800ms
```

Doubling the delay gives the failing service time to recover while keeping total retry time bounded (`200 * (2^n - 1)`).

The same math governs:

- TCP retransmission (RFC 6298)
- HTTP 429 handling
- Database connection retries

## Timeout: The Race Pattern

```javascript
new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('timeout')), ms);
  job().then(resolve, reject).finally(() => clearTimeout(timer));
});
```

This "race a task against a clock" pattern is everywhere: HTTP clients, locks, health checks. The `.finally(clearTimeout)` matters — otherwise timers leak and keep the Node process alive.

## Drain Semantics: The Tricky Part

`drain()` must not resolve while:

- the queue has items, OR
- jobs are running, OR
- jobs were added after drain() was called

The `finished === total` guard handles the "enqueued during drain" case — a classic off-by-one bug factory.

## Multi-Process Scaling (Interview Answer)

Across processes, the in-memory queue can't coordinate. You'd use Redis + a job protocol:

- **Redis List** (`LPUSH`/`BRPOP`) as the queue
- **Redis Set** for in-flight jobs (crash recovery)
- Workers claim jobs with an atomic `BRPOPLPUSH` — crash-safe because the job is only removed from in-flight when finished

Guarantees lost: at-most-once vs at-least-once, ordering across workers, and per-process backoff coordination.

## Learning Outcomes

- Event-driven concurrency without libraries
- Backoff strategies and timeout races
- Drain/graceful-shutdown semantics
- Scaling an in-process pattern to a distributed one

## Next Steps

- Add priorities using a min-heap instead of a FIFO array
- Add `pause()`/`resume()` and test that a paused queue still drains
- Reimplement with `worker_threads` so CPU-bound jobs don't block the event loop

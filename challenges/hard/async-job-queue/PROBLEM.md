# Challenge: Resilient Async Job Queue

**Difficulty:** Hard
**Language:** Node.js (JavaScript)

## Problem

Build an async job queue with:

- `enqueue(job)` — add a job that runs as a function returning a Promise
- `enqueue` jobs run with a **concurrency limit** (e.g., 2 at a time)
- **Retry with exponential backoff** on failure (max 3 attempts)
- `drain` — returns a Promise that resolves when the queue is empty
- A **timeout** per job (a job taking longer than 2s is treated as failed)

## Example

```js
const queue = new JobQueue({ concurrency: 2, retries: 3, timeoutMs: 2000 });

queue.enqueue(() => fakeTask('job-A', 300));   // ok
queue.enqueue(() => fakeTask('job-B', 2500));  // times out, retried
queue.enqueue(() => fakeTask('job-C', 100));   // ok
await queue.drain();
// job-A, job-B, job-C completed (job-B after retries)
```

## Constraints

- Do NOT use external libraries (`p-queue`, `async.queue`)
- Must handle jobs enqueued **while the queue is draining**
- A failed job after all retries must be surfaced (emit an `error` event)

## Stretch Goal

Add a `pause()`/`resume()` API and priority support: `enqueue(job, { priority: 1 })` where lower numbers run first.

## Interview Follow-Up

Explain how you would scale this to multiple Node.js processes (hint: a message broker like Redis BullMQ), and what guarantees you lose across processes.

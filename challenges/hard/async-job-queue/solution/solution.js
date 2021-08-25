# Solution: Resilient Async Job Queue

## Approach

A classic worker-pool pattern:

- A **queue** (FIFO) holds pending jobs
- A fixed number of **active workers** pull jobs and run them
- Each worker wraps execution with **retry + backoff + timeout**
- An internal counter + resolver implement `drain`

## The Code

```javascript
const { EventEmitter } = require('events');

/**
 * Async job queue with concurrency limit, retry with exponential
 * backoff, per-job timeout, and a drain() Promise.
 */
class JobQueue extends EventEmitter {
  /**
   * @param {Object} opts
   * @param {number} opts.concurrency   max jobs running at once
   * @param {number} opts.retries       attempts per job (default 3)
   * @param {number} opts.timeoutMs     per-attempt timeout (default 2000)
   */
  constructor({ concurrency = 2, retries = 3, timeoutMs = 2000 } = {}) {
    super();
    this.concurrency = concurrency;
    this.retries = retries;
    this.timeoutMs = timeoutMs;

    this.queue = [];          // pending jobs
    this.active = 0;          // currently running jobs
    this.finished = 0;        // completed (success or exhausted)
    this.total = 0;           // jobs ever enqueued
    this._resolveDrain = null;
    this._drainPromise = null;
  }

  /**
   * Add a job. Job is a function returning a Promise.
   */
  enqueue(job) {
    this.total++;
    this.queue.push(job);
    this._pump();
  }

  /** Resolve when the queue is empty and nothing is running. */
  drain() {
    if (!this._drainPromise) {
      this._drainPromise = new Promise((resolve) => {
        this._resolveDrain = resolve;
      });
    }
    this._maybeResolveDrain();
    return this._drainPromise;
  }

  // --- internals ---

  /** Start jobs until we hit the concurrency limit. */
  _pump() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      this.active++;
      this._runWithRetry(job).finally(() => {
        this.active--;
        this.finished++;
        this._maybeResolveDrain();
        this._pump(); // pull the next job
      });
    }
  }

  /** Run one job with timeout + exponential-backoff retries. */
  async _runWithRetry(job) {
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        await this._runWithTimeout(job);
        return; // success
      } catch (err) {
        if (attempt === this.retries) {
          // All attempts exhausted - surface the failure
          this.emit('error', err);
          return;
        }
        // Exponential backoff: 200ms, 400ms, 800ms...
        const delay = 200 * 2 ** (attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  /** Run a job but reject if it exceeds timeoutMs. */
  _runWithTimeout(job) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('job timed out')),
        this.timeoutMs
      );
      Promise.resolve()
        .then(job)
        .then((v) => { clearTimeout(timer); resolve(v); })
        .catch((e) => { clearTimeout(timer); reject(e); });
    });
  }

  _maybeResolveDrain() {
    if (
      this._resolveDrain &&
      this.queue.length === 0 &&
      this.active === 0 &&
      this.finished === this.total
    ) {
      const resolve = this._resolveDrain;
      this._resolveDrain = null;
      this._drainPromise = null;
      resolve();
    }
  }
}

// --- Tests ---
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fakeTask(name, workMs, fail = false) {
  console.log(`  start ${name}`);
  await delay(workMs);
  if (fail) throw new Error(`${name} failed`);
  console.log(`  done  ${name}`);
  return name;
}

async function main() {
  const queue = new JobQueue({ concurrency: 2, retries: 3, timeoutMs: 2000 });
  queue.on('error', (err) => console.log(`  [error] ${err.message}`));

  queue.enqueue(() => fakeTask('A', 300));
  queue.enqueue(() => fakeTask('B', 2500)); // will time out, then retried
  queue.enqueue(() => fakeTask('C', 100));
  queue.enqueue(() => fakeTask('D', 400));

  await queue.drain();
  console.log('All jobs settled (B may have exhausted retries)');
}

main();
```

## Step-by-Step Explanation

| Component | Purpose |
| :--- | :--- |
| `enqueue → _pump()` | Immediately tries to start work, not just pushes |
| `while (active < concurrency)` | The concurrency throttle |
| `_runWithRetry` | Retry loop with backoff `200 * 2^(attempt-1)` |
| `_runWithTimeout` | Race between the job and a timer |
| `_maybeResolveDrain` | Guarded resolution — only when idle AND all finished |
| `drain()` | Returns a cached promise; re-armed after resolve |

## Why This Design

- **Backpressure** — jobs enqueued during a drain increment `total`, so `finished === total` stays false until they complete too
- **Backoff** — exponential avoids hammering a failing dependency
- **Timeout as failure** — converts a hang into a retryable error

## Complexity

- Each job: O(retries) attempts, each O(1) scheduling
- The queue itself is O(n) memory for pending jobs

## Common Mistakes

1. **Resolving drain too early** — must check `finished === total`, not just empty queue
2. **Not clearing the timeout** — a resolved job leaves a dangling timer keeping the process alive
3. **Sharing one timeout across retries** — each attempt should get a fresh window
4. **Recursion in _pump** — safe here (event loop tick between) but beware stack growth for huge queues; a loop is fine because `.finally` schedules on the next tick

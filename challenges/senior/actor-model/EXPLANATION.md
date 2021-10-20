# Explanation: Actor Model

## The Problem With Shared Memory

Classic concurrency:

```go
var mu sync.Mutex
var count int
mu.Lock()
count++
mu.Unlock()
```

Every lock is a **coordination point** where two threads can disagree. Deadlocks, races, and reentrancy bugs all live here. Erlang's insight: **if you forbid sharing, you forbid the bugs**.

## The Actor Rules

1. An actor owns its state — nothing else can touch it
2. Actors communicate only via immutable messages
3. Each actor processes messages one at a time, in order
4. An actor can create other actors and supervise them

Rule 3 is the superpower: because handlers never run concurrently, there is nothing to lock. This is why Erlang systems run millions of actors on commodity hardware.

## Go's Two Concurrency Models

| | CSP (goroutines + channels) | Actors |
| :--- | :--- | :--- |
| Communication | channels between goroutines | mailboxes between actors |
| Isolation | goroutines may share memory | state strictly owned |
| Failure handling | manual (panic recover) | supervisor trees |
| Ordering | per-channel FIFO | per-actor FIFO |

Go is CSP-first, but the actor pattern on top gives you supervision — which is what makes Erlang's OTP resilient.

## The Ask/Reply Correlation Trick

`Ask` needs to know which reply belongs to which request. Options:

- **Reply channel in the envelope** (ours) — per-call correlation, O(1)
- Reply with a request ID — requires a shared table (shared state!)

The envelope approach keeps everything inside the message, preserving isolation.

## Fault Tolerance: Why Supervision Beats Try/Catch

A crashed actor loses its state. The supervisor's job is to rebuild it:

```
supervisor watches actor.done
  → actor crashed
  → backoff (50ms, 100ms, 200ms...)
  → restart actor
  → give up after N crashes
```

Backoff prevents a crash-loop from burning CPU — the same idea as connection retry backoff. Erlang escalates further: supervisors form a tree, so a whole subsystem can restart if a critical actor dies.

## Real-World Actors

| System | Actor runtime |
| :--- | :--- |
| WhatsApp | Erlang/OTP (2M+ concurrent connections per server) |
| Discord | Elixir + Phoenix |
| Trading platforms | Akka (JVM) |
| Cloudflare | Erlang-based control plane |

## Learning Outcomes

- Channel-based message passing without shared state
- Request/reply correlation via envelope channels
- Graceful shutdown with drain semantics
- Supervision trees and exponential backoff
- Comparing CSP vs actor vs shared-memory models

## Next Steps

- Add message priority (two mailboxes, drain high first)
- Add `Ask` with per-message context cancellation
- Implement an actor router (round-robin across worker actors)
- Study Erlang's OTP `gen_server` callbacks and map them to this design

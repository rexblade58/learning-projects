# Challenge: Actor Model with Zero Shared State

**Difficulty:** Senior
**Language:** Go

## Problem

Implement a minimal **actor system** where actors communicate ONLY via messages — no shared memory, no locks:

- `NewActor(name, handler)` — creates an actor with a message handler
- `actor.Send(msg)` — async message delivery (non-blocking)
- `actor.Ask(msg, timeout)` — request/reply with a timeout
- `actor.Stop()` — graceful shutdown (drains pending messages)
- A supervisor that restarts crashed actors with exponential backoff

## Why

The actor model is how Erlang/Elixir and Akka handle millions of concurrent units safely. Go's goroutines + channels are a natural fit, but most Go code falls back to shared structs + mutex. This challenge forces channel-only design.

## Example

```go
ping := NewActor("ping", func(msg any) (any, error) {
    return "pong", nil
})
defer ping.Stop()

reply, err := ping.Ask("hello", time.Second)
// reply = "pong"
```

## Requirements

- Each actor owns exactly ONE goroutine — no per-message goroutines
- `Send` must never block the caller
- `Ask` returns `ErrTimeout` if no reply within the window
- Messages must be processed in FIFO order
- The supervisor must keep an actor alive through 3 crashes, then give up

## Interview Follow-Up

Compare the actor model with:

1. Shared memory + locks
2. Communicating Sequential Processes (CSP) — Go's native model
3. How Erlang makes actors fault-tolerant (process isolation + crash signals)

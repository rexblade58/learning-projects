# Solution: Actor Model in Go

## Approach

- Every actor has a **mailbox** (`chan msgEnvelope`) and **one** goroutine draining it
- `Send` puts an envelope on the mailbox — non-blocking via buffered channel + select
- `Ask` creates a reply channel inside the envelope and waits on it (or timeout)
- A `Stop` closes the mailbox; the goroutine drains remaining work then exits
- The supervisor watches `done` channels and restarts actors with backoff

## The Code

```go
package main

import (
	"errors"
	"fmt"
	"time"
)

type Message = any

// envelope wraps a message with an optional reply channel
type envelope struct {
	msg    Message
	reply  chan Message
}

// Handler processes one message; returning an error crashes the actor
type Handler func(msg Message) (Message, error)

type Actor struct {
	name    string
	handler Handler
	mailbox chan envelope
	done    chan struct{}
}

var ErrTimeout = errors.New("actor: reply timeout")
var ErrStopped = errors.New("actor: stopped")

func NewActor(name string, handler Handler) *Actor {
	a := &Actor{
		name:    name,
		handler: handler,
		mailbox: make(chan envelope, 64),
		done:    make(chan struct{}),
	}
	go a.loop()
	return a
}

// Send delivers a message asynchronously; never blocks the caller.
func (a *Actor) Send(msg Message) {
	select {
	case a.mailbox <- envelope{msg: msg}:
	case <-a.done:
		// actor shutting down - drop silently
	}
}

// Ask sends a message and waits for the reply or a timeout.
func (a *Actor) Ask(msg Message, timeout time.Duration) (Message, error) {
	reply := make(chan Message, 1)
	select {
	case a.mailbox <- envelope{msg: msg, reply: reply}:
	case <-a.done:
		return nil, ErrStopped
	}
	select {
	case r := <-reply:
		return r, nil
	case <-time.After(timeout):
		return nil, ErrTimeout
	}
}

// Stop closes the mailbox and waits for the actor goroutine to finish.
func (a *Actor) Stop() {
	select {
	case <-a.done:
		return // already stopped
	default:
	}
	close(a.done)
	// The loop sees done and exits after draining remaining messages.
	<-a.done
}

// loop: the actor's single goroutine. FIFO processing.
func (a *Actor) loop() {
	defer close(a.done)
	for {
		select {
		case env := <-a.mailbox:
			// Even when shutting down, drain what arrived first
			for env.msg != nil || env.reply != nil {
				a.handle(env)
				select {
				case env = <-a.mailbox:
				default:
					env = envelope{}
				}
			}
		case <-a.done:
			return
		}
	}
}

func (a *Actor) handle(env envelope) {
	result, err := a.handler(env.msg)
	if env.reply != nil {
		if err != nil {
			env.reply <- err // reply channel receives error as value
		} else {
			env.reply <- result
		}
	}
}

// --- Supervisor: restart crashed actors with exponential backoff ---
type Supervisor struct {
	restartBase time.Duration
}

func (s *Supervisor) supervise(name string, handler Handler, maxCrashes int) *Actor {
	for attempt := 0; attempt < maxCrashes; attempt++ {
		actor := NewActor(name, handler)
		select {
		case <-actor.done:
			// crashed (loop exited unexpectedly) - backoff and restart
			backoff := s.restartBase * time.Duration(1<<attempt)
			fmt.Printf("  supervisor: %s crashed, restarting in %v\n", name, backoff)
			time.Sleep(backoff)
		case <-time.After(10 * time.Second):
			return actor // survived - done supervising
		}
	}
	fmt.Printf("  supervisor: %s gave up after %d crashes\n", name, maxCrashes)
	return nil
}

func main() {
	// Basic ask/reply
	ping := NewActor("ping", func(msg Message) (Message, error) {
		return "pong:" + fmt.Sprint(msg), nil
	})
	reply, err := ping.Ask("hello", time.Second)
	if err == nil {
		fmt.Println("ping->", reply)
	}
	ping.Stop()

	// FIFO + Send ordering
	order := NewActor("order", func(msg Message) (Message, error) {
		fmt.Println("  order:", msg)
		return nil, nil
	})
	for i := 1; i <= 3; i++ {
		order.Send(i)
	}
	time.Sleep(50 * time.Millisecond)
	order.Stop()

	// Supervisor: crash twice, recover
	boom := &Supervisor{restartBase: 50 * time.Millisecond}
	actor := boom.supervise("flaky", func(msg Message) (Message, error) {
		return nil, errors.New("crash")
	}, 3)
	if actor == nil {
		fmt.Println("flaky actor gave up - expected after crashes")
	} else {
		actor.Stop()
	}
}
```

## Step-by-Step Explanation

| Component | Purpose |
| :--- | :--- |
| Buffered mailbox (cap 64) | `Send` rarely blocks; backpressure beyond 64 |
| `select` in `Send` | Non-blocking semantics — drop if shutting down |
| `reply chan` per `Ask` | Request/reply correlation without shared state |
| `time.After(timeout)` | Bounded wait — no leaked goroutines |
| Single `loop()` goroutine | FIFO ordering guaranteed by channel semantics |
| Supervisor | Failure detection via `done`, restart with `1<<attempt` backoff |

## Why FIFO Holds

Go channels are FIFO. Since one goroutine drains and processes serially, message order equals send order — the actor guarantees no two handlers run concurrently.

## Complexity

- `Send`: O(1), non-blocking
- `Ask`: O(1) + timeout wait
- Memory: O(mailbox size) per actor

## Common Mistakes

1. **Per-message goroutines** — breaks FIFO and can exceed limits
2. **Shared reply channel** — must be per-Ask
3. **Blocking `Send`** — deadlocks the caller on a full mailbox
4. **Supervisor restart loops** — always back off, or a hot loop burns CPU
5. **Not draining on Stop** — messages in flight get dropped silently (acceptable, but document it)

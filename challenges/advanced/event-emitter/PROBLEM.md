# Challenge: EventEmitter from Scratch

**Difficulty:** Advanced
**Language:** JavaScript

## Problem

Implement an `EventEmitter` class matching Node.js semantics:

- `on(event, listener)` — register a listener
- `once(event, listener)` — auto-remove after first emit
- `off(event, listener)` — remove a specific listener
- `emit(event, ...args)` — call all listeners with args
- `removeAllListeners(event?)` — clear listeners (optionally for one event)
- `listenerCount(event)` — count listeners for an event

## Requirements

- Listeners must be called in registration order
- `once` listeners must be removed even if they throw
- `emit` must catch errors from one listener **without** stopping the others (Node does NOT — but a robust emitter should, exposing an `error` event)
- Use an internal `Map<string, Set<Listener>>` — never arrays with holes

## Edge Cases

- `on` the same function twice — should register twice (matching Node)
- `emit` while a `once` listener is being removed (mutation during iteration)
- `off` a listener that was already removed — no-op

## Stretch Goal

Implement `EventEmitterAsync` where `emit` awaits async listeners sequentially and rejects on the first error.

# Explanation: EventEmitter from Scratch

## Why Rebuild What Node Gives You

`EventEmitter` is the backbone of Node.js — every stream, server, and request inherits it. Building it from scratch forces you to understand:

- Reference semantics (how `off` finds a listener)
- Mutation-during-iteration bugs
- Error propagation philosophy

These are the same problems in every pub/sub system: Redis pub/sub, browser `EventTarget`, WebSocket message dispatch.

## The Data Structure Choice

| Structure | add | remove | iterate | verdict |
| :--- | :--- | :--- | :--- | :--- |
| Array + splice | O(1) | O(n) + index drift | fast | bad |
| Object/map of sets | O(1) | O(1) | insertion order | **chosen** |

Sets also give you `size` for free — `listenerCount` becomes a lookup.

## Snapshot Iteration: The Subtle Bug

```javascript
// BUGGY: once listener removes itself while iterating
for (const fn of set) {
  if (fn._once) set.delete(fn);  // skips the NEXT element
  fn();
}
```

JavaScript Sets iterate in insertion order and skip elements removed during iteration — so a self-removing `once` listener causes its successor to be skipped. The fix — copying to an array first — is the same pattern used by Kafka-style consumer groups when a consumer disconnects mid-batch.

## Error Isolation Design Decision

Node's EventEmitter does NOT catch listener errors — an uncaught throw crashes the process. That's intentional (fail fast). Our version isolates, which is better for long-running services but changes the semantics. The interview question is: **which behavior does your system need?**

## The `once` + `off` Identity Problem

`once` wraps the user's function. If the user later calls `off(event, originalFn)`, the wrapper is invisible. Node links them via a hidden property. We do the same with `_original` — and it's a great example of **indirection solving identity**.

## Learning Outcomes

- Map/Set as O(1) associative + ordered structures
- Snapshot iteration for mutation safety
- The observer pattern and its failure modes
- Error handling philosophy in event-driven systems

## Next Steps

- Add `prependListener` (insert at head)
- Add wildcard events (`'*'` fires for any event)
- Implement an async variant: `emit` awaits each listener and rejects on first failure
- Compare your implementation against `EventTarget`'s `dispatchEvent` semantics

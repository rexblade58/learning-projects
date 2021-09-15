# Solution: EventEmitter from Scratch

## Approach

Use a `Map` keyed by event name, holding a `Set` of listeners. Sets give O(1) add/remove and safe iteration-snapshot semantics. `once` wraps the user listener in a wrapper that self-removes, and we snapshot the listener list before iterating so mutation during emit doesn't skip listeners.

## The Code

```javascript
class EventEmitter {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /** Register a listener for an event. */
  on(event, listener) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(listener);
    return this; // chainable, like Node
  }

  /**
   * Register a one-shot listener.
   * Wrapped so it removes itself even if the listener throws.
   */
  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);   // remove FIRST (Node semantics)
      return listener.apply(this, args);
    };
    // Keep a reference so off(originalFn) still works? Node links them;
    // here we store the wrapper and let off() accept either.
    wrapper._original = listener;
    return this.on(event, wrapper);
  }

  /** Remove a listener. Accepts the original or the wrapper. */
  off(event, listener) {
    const set = this._listeners.get(event);
    if (!set) return this;
    // Node removes by identity; wrapper may hold ._original
    for (const fn of set) {
      if (fn === listener || fn._original === listener) {
        set.delete(fn);
      }
    }
    if (set.size === 0) this._listeners.delete(event);
    return this;
  }

  /**
   * Call all listeners in registration order.
   * Snapshot first so mutation during emit is safe.
   */
  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (!set) return false;

    const snapshot = [...set]; // stable iteration
    for (const listener of snapshot) {
      try {
        listener.apply(this, args);
      } catch (err) {
        // Isolated failure: forward to 'error' listeners if any,
        // otherwise rethrow asynchronously to avoid swallowing.
        if (event !== 'error' && this._listeners.has('error')) {
          this.emit('error', err);
        } else {
          queueMicrotask(() => { throw err; });
        }
      }
    }
    return true;
  }

  /** Remove all listeners, optionally scoped to one event. */
  removeAllListeners(event) {
    if (event === undefined) {
      this._listeners.clear();
    } else {
      this._listeners.delete(event);
    }
    return this;
  }

  /** Count listeners for an event. */
  listenerCount(event) {
    return this._listeners.get(event)?.size ?? 0;
  }
}

// --- Tests ---
const emitter = new EventEmitter();

// Ordering
const order = [];
emitter.on('x', () => order.push(1));
emitter.on('x', () => order.push(2));
emitter.emit('x');
console.assert(JSON.stringify(order) === '[1,2]', 'registration order');

// Once + throw isolation
let onceCount = 0;
emitter.once('boom', () => { onceCount++; throw new Error('listener threw'); });
emitter.on('boom', () => order.push(3));
emitter.emit('boom');
emitter.emit('boom'); // once already removed
console.assert(onceCount === 1, 'once fires exactly once');
console.assert(emitter.listenerCount('boom') === 1, 'wrapper removed');

// Off
const fn = () => {};
emitter.on('y', fn);
emitter.off('y', fn);
console.assert(emitter.listenerCount('y') === 0, 'off removes');

console.log('EventEmitter tests passed');
```

## Step-by-Step Explanation

| Feature | Implementation | Why |
| :--- | :--- | :--- |
| Storage | `Map<string, Set<Function>>` | O(1) add/remove, no array holes |
| Ordering | `[...set]` snapshot | Set preserves insertion order; snapshot immune to mutation |
| `once` | wrapper that calls `off` first | Guarantees removal even when the listener throws |
| Error isolation | try/catch per listener | One bad listener can't break the rest |
| `error` event | re-emit or async rethrow | Node convention: unhandled 'error' crashes; here we degrade gracefully |

## Why Snapshot Iteration

If a `once` listener removes itself during `emit` (as our wrapper does), iterating the live Set could skip the next listener. Taking `[...set]` first decouples the iteration from mutation — the classic "concurrent modification" fix.

## Complexity

- `on`/`off`: O(1) amortized
- `emit`: O(listeners) + snapshot copy O(listeners)
- Memory: O(events × listeners)

## Common Mistakes

1. **Using an array and `splice`** — O(n) removal, index drift during iteration
2. **Not snapshotting** — `once` self-removal skips the next listener
3. **Swallowing listener errors** — always surface them somehow
4. **Removing after calling the listener in `once`** — if the listener re-registers itself (`emitter.on('x', ...)` inside), removing after would delete the new one; Node removes first

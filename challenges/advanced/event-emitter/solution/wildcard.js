# Solution: EventEmitter with Wildcard Support

This extends the base EventEmitter with `'*'` wildcard events.
Fires the wildcard listeners for ANY event, passing the event name
as the first argument.

```javascript
class WildcardEmitter extends EventEmitter {
  /**
   * Wildcard support: listeners registered for '*' fire for every event,
   * with the actual event name passed as the first argument.
   */
  emit(event, ...args) {
    // 1. Notify wildcard listeners (if any)
    if (event !== '*') {
      const wildcardSet = this._listeners.get('*');
      if (wildcardSet && wildcardSet.size > 0) {
        const wildcardSnapshot = [...wildcardSet];
        for (const listener of wildcardSnapshot) {
          try {
            listener.call(this, event, ...args);
          } catch (err) {
            this._reportError(err, event);
          }
        }
      }
    }
    // 2. Notify the specific event's listeners (base behavior)
    return super.emit(event, ...args);
  }
}
```

## Why the Event Name Comes First

Wildcard listeners need context — otherwise `'update'` and `'delete'` would be indistinguishable. Passing `event` as the first argument mirrors DOM event objects and socket.io's `'*'` middleware signature.

## Full WildcardEmitter (combining both features)

```javascript
class WildcardEmitter extends EventEmitter {
  constructor() {
    super();
  }

  /** Wildcard-aware emit. */
  emit(event, ...args) {
    if (event !== '*') {
      this._fireWildcards(event, args);
    }
    return super.emit(event, ...args);
  }

  _fireWildcards(event, args) {
    const set = this._listeners.get('*');
    if (!set) return;
    for (const listener of [...set]) {
      try {
        listener.call(this, event, ...args);
      } catch (err) {
        this._reportError(err, event);
      }
    }
  }

  _reportError(err, event) {
    if (this._listeners.has('error')) {
      this.emit('error', err, event);
    } else {
      queueMicrotask(() => {
        throw err;
      });
    }
  }
}

// --- Tests ---
const emitter = new WildcardEmitter();
const seen = [];

emitter.on('*', (name, ...payload) => seen.push([name, ...payload]));
emitter.on('update', (id) => seen.push(['update-specific', id]));

emitter.emit('update', 42);
emitter.emit('delete', 7);

// Wildcard fired for both, specific fired once
assert(seen.some((s) => s[0] === 'update' && s[1] === 42));
assert(seen.some((s) => s[0] === 'delete' && s[1] === 7));
assert(seen.filter((s) => s[0] === 'update-specific').length === 1);

function assert(cond) {
  if (!cond) throw new Error('assertion failed');
}
console.log('Wildcard emitter tests passed');
```

## Step-by-Step Explanation

| Step | Code | Why |
| :--- | :--- | :--- |
| Guard `event !== '*'` | avoids recursive wildcard | `emit('*')` would re-enter itself |
| Snapshot before loop | `[...set]` | mutation-safe iteration |
| `listener.call(this, event, ...args)` | event name injected first | gives wildcard listeners context |
| Reuse `_reportError` | isolated errors | consistent with base emitter |

## Complexity

- Wildcard emit: O(wildcard listeners) extra per emit
- No change to `on`/`off` — `'*'` is just another key

## Common Mistakes

1. **Infinite recursion** — emitting `'*'` must not re-trigger wildcards
2. **Swallowing the event name** — without it wildcards are useless
3. **Ordering** — wildcards fire before specific listeners (like DOM capture phase)

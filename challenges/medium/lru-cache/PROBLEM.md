# Challenge: LRU Cache

**Difficulty:** Medium
**Language:** Python

## Problem

Design a Least Recently Used (LRU) cache that supports:

- `get(key)` — return the value, or `-1` if missing
- `put(key, value)` — insert or update; if over capacity, evict the **least recently used** entry

Both operations must run in **O(1)**.

## Examples

```
cache = LRUCache(2)
cache.put(1, 1)      # cache = {1:1}
cache.put(2, 2)      # cache = {1:1, 2:2}
cache.get(1)         # 1  (marks key 1 as most recently used)
cache.put(3, 3)      # evicts key 2  (least recently used)
cache.get(2)         # -1 (evicted)
cache.get(3)         # 3
cache.put(4, 4)      # evicts key 1
cache.get(1)         # -1 (evicted)
```

## Constraints

- `0 <= capacity <= 10_000`
- At most 200,000 operations
- Do NOT use `collections.OrderedDict` — implement the data structure yourself

## Why O(1)?

A dict alone is O(1) for access but has no ordering. A linked list alone is O(1) for insertion but O(n) for lookup. You need **both** — a dict of nodes + a doubly-linked list. Explain this reasoning in your own words.

## Stretch Goal

Add a `snapshot()` method that returns the cache contents in recency order (most recent first), without mutating the cache.

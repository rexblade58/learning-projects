# Solution: LRU Cache

## Approach

Combine two structures:

1. **Doubly-linked list** — tracks recency order. Head = most recently used, tail = least recently used.
2. **Hash map** (dict) — key → node reference for O(1) lookup.

`get` moves a node to the head. `put` inserts at the head and evicts the tail when over capacity.

## The Code

```python
class _Node:
    """Doubly-linked list node: value + prev/next pointers."""
    __slots__ = ("key", "value", "prev", "next")

    def __init__(self, key: int, value: int):
        self.key = key
        self.value = value
        self.prev: "_Node | None" = None
        self.next: "_Node | None" = None


class LRUCache:
    """O(1) get/put using dict + doubly-linked list."""

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache: dict[int, _Node] = {}

        # Sentinel nodes avoid null checks at the boundaries
        self.head = _Node(0, 0)  # dummy head (most recent side)
        self.tail = _Node(0, 0)  # dummy tail (least recent side)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: _Node) -> None:
        """Unlink a node from the list (O(1) with prev/next pointers)."""
        prev, nxt = node.prev, node.next
        prev.next = nxt
        nxt.prev = prev

    def _add_to_head(self, node: _Node) -> None:
        """Insert node right after the dummy head."""
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        node = self.cache.get(key)
        if node is None:
            return -1
        # Recency update: move to head
        self._remove(node)
        self._add_to_head(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            # Update existing entry, then refresh recency
            node = self.cache[key]
            node.value = value
            self._remove(node)
            self._add_to_head(node)
            return

        node = _Node(key, value)
        self.cache[key] = node
        self._add_to_head(node)

        if len(self.cache) > self.capacity:
            # Evict the least recently used = tail.prev (before dummy tail)
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]


# --- Tests ---
cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
assert cache.get(1) == 1
cache.put(3, 3)
assert cache.get(2) == -1, "key 2 should have been evicted"
assert cache.get(3) == 3
cache.put(4, 4)
assert cache.get(1) == -1
print("All LRU cache tests passed")
```

## Step-by-Step Explanation

| Component | Purpose |
| :--- | :--- |
| `_Node.__slots__` | Saves memory by disabling `__dict__` per node |
| Sentinel head/tail | Eliminates boundary null-checks — head.next is always valid |
| `_remove` | Unlinks in 4 pointer assignments — O(1) |
| `_add_to_head` | Inserts after dummy head — O(1) |
| Eviction | `tail.prev` is the true LRU node — remove it and delete from dict |

## Why Sentinels Matter

Without dummy nodes, inserting at the head when the list is empty requires a special case. With sentinels, `head.next` and `tail.prev` are always valid, so the same code path handles empty and non-empty lists.

## Complexity

- **get:** O(1)
- **put:** O(1)
- **Space:** O(capacity)

## Common Mistakes

1. **Forgetting to refresh recency on `get`** — a key that is read should not be evicted next
2. **Evicting the wrong node** — must be `tail.prev`, not `tail`
3. **Updating value without moving to head** — `put` on an existing key is also an access
4. **Leaking the dict** — deleting the key from `cache` during eviction, not just unlinking

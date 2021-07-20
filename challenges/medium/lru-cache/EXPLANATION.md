# Explanation: LRU Cache

## Why This Problem Is a Classic

LRU Cache tests whether you understand **why** data structures exist, not just what they do. A dict gives O(1) lookup. A linked list gives O(1) insertion/deletion. Neither alone satisfies the requirement — the answer is combining them.

## The Core Insight: Recency = Order

"Least recently used" implies an ordering. The cache's state is not "a set of key-value pairs" — it is an **ordered sequence** where position encodes recency.

- Most recent → head of the list
- Least recent → tail of the list

Every operation is a transformation of this order:

| Operation | Effect on order |
| :--- | :--- |
| `get(key)` | moves key to the head |
| `put(new key)` | inserts at the head |
| eviction | removes the tail |

## The Data Structure Marriage

```
        dict            linked list
    key -> node  <--->  node <-> node <-> node
                        head        tail
                       (recent)   (oldest)
```

- **dict** gives the O(1) "find the node for this key"
- **linked list** gives the O(1) "reorder and evict"

This "index + ordered structure" pairing shows up in real systems:

- **Redis** uses it for `maxmemory-policy allkeys-lru`
- **PostgreSQL** buffer manager evicts buffers LRU-style
- **OS page replacement** (LRU approximation)

## Sentinel Nodes: The Professional Touch

Dummy head/tail nodes remove edge cases. Empty list? `head.next` is still `tail`, so insertion code never branches. This is the same trick used in Linux kernel linked lists.

## Real-World Variants Interviewers Ask

1. **LFU (least frequently used)** — track access counts; a min-heap + dict
2. **TTL cache** — store expiry timestamps; lazy eviction on read
3. **Sharded LRU** — multiple instances behind a hash; used by CDNs

## Learning Outcomes

- Doubly-linked list pointer surgery
- Sentinel node patterns
- Space/time trade-off reasoning
- "Why not just a dict?" interview narrative

## Next Steps

- Reimplement with a **sentinel-free** version and count the extra branches
- Add a `snapshot()` that walks the list head→tail and returns keys in recency order
- Implement LFU and compare eviction behavior with a stress test

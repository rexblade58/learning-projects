# Explanation: Two Sum

## The Problem Everyone Asks, The Optimization Everyone Misses

Two Sum is the gateway problem. The naive solution is two nested loops:

```typescript
for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++)
    if (nums[i] + nums[j] === target) return [i, j];
```

O(n²) — 10,000 elements means 50M comparisons.

## Insight 1: Trading Space for Time

The HashMap solution reframes the problem:

> "Instead of searching for a pair, remember what I've seen and ask: **have I already seen the complement?**"

```
target = 9
nums = [2, 7, 11, 15]

i=0: complement = 7 → not seen → store {2:0}
i=1: complement = 2 → SEEN at index 0 → answer [0,1]
```

Each element is processed once. O(n).

## Insight 2: Trading Time for Space

The sorted two-pointer solution uses the **sortedness invariant**: the sum can only go up by moving `left` right, and down by moving `right` left. This is the same core idea behind:

- Binary search
- Container with most water
- 3Sum

## When to Use Which

| Situation | Choose |
| :--- | :--- |
| Memory is plentiful | HashMap (faster) |
| Input already sorted | Two pointers |
| Memory constrained (embedded, GPU) | Two pointers |
| Need original indices | HashMap |

## The Interview Arc

1. **Naive** — nested loops, mention O(n²)
2. **HashMap** — O(n) time, explain the complement insight
3. **Sorted + pointers** — O(1) space, explain the invariant
4. **Trade-off discussion** — this is what separates junior from senior answers

## Learning Outcomes

- Map/dictionary usage for lookup-optimization
- The complement technique (`target - current`)
- Two-pointer invariants on sorted data
- Space/time trade-off reasoning in interviews

## Next Steps

- Solve **3Sum** (same idea, one more pointer)
- Solve **Container With Most Water** (two-pointer on unsorted array)
- Implement the HashMap version in Rust — note how `HashMap` differs from Python's `dict`

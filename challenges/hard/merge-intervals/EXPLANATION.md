# Explanation: Merge Intervals

## The "Sort Then Sweep" Pattern

Merge Intervals is the canonical example of a pattern that appears constantly:

> **Sort by one dimension, then solve the rest greedily in a single pass.**

Same idea powers:

- Meeting room scheduling (min rooms needed)
- Employee free time
- Insert interval
- Calendar blocking
- Range overlap in databases (PostgreSQL gist indexes reason about overlaps)

## Why Sorting Is the Whole Trick

Without sorting, checking whether `[2,6]` overlaps `[1,3]` requires remembering every interval seen so far — effectively a pairwise O(n²) scan. After sorting by start:

- All intervals that overlap `[1,3]` appear **immediately after** it
- The first interval starting after `3` is guaranteed to be non-overlapping

This is an **exchange argument**: if `A.start <= B.start` and `B.start > A.end`, then no interval after `B` can overlap `A` (they all start at or after `B.start`).

## The max() Subtlety

```
current = [1, 4]     next = [2, 3]
current[1] = Math.max(4, 3) = 4   // contained, unchanged
```

Beginners write `current[1] = next[1]` and corrupt `[1,4]` into `[1,3]`. The `max` preserves the span.

## The Variant Question

"Merge with a max gap" is how real schedulers work — e.g., merging server maintenance windows separated by ≤ 15 minutes. The change is one line:

```java
if (next[0] - current[1] <= maxGap) { ... }
```

This tests whether you understand the overlap condition, not just memorized it.

## Learning Outcomes

- Sorting as a preprocessing step
- The greedy sweep invariant
- Edge case handling (empty, single, fully-contained)
- The "can't mutate input" defensive question

## Next Steps

- Solve **Meeting Rooms II** — needs a min-heap, the natural follow-up
- Solve **Insert Interval** — the harder variant where one interval is inserted into an already-merged list
- Write a property test: generate random intervals, merge, then verify no two output intervals overlap and no input point is lost

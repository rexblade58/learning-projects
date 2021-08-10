# Challenge: Merge Intervals

**Difficulty:** Hard
**Language:** Java

## Problem

Given an array of intervals `[start, end]`, merge all overlapping intervals and return the merged result.

## Examples

```
merge([[1,3],[2,6],[8,10],[15,18]])     → [[1,6],[8,10],[15,18]]
merge([[1,4],[4,5]])                    → [[1,5]]
merge([[1,4],[2,3]])                    → [[1,4]]   (fully contained)
merge([[1,2],[3,4]])                    → [[1,2],[3,4]]  (no overlap)
```

## Definitions

- `[1,3]` and `[2,6]` overlap because `2 <= 3`
- `[1,4]` and `[4,5]` overlap because `4 <= 4` (touching counts as overlapping)

## Constraints

- `0 <= intervals.length <= 10^4`
- `intervals[i].length == 2`, `0 <= start <= end <= 10^4`
- The input is NOT guaranteed to be sorted

## Stretch Goal

Implement a variant `mergeWithGap(intervals, maxGap)` that also merges intervals separated by a gap of `<= maxGap` — this is the real-world "merge booking blocks with slack" pattern.

## Interview Follow-Up

Explain why sorting is necessary, and what the time complexity is. Then discuss: what if you cannot mutate the input array?

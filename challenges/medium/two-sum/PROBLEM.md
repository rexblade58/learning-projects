# Challenge: Two Sum — Optimized

**Difficulty:** Medium
**Language:** TypeScript

## Problem

Given an array of integers `nums` and a target `target`, return the indices of the two numbers that add up to the target.

## Examples

```
twoSum([2, 7, 11, 15], 9)     // [0, 1]  (2 + 7 = 9)
twoSum([3, 2, 4], 6)          // [1, 2]  (2 + 4 = 6)
twoSum([3, 3], 6)             // [0, 1]  (3 + 3 = 6)
```

## Constraints

- Exactly one solution exists — you may return it in any order
- Each element may only be used once
- Do NOT use nested loops — the naive O(n²) solution defeats the purpose

## The Twist (Senior Interview Question)

After the O(n) HashMap solution, the interviewer will ask:

> "Now do it in O(1) space."

The array must be sorted first. Write `twoSumSorted` that sorts, then uses two pointers.

## Stretch Goal

Write a generic version `twoSum<T>(nums: T[], target: T, comparator: (a,b) => number)` that works for any comparable type (strings, bigints, decimals).

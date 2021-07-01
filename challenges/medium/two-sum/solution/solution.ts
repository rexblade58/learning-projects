# Solution: Two Sum — Optimized

## Approach 1: HashMap (O(n) time, O(n) space)

For each number `n`, we want to know if `target - n` already appeared. A `Map` stores each seen value → its index, so the lookup is O(1).

```typescript
/**
 * Find two indices whose values sum to target.
 *
 * @param nums   input array
 * @param target target sum
 * @returns      [i, j] indices, or [-1, -1] if none
 */
function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>(); // value -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    // Have we seen the complement before?
    if (seen.has(complement)) {
      return [seen.get(complement)!, i]; // [earlier index, current index]
    }

    seen.set(nums[i], i); // remember this value for later pairs
  }

  return [-1, -1];
}
```

### Why the Order of `seen.set` Matters

We check `seen.has` **before** adding the current number. This prevents using the same element twice:

- `twoSum([3, 3], 6)`: first `3` is stored, second `3` finds it → `[0, 1]` ✓
- If we stored first: second `3` would see itself → wrong

## Approach 2: Two Pointers on Sorted Array (O(n log n) time, O(1) space)

```typescript
function twoSumSorted(nums: number[], target: number): [number, number] {
  const sorted = [...nums].sort((a, b) => a - b); // O(n log n)

  let left = 0;
  let right = sorted.length - 1;

  while (left < right) {
    const sum = sorted[left] + sorted[right];

    if (sum === target) {
      return [left, right]; // NOTE: indices refer to the SORTED array
    }
    if (sum < target) {
      left++;  // sum too small, increase the smaller addend
    } else {
      right--; // sum too large, decrease the larger addend
    }
  }

  return [-1, -1];
}
```

### Why the Two-Pointer Invariant Holds

On a sorted array, increasing `left` strictly increases the sum; decreasing `right` strictly decreases it. Moving the pointer that over-corrects is guaranteed to converge — this is the same logic behind binary search.

## Complexity Comparison

| Approach | Time | Space | Notes |
| :--- | :--- | :--- | :--- |
| HashMap | O(n) | O(n) | Returns original indices |
| Sorted + pointers | O(n log n) | O(1) | Returns sorted-array indices |

## Interview Follow-Up Answers

**Q: Which would you pick in production?**
A: HashMap if memory is available — O(n) beats O(n log n), and original indices are preserved.

**Q: When would you prefer the sorted approach?**
A: When the input is already sorted, or when memory is constrained (embedded systems, large datasets).

## Common Mistakes

1. **Storing before checking** — allows self-pairing (`[3,3]` fails)
2. **Mutating the input with `.sort()`** — sort a copy so callers' data is untouched
3. **Forgetting the non-null assertion** — `seen.get(complement)!` after `has()` is safe but needs the `!`

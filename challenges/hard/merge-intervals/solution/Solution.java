# Solution: Merge Intervals

## Approach

1. **Sort** by start time — now overlapping intervals are guaranteed to be adjacent
2. **Greedy sweep** — keep a `current` interval; if the next interval starts before `current` ends, extend `current`; otherwise push `current` and start a new one

## The Code

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class MergeIntervals {

    /**
     * Merge all overlapping intervals.
     *
     * @param intervals array of [start, end] pairs
     * @return merged intervals
     */
    public static int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;

        // 1. Sort by start time — overlapping intervals become adjacent
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));

        List<int[]> merged = new ArrayList<>();
        int[] current = intervals[0];

        for (int i = 1; i < intervals.length; i++) {
            int[] next = intervals[i];

            if (next[0] <= current[1]) {
                // Overlap (or touch): extend the current interval
                current[1] = Math.max(current[1], next[1]);
            } else {
                // No overlap: commit current, move to next
                merged.add(current);
                current = next;
            }
        }
        merged.add(current); // flush the last interval

        return merged.toArray(new int[merged.size()][]);
    }

    /**
     * Variant: also merge intervals separated by a small gap.
     */
    public static int[][] mergeWithGap(int[][] intervals, int maxGap) {
        if (intervals.length <= 1) return intervals;

        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));

        List<int[]> merged = new ArrayList<>();
        int[] current = intervals[0];

        for (int i = 1; i < intervals.length; i++) {
            int[] next = intervals[i];
            // Overlap OR gap within maxGap
            if (next[0] - current[1] <= maxGap) {
                current[1] = Math.max(current[1], next[1]);
            } else {
                merged.add(current);
                current = next;
            }
        }
        merged.add(current);
        return merged.toArray(new int[merged.size()][]);
    }

    public static void main(String[] args) {
        int[][] test1 = { {1,3}, {2,6}, {8,10}, {15,18} };
        System.out.println(Arrays.deepToString(merge(test1)));
        // [[1,6],[8,10],[15,18]]

        int[][] test2 = { {1,4}, {4,5} };
        System.out.println(Arrays.deepToString(merge(test2)));
        // [[1,5]]

        int[][] test3 = { {1,4}, {2,3} };
        System.out.println(Arrays.deepToString(merge(test3)));
        // [[1,4]]

        int[][] test4 = { {1,2}, {3,4} };
        System.out.println(Arrays.deepToString(merge(test4)));
        // [[1,2],[3,4]]
    }
}
```

## Step-by-Step Explanation

| Step | Code | Why |
| :--- | :--- | :--- |
| 1 | `Arrays.sort(... by a[0])` | Guarantees adjacency of overlaps |
| 2 | `current = intervals[0]` | Seed with the earliest interval |
| 3 | `next[0] <= current[1]` | Overlap condition (touching counts) |
| 4 | `Math.max(current[1], next[1])` | Fully-contained intervals extend nothing, but we must keep the max end |
| 5 | flush after loop | The last interval is never committed inside the loop |

## Why the Greedy Works

After sorting, intervals that overlap form contiguous runs. Any interval overlapping `current` must appear before the first non-overlapping interval — there is no "skipping ahead" to find a hidden overlap. Sorting turns a global problem into a linear sweep.

## Complexity

- **Time:** O(n log n) — dominated by the sort
- **Space:** O(n) — the merged list (or O(1) extra if you compact in place)

## Interview Answers

**Q: Why sort?** Without sorting, overlaps are scattered; you would need O(n²) pairwise checks. Sorting creates a canonical order where one linear pass suffices.

**Q: Can't mutate the input?** Copy the intervals before sorting (`Arrays.copyOf`), accepting O(n) extra memory.

## Common Mistakes

1. **Not flushing the last interval** — always add `current` after the loop
2. **`current[1] = next[1]` instead of max** — breaks with `[[1,4],[2,3]]`
3. **Mutating input with sort** — the caller's array changes
4. **Edge case `intervals.length == 0`** — return empty, not null

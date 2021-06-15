# Solution: Palindrome Checker

## Approach

Two phases:

1. **Clean** the input — lowercase it and keep only `[a-z0-9]`
2. **Compare** using the two-pointer technique — one pointer from the start, one from the end, walking toward the middle

The two-pointer approach is O(n) time and O(1) extra space, and it avoids allocating a reversed copy of the string.

## The Code

```javascript
/**
 * Check whether a string is a palindrome.
 *
 * @param {string} text - input string, any case/punctuation
 * @returns {{ result: boolean, clean: string }}
 *   - result: true if the cleaned string reads the same both ways
 *   - clean:  the normalized string that was compared
 */
function isPalindrome(text) {
  // Phase 1: normalize - lowercase and strip non-alphanumerics
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Phase 2: two-pointer comparison
  let left = 0;
  let right = clean.length - 1;

  while (left < right) {
    if (clean[left] !== clean[right]) {
      return { result: false, clean };
    }
    left++;
    right--;
  }

  return { result: true, clean };
}

// --- Tests ---
const cases = [
  ['racecar', true],
  ['Racecar', true],
  ['hello', false],
  ['A man, a plan, a canal: Panama', true],
  ["No 'x' in Nixon", true],
  ['', true],
];

cases.forEach(([input, expected]) => {
  const { result } = isPalindrome(input);
  const pass = result === expected ? 'PASS' : 'FAIL';
  console.log(`${pass}: "${input}" -> ${result}`);
});
```

## Step-by-Step Explanation

| Step | Code | Why |
| :--- | :--- | :--- |
| 1 | `text.toLowerCase()` | Makes the check case-insensitive |
| 2 | `.replace(/[^a-z0-9]/g, '')` | Removes everything that is not a letter or digit |
| 3 | `let left = 0; right = len - 1` | Two pointers at opposite ends |
| 4 | `while (left < right)` | Stop when pointers meet or cross |
| 5 | mismatch → `false` | Characters differ, cannot be a palindrome |
| 6 | `left++; right--` | Move inward and compare the next pair |

## Why Two Pointers Instead of Reverse

`'abc'.split('').reverse().join('')` allocates a full second string — O(n) extra memory. The two-pointer version compares in place, which matters at 100,000 characters.

## Complexity

- **Time:** O(n) — one pass to clean, one pass to compare
- **Space:** O(n) for the cleaned string, O(1) for the pointers

## Common Mistakes

1. **Not cleaning input** — `"A man, a plan..."` fails without stripping spaces
2. **Comparing mixed case** — `'R' !== 'r'`
3. **Off-by-one on `right`** — using `text.length` instead of `text.length - 1` skips the last character

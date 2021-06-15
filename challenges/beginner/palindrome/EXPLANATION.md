# Explanation: Palindrome Checker

## The Two-Pointer Technique

This is the first taste of a pattern you will reuse everywhere: **two pointers moving toward each other**.

It appears in:

- Binary search (low/high pointers)
- Two-sum on sorted arrays
- Merge steps of merge sort
- String/array comparisons

Learning it here — with a trivial problem — builds the muscle memory before the hard problems need it.

## Normalization: The Hidden 80% of the Problem

Beginners fixate on the comparison. The real work is **input normalization**:

- Case folding (`toLowerCase`)
- Character filtering (regex `[^a-z0-9]`)

This mirrors real-world data cleaning: user input, log lines, and API payloads are never clean. Normalizing before processing is a universal engineering pattern.

## Regex Cheat Sheet for This Challenge

| Pattern | Meaning |
| :--- | :--- |
| `[a-z0-9]` | any lowercase letter or digit |
| `[^a-z0-9]` | NOT a letter or digit (negated class) |
| `/g` flag | global — replace every occurrence |

## Debugging Path

If a test fails:

1. Print `clean` — is the normalization correct?
2. Print `left` and `right` at each step — are the pointers moving?
3. Check the loop condition — `while (left < right)` vs `<=`

## Learning Outcomes

- Regex character classes and the global flag
- The two-pointer pattern
- Returning structured results (object) instead of a bare boolean
- Writing table-driven tests with `forEach`

## Next Steps

- Solve "Valid Palindrome II" — allow deleting at most one character
- Implement it with a recursive approach and compare with iteration
- Reimplement in Rust using `Vec<char>` and see how the borrow checker guides the pointer code

# Solution: FizzBuzz

## Approach

We loop from 1 to 100 and apply the divisibility rules.

The **key insight**: a number divisible by both 3 and 5 is divisible by 15. We must test that case FIRST, otherwise the `3` and `5` checks would catch it and we'd never print `FizzBuzz`.

## The Code

```python
def fizzbuzz(n: int) -> str:
    """Return the FizzBuzz string for a single number n."""
    if n % 15 == 0:        # divisible by both 3 and 5
        return "FizzBuzz"
    if n % 3 == 0:         # only divisible by 3
        return "Fizz"
    if n % 5 == 0:         # only divisible by 5
        return "Buzz"
    return str(n)          # divisible by neither


def main() -> None:
    for i in range(1, 101):   # 1..100 inclusive
        print(fizzbuzz(i))


if __name__ == "__main__":
    main()
```

## Step-by-Step Explanation

| Line | What happens | Why |
| :--- | :--- | :--- |
| `n % 15 == 0` | Checks combined case first | Prevents the 3 and 5 branches from shadowing it |
| `n % 3 == 0` | Only fires when 15-check failed | 15 % 3 == 0, but we already returned |
| `return str(n)` | Fallback for non-multiples | Converts the number to a string for printing |
| `range(1, 101)` | Python's range is end-exclusive | 101 gives us 1 through 100 |

## Why the Ordering Matters

If we wrote the checks as:

```python
if n % 3 == 0: return "Fizz"
if n % 5 == 0: return "Buzz"
```

Then `15` would return `"Fizz"` because `15 % 3 == 0` fires first — a classic bug. Testing `% 15` first avoids it.

## Complexity

- **Time:** O(1) per number, O(n) total
- **Space:** O(1)

## Common Mistakes

1. **Wrong loop range** — using `range(1, 100)` misses the number 100
2. **No combined case** — numbers like 15, 30, 45 print "Fizz" instead of "FizzBuzz"
3. **Printing instead of returning** — a reusable function is better for testing

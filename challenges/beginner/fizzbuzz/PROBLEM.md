# Challenge: FizzBuzz

**Difficulty:** Beginner
**Language:** Python

## Problem

Write a program that prints the numbers from 1 to 100. But:

- For multiples of **3**, print `Fizz` instead of the number
- For multiples of **5**, print `Buzz` instead of the number
- For multiples of both **3 and 5**, print `FizzBuzz`

## Expected Output

```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
...
```

## Constraints

- Use a loop from 1 to 100 inclusive
- Do not use string concatenation shortcuts (like `"Fizz" * (i % 3 == 0)`) — write the logic explicitly

## Hints

1. Check the `i % 15 == 0` case FIRST (it satisfies both conditions)
2. Use `elif` chains rather than independent `if`s

## Stretch Goal

Write a reusable `fizzbuzz(n: int) -> str` function that works for any single number, then call it in the loop.

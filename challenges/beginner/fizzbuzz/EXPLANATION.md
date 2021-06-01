# Explanation: FizzBuzz

## The Pattern Behind the Problem

FizzBuzz tests three things every developer needs:

1. **Looping** — iterating over a fixed range
2. **Modulo arithmetic** — the `%` operator to find divisibility
3. **Control flow ordering** — the order of `if` branches matters

## Why Interviews Love It

It's the classic "can you actually write code" filter. FizzBuzz eliminates candidates who can only copy-paste. There is no trick — you either know the syntax or you don't.

## The Combined-Case Trap

The `% 15` check is the "aha" moment. Most beginners write:

```
if i % 3 == 0: print("Fizz")
elif i % 5 == 0: print("Buzz")
else: print(i)
```

This fails at 15 because `15 % 3 == 0` triggers first. Understanding **check precedence** — that the most specific condition must come before general ones — is a transferable skill used everywhere (validators, parsers, authorization rules).

## Learning Outcomes

After this challenge you should be able to:

- Write a loop with a precise range
- Use `%` to detect divisibility
- Order conditional branches correctly
- Extract logic into a testable function

## Next Steps

- Try it in C, Rust, or Go — the loop syntax differs but the logic is identical
- Add a test suite using `unittest` or `pytest`
- Benchmark 1,000,000 iterations and compare implementations

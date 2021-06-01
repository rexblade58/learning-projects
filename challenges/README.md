# Coding Challenges

Progressive challenges organized by difficulty. Each challenge has:

- `PROBLEM.md` — the task, constraints, and stretch goals
- `solution/` — fully commented solution code
- `EXPLANATION.md` — approach, complexity, and why it works

## Difficulty Ladder

| Level | Who It's For | Challenges |
| :--- | :--- | :--- |
| [Beginner](beginner/) | First syntax, first loops | FizzBuzz, Palindrome Checker |
| [Medium](medium/) | Data structures & HashMap patterns | Two Sum (optimized), LRU Cache |
| [Hard](hard/) | Sorting + greedy, async systems | Merge Intervals, Async Job Queue |
| [Advanced](advanced/) | System-level design | EventEmitter from Scratch |
| [Junior](junior/) | Realistic interview questions | Token Bucket Rate Limiter |
| [Senior](senior/) | Concurrency architecture | Actor Model (zero shared state) |
| [Impossible](impossible/) | Research-grade exploration | Lock-Free MPSC Queue |

## Suggested Order

```
beginner/fizzbuzz        → beginner/palindrome
medium/two-sum           → medium/lru-cache
hard/merge-intervals     → hard/async-job-queue
advanced/event-emitter   → junior/rate-limiter
senior/actor-model       → impossible/lockfree-mpsc
```

## How to Learn

1. Read `PROBLEM.md` and try it yourself FIRST
2. Compare with `solution/` — don't read it until you've attempted
3. Read `EXPLANATION.md` and explain it back in your own words
4. Do the stretch goals
5. Teach someone else — the real test

## Contributing a Challenge

See the [contributing guidelines](../CONTRIBUTING.md) — each level has a rubric:
- Beginner: 30-60 lines, one concept
- Senior: concurrency, architecture, trade-offs
- Impossible: open research questions, honest "this is hard" framing

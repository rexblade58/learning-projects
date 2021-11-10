# Challenge: Lock-Free MPSC Queue

**Difficulty:** Impossible (exploratory)
**Language:** Rust (unsafe)

## Problem

Implement a **lock-free** multi-producer single-consumer (MPSC) queue using atomics — no `std::sync::Mutex`, no `parking_lot`, no channels.

Requirements:

- `push(value)` — safe from any thread, lock-free (progress guaranteed for producers)
- `pop() -> Option<T>` — single consumer, lock-free
- Based on the **Vyukov bounded MPSC queue** (the algorithm behind crossbeam-channel's unbounded variant)
- Use `AtomicPtr`, `Ordering::Acquire/Release`, and a free-list of nodes to avoid reallocation

## Why This Is "Impossible"

- ABA problem: a node freed and reallocated at the same address breaks CAS
- Memory reclamation: when is a node safe to free? (epoch-based or hazard pointers needed)
- Correctness under all interleavings — one wrong `Ordering` and it silently corrupts

You are NOT expected to fully solve it. The goal is to:

1. Implement the core push/pop CAS logic
2. Document every `Ordering` choice and why
3. Identify where the ABA problem bites
4. Run it under `cargo test` with multiple threads

## Constraints

- Must use `unsafe` — that's the point
- `push` must never spin-block (bounded retries, then allocate)
- `pop` must be non-blocking (return `None` when empty)
- Add a `stress_test` that pushes from 8 threads and pops 100k items

## Resources

Study these before coding:

- Vyukov's bounded MPSC queue (presentation at Intel)
- crossbeam-epoch: the reclamation scheme real implementations use
- The C11 memory model (which Rust's atomics map to)

## Stretch Goal

Fix the ABA problem using a **deferred free-list**: nodes pushed to a garbage list, reclaimed only when no thread can still reference them.

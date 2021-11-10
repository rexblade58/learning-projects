# Explanation: Lock-Free MPSC Queue

## What "Lock-Free" Actually Means

A lock-free algorithm guarantees **system-wide progress**: even if a thread is killed mid-operation, the others continue. (Compare: lock-based — a dead thread holding a mutex stops everyone.)

Three levels:

| Level | Guarantee | Example |
| :--- | :--- | :--- |
| Blocking | locks, may deadlock | Mutex |
| Lock-free | at least one thread progresses | CAS loops |
| Wait-free | EVERY thread progresses in bounded steps | complex, rare |

Our queue is lock-free (producers loop on CAS) but not wait-free.

## The Vyukov Design at a Glance

```
producer_tail ──► [slot] ──► [slot] ──► [slot] ──► ... ──► consumer_head
                    │           │           │
              [node A]     [node B]     [node C]
```

- Producers compete to CAS their slot from `null` → node
- The consumer claims slots by CAS from node → `null`
- Circular buffer, `mod CAPACITY` for wraparound

## Why CAS (Compare-And-Swap) Powers It

```
slot.compare_exchange(expected_null, new_node, AcqRel, Acquire)
```

The hardware guarantees this read-compare-write is **atomic** — no interleaving can observe a partial state. CAS is the primitive every lock-free structure builds on. On x86 it's `LOCK CMPXCHG`.

## The Memory Ordering Trap

Rust (like C11) gives you `Relaxed`, `Acquire`, `Release`, `AcqRel`, `SeqCst`. Get one wrong and:

- The value write appears AFTER the pointer publish → consumer reads garbage
- Reclamation races with a concurrent reader → use-after-free

`Acquire/Release` pairs form **happens-before** edges — the producer's write of the node value "happens before" the consumer's read, because the pointer CAS synchronizes them.

## The Reclamation Wall

To avoid leaking, `pop` frees the node. But a producer's CAS could be re-reading that node's slot. The classic solution is **epoch-based reclamation**:

```
Thread enters epoch → defer frees → thread exits epoch → only now free deferred
```

This is why the exercise is "impossible" — reclamation, not the queue itself, is the hard part.

## Why This Matters in the Real World

| Library | Approach |
| :--- | :--- |
| crossbeam-channel | Vyukov MPSC + epoch reclamation |
| Rust std mpsc | Mutex-based |
| LMAX Disruptor | Ring buffer with sequence numbers (no CAS on hot path) |

Systems that need extreme throughput (trading, game servers, observability pipelines) use these instead of mutexes.

## Learning Outcomes

- CAS and atomic memory ordering
- The ABA problem and why it's fundamental
- Epoch-based memory reclamation
- The difference between lock-free and wait-free
- Respect for how hard "simple" concurrency really is

## Next Steps

- Replace the placeholder indices with real `AtomicUsize` counters
- Add epoch-based reclamation (port crossbeam-epoch's `defer_free`)
- Benchmark against `std::sync::mpsc` with 8 producers
- Attempt the unbounded variant: push needs a lock-free free-list

# Learning Projects

A progressive web development curriculum — from beginner fundamentals to senior-level engineering patterns across 10 languages.

## Beginner Level

| Topic | Exercises | Skills |
| :--- | :--- | :--- |
| HTML & CSS | Profile Card, Contact Form | Semantic markup, flexbox, forms, validation |
| JavaScript | Todo App, Fetch API | DOM, events, localStorage, async/await |
| React | Counter | Components, hooks, state |
| Node.js | Hello Server | Express, routes, JSON APIs |
| Python | Hello World | Variables, input, conditionals |

## Advanced Level

| Topic | Exercises | Skills |
| :--- | :--- | :--- |
| JavaScript | Advanced Patterns | Closures, currying, memoization, composition, debounce/throttle, event loop, retry with backoff |
| HTML & CSS | CSS Architecture | BEM, cascade layers, container queries, custom properties, design tokens |
| React | Custom Hooks | useReducer+context, custom hooks, useCallback/useMemo, refs |
| Node.js | Streams & Workers | Stream backpressure, cluster, worker_threads, CPU-bound offloading |
| Python | Async Programming | asyncio, semaphores, async context managers, retry decorators, generators |
| Rust | Ownership & Borrowing | Ownership rules, borrow checker, lifetimes, Result/Error patterns |
| Rust | Concurrency | Threads, channels, Arc/Mutex, Send/Sync |
| Rust | Error Handling | Custom error types, `?` operator, From conversions |
| Go | Goroutines | Goroutines, WaitGroup, worker pools, fan-in/fan-out |
| Go | Channels | Buffered channels, select, context cancellation |
| C | Pointers & Memory | Pointer arithmetic, malloc/free, structs, manual memory management |
| C++ | RAII & Smart Pointers | RAII, unique_ptr/shared_ptr, move semantics, rule of five |
| C++ | Templates | Variadic templates, constexpr, SFINAE, compile-time computation |
| TypeScript | Generics | Constraints, conditional types, mapped types, inference |
| TypeScript | Utility Types | Partial/Required/Readonly, Record, ReturnType, decorators |
| Java | Concurrency | ExecutorService, CompletableFuture, parallel streams, atomics |
| Java | Streams | Pipelines, grouping, collectors, reduction |

## Quick Start

```bash
git clone https://github.com/rexblade58/learning-projects.git
cd learning-projects

# HTML/CSS/JS — open the folder in any browser
open html-css/profile-card/index.html

# Python
python python/async-programming/main.py

# Node.js
cd node-api/streams-worker && npm install && npm start

# Rust (requires cargo)
cd rust/ownership-borrowing && cargo run

# Go (requires go)
cd go/goroutines && go run main.go

# C / C++ (requires gcc/g++)
gcc c/pointers-memory/main.c -o build && ./build

# TypeScript (requires ts-node or tsc)
npx ts-node typescript/generics/main.ts

# Java (requires javac)
javac java/streams/Streams.java && java Streams
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT (c) 2016-2021 Menard Rosal

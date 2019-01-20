// Exercise: Goroutines and Concurrency Patterns
//
// Senior-level concepts: goroutines, WaitGroup, mutex,
// worker pools, and the "share memory by communicating" philosophy.

package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range jobs {
		// Simulate work
		time.Sleep(50 * time.Millisecond)
		results <- job * 2
	}
}

func main() {
	// --- Worker pool pattern ---
	const numJobs = 10
	const numWorkers = 3

	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)
	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	// Feed jobs
	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs)

	// Wait for workers, then close results
	go func() {
		wg.Wait()
		close(results)
	}()

	fmt.Println("Worker pool results (job * 2):")
	for r := range results {
		fmt.Printf("  %d\n", r)
	}

	// --- Fan-in with sync.WaitGroup ---
	fmt.Println("\nFan-in example:")
	ch1 := generate(1, 3)
	ch2 := generate(4, 6)
	merged := merge(ch1, ch2)
	for v := range merged {
		fmt.Printf("  got %d\n", v)
	}
}

func generate(start, end int) <-chan int {
	out := make(chan int)
	go func() {
		for i := start; i <= end; i++ {
			out <- i
		}
		close(out)
	}()
	return out
}

func merge(a, b <-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		for v := range a {
			out <- v
		}
	}()
	go func() {
		defer wg.Done()
		for v := range b {
			out <- v
		}
	}()

	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}

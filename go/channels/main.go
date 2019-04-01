// Exercise: Channels, Select, and Context
//
// Senior-level concepts: buffered channels, select for multiplexing,
// context cancellation, and graceful shutdown.

package main

import (
	"context"
	"fmt"
	"time"
)

func producer(ctx context.Context, out chan<- int) {
	i := 0
	for {
		select {
		case <-ctx.Done():
			fmt.Println("  producer stopped (context cancelled)")
			return
		case out <- i:
			i++
			time.Sleep(100 * time.Millisecond)
		}
	}
}

func consumer(name string, in <-chan int) {
	for v := range in {
		fmt.Printf("  %s consumed %d\n", name, v)
	}
}

func main() {
	// --- Buffered channel with select ---
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	ch := make(chan int, 5)
	go producer(ctx, ch)

	// Multiplex with a ticker using select
	ticker := time.NewTicker(150 * time.Millisecond)
	defer ticker.Stop()

	fmt.Println("Select-based multiplexing:")
loop:
	for {
		select {
		case v := <-ch:
			fmt.Printf("  received %d\n", v)
		case <-ticker.C:
			fmt.Println("  tick...")
		case <-ctx.Done():
			fmt.Println("  done - timeout reached")
			break loop
		}
	}

	// --- Buffered channel throughput ---
	fmt.Println("\nBuffered channel (capacity 10):")
	buffered := make(chan int, 10)
	done := make(chan bool)

	go consumer("worker-a", buffered)
	go func() {
		for i := 0; i < 10; i++ {
			buffered <- i
		}
		close(buffered)
		done <- true
	}()
	<-done

	time.Sleep(50 * time.Millisecond)
	fmt.Println("Channel exercises complete")
}

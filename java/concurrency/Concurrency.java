// Exercise: Java Concurrency
//
// Senior-level concepts: ExecutorService, CompletableFuture,
// thread safety, and parallel processing.

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Concurrency {
    // Thread-safe counter using AtomicInteger
    private static final AtomicInteger counter = new AtomicInteger(0);

    public static void main(String[] args) throws Exception {
        // --- Thread pool with Callable ---
        ExecutorService executor = Executors.newFixedThreadPool(4);

        List<Future<Integer>> futures = new ArrayList<>();
        for (int i = 1; i <= 8; i++) {
            final int taskId = i;
            futures.add(executor.submit(() -> {
                Thread.sleep(100);
                counter.incrementAndGet();
                return taskId * taskId;
            }));
        }

        System.out.println("Thread pool results:");
        for (Future<Integer> f : futures) {
            System.out.println("  " + f.get());
        }
        executor.shutdown();

        // --- CompletableFuture composition ---
        System.out.println("\nCompletableFuture pipeline:");
        CompletableFuture.supplyAsync(() -> 42)
                .thenApply(x -> x * 2)
                .thenApply(x -> x + 10)
                .thenAccept(result -> System.out.println("  pipeline result: " + result))
                .join();

        // --- Parallel stream (data parallelism) ---
        System.out.println("\nParallel stream:");
        long sum = IntStream.rangeClosed(1, 10_000_000)
                .parallel()
                .mapToLong(n -> n)
                .sum();
        System.out.println("  sum 1..10M = " + sum);

        // --- Synchronized vs atomic ---
        int threads = 10;
        CountDownLatch latch = new CountDownLatch(threads);
        for (int i = 0; i < threads; i++) {
            new Thread(() -> {
                for (int j = 0; j < 1000; j++) counter.incrementAndGet();
                latch.countDown();
            }).start();
        }
        latch.await();
        System.out.println("\nAtomic counter after 10 threads * 1000: " + counter.get());
    }
}

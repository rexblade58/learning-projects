// Exercise: Concurrency in Rust
//
// Senior-level concepts: threads, channels, Arc<Mutex<T>>,
// Send/Sync traits, and race-condition-free shared state.

use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use std::time::Duration;

fn main() {
    // --- 1. Threads with message passing (channels) ---
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        for i in 1..=5 {
            tx.send(format!("message {i}")).unwrap();
            thread::sleep(Duration::from_millis(100));
        }
    });

    println!("Received from channel:");
    for received in rx {
        println!("  {received}");
    }

    // --- 2. Shared state with Arc<Mutex<T>> ---
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..8 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 {
                let mut num = counter.lock().unwrap();
                *num += 1;
            }
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("\nShared counter result: {}", *counter.lock().unwrap());
    println!("Expected: 8000 (proves no data races)");
}

// --- 3. Send/Sync: custom thread-safe wrapper ---
struct ThreadSafeBuilder<T> {
    value: Arc<Mutex<Option<T>>>,
}

impl<T> ThreadSafeBuilder<T> {
    fn new() -> Self {
        Self {
            value: Arc::new(Mutex::new(None)),
        }
    }

    fn set(&self, v: T) {
        *self.value.lock().unwrap() = Some(v);
    }

    fn get(&self) -> Option<T>
    where
        T: Clone,
    {
        self.value.lock().unwrap().clone()
    }
}

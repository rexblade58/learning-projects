# Exercise: Async Programming in Python
#
# Senior-level concepts: asyncio, coroutines, task groups,
# context managers, generators, and decorators.

import asyncio
import contextlib
import time
from functools import wraps


# --- Context manager: resource lifecycle ---
@contextlib.contextmanager
def timed(label):
    start = time.perf_counter()
    yield
    print(f"  {label}: {time.perf_counter() - start:.3f}s")


# --- Async context manager ---
class AsyncDatabase:
    async def __aenter__(self):
        print("  [db] connecting...")
        await asyncio.sleep(0.05)
        return self

    async def __aexit__(self, *exc):
        print("  [db] closing...")
        await asyncio.sleep(0.02)


async def fetch(url: str) -> str:
    # Simulate network latency
    await asyncio.sleep(0.1)
    return f"data from {url}"


# --- Coroutine with controlled concurrency ---
async def fetch_all(urls: list[str], limit: int = 3) -> list[str]:
    semaphore = asyncio.Semaphore(limit)

    async def bounded(url):
        async with semaphore:
            return await fetch(url)

    return await asyncio.gather(*(bounded(u) for u in urls))


# --- Decorator with async support ---
def retry(max_attempts: int = 3):
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return await fn(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    print(f"    attempt {attempt} failed: {e}, retrying...")
                    await asyncio.sleep(0.05 * attempt)
        return wrapper
    return decorator


@retry(max_attempts=3)
async def flaky_request(url: str) -> str:
    if url == "flaky":
        raise ConnectionError("simulated failure")
    return f"ok: {url}"


# --- Generator: lazy processing pipeline ---
def pipeline():
    data = (x for x in range(10))
    doubled = (x * 2 for x in data)
    filtered = (x for x in doubled if x % 4 == 0)
    return list(filtered)


async def main():
    urls = [f"https://api.example.com/{i}" for i in range(6)]

    with timed("fetch_all"):
        results = await fetch_all(urls, limit=3)
    print("  results:", results)

    print("\nAsync context manager:")
    async with AsyncDatabase():
        print("  [db] executing query")

    print("\nRetry decorator:")
    try:
        print(" ", await flaky_request("flaky"))
    except ConnectionError:
        print("  gave up after retries")

    print("\nLazy pipeline:", pipeline())


if __name__ == "__main__":
    asyncio.run(main())

"""Test suite for the LRU cache challenge solution.

Run with: python -m pytest test_lru_cache.py
Covers: capacity edge cases, eviction order, get-refresh semantics,
and randomized comparison against a reference implementation.
"""

import random

from solution import LRUCache


class ReferenceLRU:
    """Simple O(n) reference - used to validate the O(1) version."""

    def __init__(self, capacity):
        self.capacity = capacity
        self.order = []  # recency order, index 0 = most recent
        self.data = {}

    def get(self, key):
        if key not in self.data:
            return -1
        self.order.remove(key)
        self.order.insert(0, key)
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data[key] = value
            self.order.remove(key)
            self.order.insert(0, key)
        else:
            if len(self.order) >= self.capacity:
                lru = self.order.pop()
                del self.data[lru]
            self.order.insert(0, key)
            self.data[key] = value


def test_zero_capacity():
    cache = LRUCache(0)
    cache.put(1, 1)
    assert cache.get(1) == -1


def test_basic_eviction_order():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1      # key 1 becomes most recent
    cache.put(3, 3)               # evicts key 2
    assert cache.get(2) == -1
    assert cache.get(1) == 1
    cache.put(4, 4)               # evicts key 3
    assert cache.get(3) == -1
    assert cache.get(1) == 1
    assert cache.get(4) == 4


def test_get_refreshes_recency():
    cache = LRUCache(3)
    cache.put(1, "a")
    cache.put(2, "b")
    cache.put(3, "c")
    cache.get(1)                  # refresh: order 1,3,2
    cache.put(4, "d")             # evicts 2
    assert cache.get(2) == -1
    assert cache.get(1) == "a"
    assert cache.get(3) == "c"
    assert cache.get(4) == "d"


def test_update_value_keeps_recency():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    cache.put(1, 10)              # update + refresh
    cache.put(3, 3)               # evicts 2
    assert cache.get(2) == -1
    assert cache.get(1) == 10


def test_contained_and_capacity_one():
    cache = LRUCache(1)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == -1
    assert cache.get(2) == 2


def test_randomized_against_reference():
    random.seed(42)
    fast = LRUCache(50)
    ref = ReferenceLRU(50)

    for _ in range(20_000):
        if random.random() < 0.5:
            key = random.randint(0, 99)
            assert fast.get(key) == ref.get(key)
        else:
            key = random.randint(0, 99)
            value = random.randint(0, 10_000)
            fast.put(key, value)
            ref.put(key, value)

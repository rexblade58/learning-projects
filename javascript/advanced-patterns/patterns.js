// Exercise: Advanced JavaScript Patterns
//
// Senior-level concepts: closures, currying, composition,
// memoization, event loop deep dive, and async control flow.

// --- Memoization with closure ---
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('  [memo] cache hit:', key);
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    console.log('  [memo] computed:', key);
    return result;
  };
}

const fib = memoize((n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));
console.log('fib(30) =', fib(30));
console.log('fib(30) again =', fib(30)); // cached

// --- Currying ---
const curry = (fn) => {
  const arity = fn.length;
  const curried = (...args) =>
    args.length >= arity
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  return curried;
};

const add = curry((a, b, c) => a + b + c);
console.log('curried add:', add(1)(2)(3));

// --- Function composition ---
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const double = (x) => x * 2;
const square = (x) => x * x;
const toString = (x) => String(x);

console.log('compose:', compose(toString, square, double)(3)); // "36"
console.log('pipe:', pipe(double, square)(3)); // 36

// --- Debounce (event loop pattern) ---
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- Throttle ---
function throttle(fn, interval = 300) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    }
  };
}

// --- Async control flow: retry with backoff ---
async function withRetry(fn, { retries = 3, baseDelay = 200 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = baseDelay * 2 ** attempt; // exponential backoff
      console.log(`  retry ${attempt + 1}/${retries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// --- Event loop phases demo ---
console.log('\nEvent loop order:');
console.log('1: sync');
setTimeout(() => console.log('5: timer'), 0);
Promise.resolve().then(() => console.log('3: microtask'));
process.nextTick?.(() => console.log('2: nextTick'));
queueMicrotask(() => console.log('4: microtask 2'));
console.log('6: sync end');

module.exports = { memoize, curry, compose, pipe, debounce, throttle, withRetry };

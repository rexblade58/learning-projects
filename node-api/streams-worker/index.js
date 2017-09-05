// Exercise: Node.js Streams, Clustering, and Worker Threads
//
// Senior-level concepts: stream backpressure, cluster for multi-core,
// worker_threads for CPU-bound tasks.

const { Readable, Transform, Writable } = require('stream');
const { Worker } = require('worker_threads');
const cluster = require('cluster');
const os = require('os');
const path = require('path');

// --- 1. Stream backpressure: read -> transform -> write ---
const numbers = new Readable({
  read() {
    for (let i = 1; i <= 10; i++) this.push(i);
    this.push(null);
  },
});

const doubled = new Transform({
  transform(chunk, _enc, cb) {
    const value = Number(chunk) * 2;
    console.log('  [transform]', chunk, '->', value);
    this.push(String(value));
    cb();
  },
});

const collector = new Writable({
  write(chunk, _enc, cb) {
    process.stdout.write(`  [collect] ${chunk}\n`);
    cb();
  },
});

numbers.pipe(doubled).pipe(collector);

// --- 2. HighWaterMark: memory control with backpressure ---
function backpressureDemo() {
  let total = 0;
  const source = new Readable({
    highWaterMark: 4, // small buffer -> forces backpressure
    read() {
      if (total < 100) {
        this.push('x'.repeat(100));
        total++;
      } else {
        this.push(null);
      }
    },
  });

  source.on('data', (chunk) => {
    console.log(`  chunk size: ${chunk.length} | buffer: ${source.readableLength}`);
  });
  source.on('end', () => console.log('  backpressure demo complete'));
}

// --- 3. Worker thread for CPU-bound work ---
function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      `const { parentPort, workerData } = require('worker_threads');
       const n = workerData;
       let sum = 0;
       for (let i = 0; i <= n; i++) sum += i;
       parentPort.postMessage(sum);`,
      { eval: true, workerData: data }
    );
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

// --- 4. Cluster: use all CPU cores ---
function startCluster() {
  if (cluster.isPrimary) {
    const cores = os.cpus().length;
    console.log(`\nPrimary ${process.pid} forking ${cores} workers`);
    for (let i = 0; i < cores; i++) cluster.fork();
    cluster.on('exit', (worker) => console.log(`worker ${worker.process.pid} died`));
  } else {
    console.log(`  worker ${process.pid} started`);
    process.exit(0);
  }
}

async function main() {
  console.log('=== Streams ===');
  await new Promise((resolve) => collector.on('finish', resolve));

  console.log('\n=== Backpressure ===');
  backpressureDemo();

  console.log('\n=== Worker thread ===');
  const sum = await runWorker(10_000_000);
  console.log('  worker sum 0..10M =', sum);

  console.log('\n=== Cluster (uncomment to run) ===');
  // startCluster();
}

main();

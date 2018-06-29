/* @flow */

import { performance } from 'perf_hooks';

let lastLog = performance.now();
let starts;

function formatDiff(n) {
  return `+${Number(n).toFixed(4)}`;
}

export function log(...args: Array<any>) {
  const now = performance.now();
  console.log(
    formatDiff(now - lastLog).padEnd(10),
    String(now - starts).padEnd(20),
    ...args,
  );
  lastLog = now;
  return now - starts;
}

// get the cost of running async
export function getNativeAsyncCost(): Promise<*> {
  return new Promise(resolve => {
    if (typeof process.nextTick === 'function') {
      return process.nextTick(() => {
        starts = performance.now();
        lastLog = performance.now();
        log('Native Async Startup Complete (nextTick)');
        resolve();
      });
    }
    if (typeof setImmediate === 'function') {
      return setImmediate(() => {
        starts = performance.now();
        lastLog = performance.now();
        log('Native Async Startup Complete (setImmediate)');
        return resolve();
      });
    }
    return setTimeout(() => {
      starts = performance.now();
      lastLog = performance.now();
      log('Native Async Startup Complete (setTimeout)');
      return resolve();
    });
  });
}

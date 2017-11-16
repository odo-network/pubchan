/* @flow */

import { performance } from 'perf_hooks';

let lastLog = performance.now();

function formatDiff(n) {
  return `+${Number(n).toFixed(4)}`;
}

export function log(...args: Array<any>) {
  const now = performance.now();
  console.log(
    formatDiff(now - lastLog).padEnd(10),
    String(now).padEnd(20),
    ...args,
  );
  lastLog = now;
  return now;
}

// get the cost of running async
export function getNativeAsyncCost(): Promise<*> {
  return new Promise(resolve => {
    if (typeof process.nextTick === 'function') {
      return process.nextTick(() => {
        log('Native Async Startup Complete (nextTick)');
        resolve();
      });
    } else if (typeof setImmediate === 'function') {
      return setImmediate(() => {
        log('Native Async Startup Complete (setImmediate)');
        return resolve();
      });
    }
    return setTimeout(() => {
      log('Native Async Startup Complete (setTimeout)');
      return resolve();
    });
  });
}

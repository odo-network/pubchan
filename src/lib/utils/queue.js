/* @flow */

import { asynchronously } from './async';

function AsyncQueue() {
  let promise;
  const queue = new Set();

  function flush() {
    const results = [];
    queue.forEach(cb => {
      if (typeof cb === 'function') {
        results.push(cb());
      } else {
        results.push(cb);
      }
    });
    queue.clear();
    if (results.length) {
      return Promise.all(results);
    }
    return Promise.resolve(results);
  }

  function push(cb: any) {
    if (queue.size === 0) {
      promise = asynchronously(flush);
    }
    queue.add(cb);
    return promise;
  }

  return {
    get promise() {
      return promise || Promise.resolve([]);
    },
    flush,
    push,
  };
}

export type AsyncQueueType = $Call<typeof AsyncQueue>;

export default function buildAsyncQueueFactory() {
  return AsyncQueue();
}

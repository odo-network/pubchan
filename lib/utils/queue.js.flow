/* @flow */

import { asynchronously } from './async';

export class AsyncQueue {
  queue: Set<any>;

  _promise: Promise<mixed[]>;

  get promise() {
    return this._promise || Promise.resolve([]);
  }

  constructor() {
    this.queue = new Set();
    (this: Object).flush = this.flush.bind(this);
    (this: Object).push = this.push.bind(this);
  }

  flush() {
    const results = [];
    this.queue.forEach(
      cb => (typeof cb === 'function' ? results.push(cb()) : results.push(cb)),
    );
    this.queue.clear();
    if (results.length) {
      return Promise.all(results);
    }
    return results;
  }

  push(cb: any): Promise<mixed[]> {
    if (this.queue.size === 0) {
      this._promise = asynchronously(this.flush);
    }
    this.queue.add(cb);
    return this._promise;
  }
}

export default function buildAsyncQueueFactory() {
  return new AsyncQueue();
}

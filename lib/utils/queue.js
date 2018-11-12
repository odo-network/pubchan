"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildAsyncQueueFactory;

var _async = require("./async");

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

  function push(cb) {
    if (queue.size === 0) {
      promise = (0, _async.asynchronously)(flush);
    }

    queue.add(cb);
    return promise;
  }

  return {
    get promise() {
      return promise || Promise.resolve([]);
    },

    flush,
    push
  };
}

function buildAsyncQueueFactory() {
  return AsyncQueue();
}
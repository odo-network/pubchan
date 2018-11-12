"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asynchronously = asynchronously;

function asynchronously(cb, args) {
  return new Promise(resolve => {
    if (typeof process.nextTick === 'function') {
      process.nextTick(() => resolve(cb(args)));
    } else if (typeof setImmediate === 'function') {
      setImmediate(() => resolve(cb(args)));
    } else {
      setTimeout(() => resolve(cb(args)));
    }
  });
}
/* @flow */

export function asynchronously<+R, +A, +C:(args?: A | void) => R>(
  cb: C,
  args?: A): Promise<$Call<C, A>> {
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

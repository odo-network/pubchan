/* @flow */

export function asynchronously<+R, +A>(
  cb: (args: A | void) => R,
  args?: A,
): Promise<$await<R>> {
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

/* @flow */

function noop() {
  throw new Error(
    `Cannot mutate ${this.type} with "${this.prop}", object is not extensible.`,
  );
}

export function frozenSet<T: any>(_set: Set<T>) {
  const set: Set<T> = new Set(_set);
  return new Proxy(set, {
    get(target, prop, rx) {
      if (prop === Symbol.for('nodejs.util.inspect.custom')) {
        return () => new Set(set);
      }
      if (prop === 'add' || prop === 'clear' || prop === 'delete') {
        return noop.bind({ prop, type: 'Set' });
      }
      const value = Reflect.get(target, prop, rx);
      if (typeof value === 'function') {
        return value.bind(set);
      }
      return value;
    },
  });
}

export function frozenMap<K: any, V: any>(_map: Map<K, V>) {
  const map: Map<K, V> = new Map(_map);
  return new Proxy(map, {
    get(target, prop, rx) {
      if (prop === Symbol.for('nodejs.util.inspect.custom')) {
        return () => new Map(map);
      }
      if (prop === 'set' || prop === 'clear' || prop === 'delete') {
        return noop.bind({ prop, type: 'Map' });
      }
      const value = Reflect.get(target, prop, rx);
      if (typeof value === 'function') {
        return value.bind(map);
      }
      return value;
    },
  });
}

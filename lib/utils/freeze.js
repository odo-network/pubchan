"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.frozenSet = frozenSet;
exports.frozenMap = frozenMap;

function noop() {
  throw new Error(`Cannot mutate ${this.type} with "${this.prop}", object is not extensible.`);
}

function frozenSet(_set) {
  const set = new Set(_set);
  return new Proxy(set, {
    get(target, prop, rx) {
      if (prop === Symbol.for('nodejs.util.inspect.custom')) {
        return () => new Set(set);
      }

      if (prop === 'add' || prop === 'clear' || prop === 'delete') {
        return noop.bind({
          prop,
          type: 'Set'
        });
      }

      const value = Reflect.get(target, prop, rx);

      if (typeof value === 'function') {
        return value.bind(set);
      }

      return value;
    }

  });
}

function frozenMap(_map) {
  const map = new Map(_map);
  return new Proxy(map, {
    get(target, prop, rx) {
      if (prop === Symbol.for('nodejs.util.inspect.custom')) {
        return () => new Map(map);
      }

      if (prop === 'set' || prop === 'clear' || prop === 'delete') {
        return noop.bind({
          prop,
          type: 'Map'
        });
      }

      const value = Reflect.get(target, prop, rx);

      if (typeof value === 'function') {
        return value.bind(map);
      }

      return value;
    }

  });
}
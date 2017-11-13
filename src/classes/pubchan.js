/* @flow */

import type {
  PubChan$EmitIDs,
  PubChan$Options,
  PubChan$Pipeline,
  PubChan$Listeners,
} from '../types';

import Subscriber from './subscriber';

function findMatchingListeners(PubChan, matches, events, emit) {
  if (Array.isArray(events)) {
    events.forEach(event =>
      findMatchingListeners(PubChan, matches, event, emit),
    );
  } else {
    emit.add(events);
    const set = PubChan.listeners.get(events);
    if (set) {
      set.forEach(match => matches.add(match));
    }
  }
  return matches;
}

class PubChan {
  pipeline: PubChan$Pipeline;
  +listeners: PubChan$Listeners = new Map();

  subscribe = (options?: $Shape<PubChan$Options> = {}) =>
    new Subscriber(this, options);

  get length(): number {
    return this.listeners.size;
  }

  get size(): number {
    return this.listeners.size;
  }

  emit = (...args: Array<PubChan$EmitIDs>) => {
    if (this.size === 0) {
      return this;
    }
    console.log(`
      PubChan EMIT! ${JSON.stringify(args)}
    `);
    const emit = new Set();
    const matches = new Set();
    const matchall = this.listeners.get('*');
    if (matchall) {
      matchall.forEach(match => matches.add(match));
    }
    this.pipeline = {
      emit,
      with: [],
      matches: args.reduce(
        (p, c) => findMatchingListeners(this, p, c, emit),
        matches,
      ),
    };
    return this;
  };

  with = (...args: Array<any>) => {
    if (this.pipeline) {
      this.pipeline.with = [...this.pipeline.with, ...args];
    }
    return this;
  };

  send = async () => {
    if (this.pipeline) {
      const promises = [];
      if (this.pipeline.matches.size > 0) {
        this.pipeline.matches.forEach(match => {
          const result = match.trigger(this.pipeline);
          promises.push(result);
        });
      }
      delete this.pipeline;
      return Promise.all(promises.reduce((p, c) => p.concat(c), []));
    }
    return null;
  };
}

export default PubChan;

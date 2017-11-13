/* @flow */

import type {
  PubChan$EmitIDs,
  PubChan$Options,
  PubChan$Pipeline,
  PubChan$Listeners,
  PubChan$SubscriberSet,
} from '../types';

import Subscriber from './subscriber';

const MATCH_ALL_KEY = '$all';
const MATCH_CLOSE_KEY = '$close';

function findMatchingListeners(PubChan, matches, events, emit) {
  if (Array.isArray(events)) {
    events.forEach(event =>
      findMatchingListeners(PubChan, matches, event, emit));
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
  +subscribers: PubChan$SubscriberSet = new Set();

  subscribe = (options?: $Shape<PubChan$Options> = {}) => {
    const subscriber = new Subscriber(this, options);
    this.subscribers.add(subscriber);
    return subscriber;
  };

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
    const matchall = this.listeners.get(MATCH_ALL_KEY);
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
    if (this.pipeline && args.length > 0) {
      this.pipeline.with = [...this.pipeline.with, ...args];
    }
    return this;
  };

  send = async (...args: Array<any>) => {
    if (this.pipeline) {
      if (args.length > 0) {
        this.with(...args);
      }
      const promises = [];
      if (this.pipeline.matches.size > 0) {
        this.pipeline.matches.forEach(match => {
          const result = match.trigger(this.pipeline);
          promises.push(result);
        });
      }
      // FIXME: Using delete operator as others currently are breaking
      //        flow-type soundness.
      delete this.pipeline;
      return Promise.all(promises.reduce((p, c) => p.concat(c), []));
    }
    return null;
  };

  close = async (...args: Array<any>) => {
    if (this.size === 0) {
      return null;
    }
    let result;
    if (this.listeners.has(MATCH_CLOSE_KEY)) {
      result = await this.emit(MATCH_CLOSE_KEY)
        .with(args)
        .send();
    }
    this.subscribers.forEach(subscriber => subscriber.cancel());
    return result;
  };
}

export default PubChan;

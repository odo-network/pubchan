/* @flow */

import type {
  PubChan$EmitIDs,
  PubChan$Options,
  PubChan$Pipeline,
  PubChan$Listeners,
  PubChan$SubscriberSet,
  PubChan$EmitResponseRef,
  PubChan$State,
  PubChan$ResolvedPipeline,
} from '../types';

import Subscriber from './subscriber';

const MATCH_ALL_KEY = '$all';
const MATCH_CLOSE_KEY = '$closed';

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

function resolvePipelineState(state: Array<PubChan$State> = []) {
  return state.reduce((p, c) => {
    if (!c) return p;
    if (typeof c === 'function') {
      return {
        ...p,
        ...(c(p) || {}),
      };
    }
    return {
      ...p,
      ...(c || {}),
    };
  }, {});
}

class PubChan {
  pipeline: PubChan$Pipeline;
  +listeners: PubChan$Listeners = new Map();
  +subscribers: PubChan$SubscriberSet = new Set();

  get length(): number {
    return this.listeners.size;
  }

  get size(): number {
    return this.listeners.size;
  }

  emit = (...ids: Array<PubChan$EmitIDs>) => {
    const emit = new Set();
    const matches = new Set();
    this.pipeline = {
      emit,
      with: [],
      matches,
    };
    if (this.size > 0) {
      const matchall = this.listeners.get(MATCH_ALL_KEY);
      if (matchall) {
        matchall.forEach(match => matches.add(match));
      }
      ids.forEach(emitID => findMatchingListeners(this, matches, emitID, emit));
    }
    return this;
  };

  with = (...args: Array<any>) => {
    if (this.pipeline && this.pipeline.matches.size > 0 && args.length > 0) {
      this.pipeline.with = [...this.pipeline.with, ...args];
    }
    return this;
  };

  state = (...args: Array<?PubChan$State>) => {
    if (this.pipeline && args.length > 0) {
      // FIXME: Flow cant handle Object.assign(...args)
      // this.pipeline.state = args.reduce(
      //   (p, c) => ({
      //     ...p,
      //     ...(c || {}),
      //   }),
      //   this.pipeline.state || {},
      // );
      this.pipeline.state = args.reduce(
        (p, c) => p.concat(c || []),
        this.pipeline.state || [],
      );
    }
    return this;
  };

  send = async (...args: Array<any>): Promise<PubChan$EmitResponseRef> => {
    // FIXME: Dont use delete once flow can handle it
    const pipeline: PubChan$ResolvedPipeline = {
      emit: this.pipeline.emit,
      with: this.pipeline.with,
      matches: this.pipeline.matches,
      state: this.pipeline.state && resolvePipelineState(this.pipeline.state),
    };
    delete this.pipeline;

    // console.log('S ', pipeline.state);
    if (pipeline) {
      if (pipeline.matches.size > 0) {
        if (args.length > 0) {
          this.with(...args);
        }
        const promises: Array<Array<void | Array<mixed> | mixed>> = [];

        if (pipeline.matches.size > 0) {
          pipeline.matches.forEach(match => {
            promises.push(match.trigger(pipeline));
          });
        }
        const promise = Promise.all(promises.reduce((p, c) => p.concat(c), []));
        if (pipeline.state) {
          return promise.then(results => ({
            results,
            state: pipeline.state,
          }));
        }
        return promise.then(results => ({ results }));
      }

      if (pipeline.state) {
        return {
          results: null,
          state: pipeline.state,
        };
      }
    }

    return { results: null };
  };

  subscribe = (options?: $Shape<PubChan$Options> = {}) => {
    const subscriber = new Subscriber(this, options);
    this.subscribers.add(subscriber);
    return subscriber;
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

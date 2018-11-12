/* @flow */

import type {
  PubChan$EmitIDs,
  PubChan$Options,
  PubChan$Pipeline,
  PubChan$Listeners,
  PubChan$SubscriberSet,
  PubChan$EmitResponseRef,
  PubChan$State,
  PubChan$StateShape,
  PubChan$ResolvedPipeline,
  PubChan$FindMiddleware,
  PubChan$PrepareMiddleware,
  PubChan$Config,
  PubChan$FnListeners,
} from '../types';

import Subscriber from './subscriber';
import Middleware from './middleware';

import { asynchronously } from '../utils/async';
import { frozenSet } from '../utils/freeze';

import createAsyncQueue from '../utils/queue';

export const SUBSCRIBE_ALL = Symbol.for('@pubchan/all_emits');
export const SUBSCRIBE_CLOSED = Symbol.for('@pubchan/channel_closed');
export const BROADCAST = Symbol.for('@pubchan/broadcast');

const BROADCAST_SET = frozenSet(new Set([BROADCAST]));

const NULL_RESULT = Object.freeze({ results: null });

function resolvePipelineState(state: Array<PubChan$State>): PubChan$StateShape {
  return state.reduce((p, c) => {
    if (!c) return p;
    if (typeof c === 'function') {
      return Object.assign(p, c(p));
    }
    return Object.assign(p, c);
  }, {});
}

/*
  When we are broadcasting we do not want to
  send to certain subscribers which are only
  listening for special cases (currently chan closed).
*/
function filterSpecialSubscriptions(subscribers) {
  return [...subscribers].filter(subscriber => {
    const { keys } = subscriber;
    return !(keys.has(SUBSCRIBE_CLOSED) && keys.size === 1);
  });
}

class PubChan {
  pipeline: PubChan$Pipeline;

  middleware: Middleware;

  closed: boolean;

  +listeners: PubChan$Listeners;

  +subscribers: PubChan$SubscriberSet;

  +fnlisteners: PubChan$FnListeners;

  constructor(config?: PubChan$Config) {
    this.closed = false;
    this.listeners = new Map();
    this.fnlisteners = new Map();
    this.subscribers = new Set();
    this.middleware = config && (config.find || config.prepare)
      ? new Middleware(this, config.find, config.prepare)
      : new Middleware(this);
  }

  get length(): number {
    return this.listeners.size + this.fnlisteners.size;
  }

  get size(): number {
    return this.listeners.size + this.fnlisteners.size;
  }

  sizeof(...ids: Array<PubChan$EmitIDs>): number {
    let size = 0;
    if (ids.length === 0) {
      this.listeners.forEach(listener => {
        size += listener.size;
      });
    } else {
      ids.forEach(id => {
        const listener = this.listeners.get(id);
        if (listener) {
          size += listener.size;
        }
      });
    }
    return size;
  }

  setMiddleware(find?: PubChan$FindMiddleware, prepare?: PubChan$PrepareMiddleware) {
    this.middleware = new Middleware(this, find, prepare);
  }

  broadcast() {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to emit to a closed pubchan');
    }
    this.pipeline = {
      ids: BROADCAST_SET,
      with: [],
      broadcast: true,
      matches: new Set(filterSpecialSubscriptions(this.subscribers)),
    };
    return this;
  }

  emit(...ids: Array<PubChan$EmitIDs>) {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to emit to a closed pubchan');
    }
    this.pipeline = {
      with: [],
      broadcast: false,
      ids: new Set(),
      matches: new Set(),
    };
    if (this.listeners.size) {
      this.middleware.match(ids);
      const matchall = this.listeners.get(SUBSCRIBE_ALL);
      if (matchall) {
        matchall.forEach(match => this.pipeline.matches.add(match));
      }
    }
    return this;
  }

  emitAsync(_ids: string | Array<PubChan$EmitIDs>, ...args: Array<any>) {
    const ids: Array<PubChan$EmitIDs> = Array.isArray(_ids) ? _ids : [_ids];
    const fn = () => this.emit(ids).send(...args);
    return asynchronously(fn);
  }

  with(...args: Array<any>) {
    if (args.length && this.pipeline && this.pipeline.matches.size > 0) {
      this.pipeline.with.push(...args);
    }
    return this;
  }

  state(...args: Array<?PubChan$State>) {
    if (this.pipeline && args.length) {
      this.pipeline.state = args.reduce(
        (p, c) => p.concat(c || []),
        this.pipeline.state || [],
      );
    }
    return this;
  }

  async send(...args: Array<any>): Promise<PubChan$EmitResponseRef> {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to send to a closed pubchan');
    } else if (!this.pipeline.matches.size) {
      if (this.pipeline.state) {
        return {
          results: null,
          state: this.pipeline.state
            ? resolvePipelineState(this.pipeline.state)
            : undefined,
        };
      }
      return NULL_RESULT;
    }

    const pipeline: PubChan$ResolvedPipeline = {
      broadcast: this.pipeline.broadcast,
      ids: this.pipeline.ids,
      with: this.pipeline.with,
      matches: this.pipeline.matches,
      state: this.pipeline.state ? resolvePipelineState(this.pipeline.state) : undefined,
    };

    if (args.length) {
      pipeline.with.push(...args);
    }

    const queue = createAsyncQueue();

    pipeline.matches.forEach(match => match.trigger(pipeline, queue));

    const response: PubChan$EmitResponseRef = {
      results: await queue.promise,
    };

    if (pipeline.state) {
      response.state = pipeline.state;
    }

    return response;
  }

  subscribe(options?: $Shape<PubChan$Options> = {}) {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to subscribe to a closed pubchan');
    }
    const subscriber = new Subscriber(this, options);
    return subscriber;
  }

  async close(...args: Array<any>) {
    if (this.size === 0) return null;
    let result;
    if (this.listeners.has(SUBSCRIBE_CLOSED)) {
      result = await this.emit(SUBSCRIBE_CLOSED)
        .with(args)
        .send();
    }
    this.closed = true;
    this.subscribers.forEach(subscriber => subscriber.cancel());
    return result;
  }
}

export default PubChan;

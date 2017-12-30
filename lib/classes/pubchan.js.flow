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
  PubChan$FindMiddleware,
  PubChan$PrepareMiddleware,
  PubChan$Config,
  PubChan$FnListeners,
} from '../types';

import Subscriber from './subscriber';
import Middleware from './middleware';

import { asynchronously } from '../utils/async';

const MATCH_ALL_KEY = '$all';
const MATCH_CLOSE_KEY = '$closed';

function resolvePipelineState(state: Array<PubChan$State>) {
  if (!state) return;
  return state.reduce((p, c) => {
    if (!c) return p;
    if (typeof c === 'function') {
      return Object.assign(p, c(p));
    }
    return Object.assign(p, c);
  }, {});
}

class PubChan {
  pipeline: PubChan$Pipeline;
  closed: boolean;
  +listeners: PubChan$Listeners;
  +subscribers: PubChan$SubscriberSet;
  +fnlisteners: PubChan$FnListeners;
  middleware: Middleware;

  constructor(config?: PubChan$Config) {
    this.closed = false;
    this.listeners = new Map();
    this.fnlisteners = new Map();
    this.subscribers = new Set();
    this.middleware =
      config && (config.find || config.prepare)
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

  setMiddleware(
    find?: PubChan$FindMiddleware,
    prepare?: PubChan$PrepareMiddleware,
  ) {
    this.middleware = new Middleware(this, find, prepare);
  }

  emit(...ids: Array<PubChan$EmitIDs>) {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to emit to a closed pubchan');
    }
    this.pipeline = {
      with: [],
      ids: new Set(),
      matches: new Set(),
    };
    if (this.listeners.size) {
      this.middleware.match(ids);
      const matchall = this.listeners.get(MATCH_ALL_KEY);
      if (matchall) {
        matchall.forEach(match => this.pipeline.matches.add(match));
      }
    }
    return this;
  }

  emitAsync(ids: string | Array<PubChan$EmitIDs>, ...args: Array<any>) {
    if (typeof ids === 'string') {
      ids = [ids];
    }
    return asynchronously(() => this.emit(...ids).send(...args));
  }

  with(...args: Array<any>) {
    if (args.length && this.pipeline && this.pipeline.matches.size > 0) {
      this.pipeline.with = [...this.pipeline.with, ...args];
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
          state: resolvePipelineState(this.pipeline.state),
        };
      }
      return { results: null };
    }

    const pipeline: PubChan$ResolvedPipeline = {
      ids: this.pipeline.ids,
      with: this.pipeline.with,
      matches: this.pipeline.matches,
      state: this.pipeline.state && resolvePipelineState(this.pipeline.state),
    };

    // FIXME: Dont use delete once flow can handle it
    // delete this.pipeline;

    if (args.length) {
      pipeline.with = pipeline.with.concat(args);
    }

    const responses: Array<void | Array<mixed> | mixed> = [];

    pipeline.matches.forEach(match =>
      responses.push(...match.trigger(pipeline)));

    const results = await Promise.all(responses);

    if (pipeline.state) {
      return {
        results,
        state: pipeline.state,
      };
    }

    return { results };
  }

  subscribe(options?: $Shape<PubChan$Options> = {}) {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to subscribe to a closed pubchan');
    }
    const subscriber = new Subscriber(this, options);
    this.subscribers.add(subscriber);
    return subscriber;
  }

  async close(...args: Array<any>) {
    if (!this.size) return null;
    let result;
    if (this.listeners.has(MATCH_CLOSE_KEY)) {
      result = await this.emit(MATCH_CLOSE_KEY)
        .with(args)
        .send();
    }
    this.closed = true;
    this.subscribers.forEach(subscriber => subscriber.cancel());
    return result;
  }
}

export default PubChan;

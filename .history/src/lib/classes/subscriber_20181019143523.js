/* @flow */

import type {
  PubChan$EmitIDs,
  PubChan$Ref,
  PubChan$Callback,
  PubChan$SubscriberSet,
  PubChan$EmitID,
  PubChan$Options,
  PubChan$CompleteCallback,
  PubChan$ResolvedPipeline,
} from '../types';

import type { AsyncQueue } from '../utils/queue';

import type PubChan from './pubchan';

import { asynchronously } from '../utils/async';

const ProxyObj = Object.create(null);

const StaticPropertyDescriptor = Object.freeze({
  enumerable: true,
  configurable: true,
});

function addSubscriberToEvent(sub, e) {
  let set;
  if (typeof e === 'function') {
    set = sub.pubchan.fnlisteners.get(e);
  } else {
    set = sub.pubchan.listeners.get(e);
  }
  if (!set) {
    set = new Set();
    if (typeof e === 'function') {
      sub.pubchan.fnlisteners.set(e, set);
    } else {
      sub.pubchan.listeners.set(e, set);
    }
  }
  set.add(sub);
  sub.pathrefs.set(e, set);
}

function removeSubscriber(sub) {
  sub._context = undefined;
  sub.pathrefs.forEach((set, e) => {
    set.delete(sub);
    sub.pathrefs.delete(e);
    if (!set.size) {
      if (typeof e === 'function') {
        sub.pubchan.fnlisteners.delete(e);
      } else {
        // cleanup the PubChan map when no other
        // listeners on this event exist
        sub.pubchan.listeners.delete(e);
      }
    }
  });
  console.log('n');
  console.log(sub.pubchan.fnlisteners.size);
  console.log(sub.pubchan.listeners.size);
  console.log(sub.pubchan.listeners);
}

function handleRefCancellation(sub: Subscriber, ref: PubChan$Ref) {
  sub.callbacks.delete(ref);
  if (!sub.callbacks.size) {
    removeSubscriber(sub);
  }
}

function executeCallback(
  args?: [PubChan$Ref, PubChan$ResolvedPipeline],
): void | Array<void | mixed> | mixed {
  if (!args) return;
  const [ref, pipeline] = args;
  if (Array.isArray(ref.callback)) {
    return ref.callback.map(cb => cb.call(this, ref, pipeline.ids, ...pipeline.with));
  }
  return ref.callback.call(this, ref, pipeline.ids, ...pipeline.with);
}

// provides a safe object which intermingles the global and local state
// for the publisher and consumer without the chance of consumer mutating
// the publishers value(s).
function proxiedState(pipeline: PubChan$ResolvedPipeline, ref: PubChan$Ref) {
  return new Proxy(ProxyObj, {
    has(t, prop) {
      if (pipeline.state && prop in pipeline.state) {
        return true;
      }
      return Reflect.has(ref._state, prop);
    },
    get(t, prop) {
      if (pipeline.state && Reflect.has(pipeline.state, prop)) {
        return pipeline.state[prop];
      }
      if (ref._state) {
        return ref._state[prop];
      }
    },
    set(t, prop, value: mixed) {
      return Reflect.set(ref._state, prop, value, ref._state);
    },
    deleteProperty(t, prop) {
      if (ref._state && prop in ref._state) {
        delete ref._state[prop];
        return true;
      }
      return false;
    },
    ownKeys() {
      return [
        ...new Set(Reflect.ownKeys(ref._state).concat(Reflect.ownKeys(pipeline.state))),
      ];
    },
    defineProperty(t, prop, descriptor) {
      return Reflect.defineProperty(ref._state, prop, descriptor);
    },
    getOwnPropertyDescriptor(t, prop) {
      if ((pipeline.state && pipeline.state[prop]) || (ref._state && ref._state[prop])) {
        return StaticPropertyDescriptor;
      }
    },
  });
}

class Subscriber {
  +async: boolean;

  +pubchan: PubChan;

  +callbacks: Set<PubChan$Ref>;

  // hold refs to the sets which we are subscribed to for
  // easy access and unsubscribe.
  +pathrefs: Map<PubChan$EmitID, PubChan$SubscriberSet>;

  _context: void | Object;

  callback: (
    args: [PubChan$Ref, PubChan$ResolvedPipeline],
  ) => void | Array<void | mixed> | mixed;

  constructor(pubchan: PubChan, options: $Shape<PubChan$Options>): Subscriber {
    this.callbacks = new Set();
    this.pathrefs = new Map();
    // this.options = getSubscriberOptions(options);
    this.pubchan = pubchan;
    this.async = options.async === true;
    if (options.context) {
      this._context = options.context;
    }
    this.callback = executeCallback;
    return this;
  }

  get length(): number {
    return this.callbacks.size;
  }

  get size(): number {
    return this.callbacks.size;
  }

  get keys(): Array<PubChan$EmitID> {
    return Array.from(this.pathrefs.keys());
  }

  async(): Promise<Subscriber> {
    return asynchronously(() => this);
  }

  context(context: Object) {
    this._context = context;
    return this;
  }

  to(...args: Array<PubChan$EmitIDs>) {
    args.forEach(
      el => (Array.isArray(el) ? this.to(...el) : addSubscriberToEvent(this, el)),
    );
    return this;
  }

  once(callback: PubChan$Callback, onComplete?: PubChan$CompleteCallback) {
    return this.do(callback, onComplete, true);
  }

  do(
    callback: PubChan$Callback,
    onComplete?: PubChan$CompleteCallback,
    once?: boolean = false,
  ) {
    const ref: PubChan$Ref = {
      once,
      state: {},
      subscription: this,
      chan: this.pubchan,
      cancel: () => handleRefCancellation(this, ref),
      callback,
    };
    this.callbacks.add(ref);
    if (onComplete) {
      onComplete(ref);
      ref._state = ref.state;
    }
    return this;
  }

  cancel() {
    removeSubscriber(this);
  }

  trigger<P: PubChan$ResolvedPipeline>(pipeline: P, queue: AsyncQueue): void {
    this.callbacks.forEach(ref => {
      if (ref.once) {
        ref.cancel();
      }
      if (pipeline.state) {
        ref.state = proxiedState(pipeline, ref);
      } else if (ref._state) {
        ref.state = ref._state;
      }
      queue.push(
        this.async
          ? () => this.callback.call(this._context || this, [ref, pipeline])
          : this.callback.call(this._context || this, [ref, pipeline]),
      );
    });
  }
}

export default Subscriber;

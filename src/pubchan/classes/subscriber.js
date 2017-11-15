/* @flow */

import type {
  PubChan$EmitIDs,
  PubChan$Ref,
  PubChan$Callback,
  PubChan$SubscriberSet,
  // PubChan$Pipeline,
  PubChan$EmitID,
  PubChan$Options,
  PubChan$CompleteCallback,
  PubChan$IDSet,
  PubChan$ResolvedPipeline,
  // PubChan$StateShape,
} from '../types';

import type { $StrictObject } from '../types/utils';

import type PubChan from './pubchan';

// import { ACTIVE } from '../context';

function addSubscriberToEvent(sub, e) {
  const set = sub.pubchan.listeners.get(e) || new Set();
  set.add(sub);
  sub.pathrefs.set(e, set);
  sub.pubchan.listeners.set(e, set);
}

function removeSubscriber(sub) {
  // console.log('Removing Subscriber! ');
  // ACTIVE.delete(sub);
  sub.pathrefs.forEach((set, e) => {
    set.delete(sub);
    sub.pathrefs.delete(e);
    if (set.size === 0) {
      // cleanup the PubChan map when no other listeners on this event exist
      sub.pubchan.listeners.delete(e);
    }
  });
}

const getSubscriberOptions = (
  options: $Shape<PubChan$Options>,
): $StrictObject<PubChan$Options> => ({
  async: typeof options.async === 'boolean' ? options.async : false,
});

function addCallbackToSubscriber(sub: Subscriber, ref: PubChan$Ref) {
  sub.callbacks.add(ref);
}

function handleRefCancellation(sub: Subscriber, ref: PubChan$Ref) {
  sub.callbacks.delete(ref);
  if (sub.callbacks.size === 0) {
    removeSubscriber(sub);
  }
}

function handleAsyncCallback(
  ref: PubChan$Ref,
  ids: PubChan$IDSet,
  args: Array<*>,
): Promise<void | Array<void | mixed> | mixed> {
  return new Promise(resolve => {
    if (typeof process.nextTick === 'function') {
      process.nextTick(() => resolve(executeCallback(ref, ids, args)));
    } else {
      setImmediate(() => resolve(executeCallback(ref, ids, args)));
    }
  });
}

function executeCallback(
  ref: PubChan$Ref,
  ids: PubChan$IDSet,
  args: Array<any>,
): void | Array<void | mixed> | mixed {
  if (Array.isArray(ref.callback)) {
    const results = ref.callback.map(cb => cb(ref, ids, ...args));
    return results;
  }
  return ref.callback(ref, ids, ...args);
}

// provides a safe object which intermingles the global and local state
// for the publisher and consumer without the chance of consumer mutating
// the publishers value(s).
function proxiedState(pipeline: PubChan$ResolvedPipeline, ref: PubChan$Ref) {
  return new Proxy(
    {},
    {
      has(t, prop) {
        if (pipeline.state && prop in pipeline.state) {
          return true;
        }
        return Reflect.has(ref._state, prop);
      },
      get(t, prop) {
        if (pipeline.state && Reflect.has(pipeline.state, prop)) {
          return pipeline.state[prop];
        } else if (ref._state) {
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
          ...new Set(
            [].concat(
              Reflect.ownKeys(ref._state),
              Reflect.ownKeys(pipeline.state),
            ),
          ),
        ];
      },
      defineProperty(t, prop, descriptor) {
        return Reflect.defineProperty(ref._state, prop, descriptor);
      },
      getOwnPropertyDescriptor(t, prop) {
        if (
          (pipeline.state && pipeline.state[prop]) ||
          (ref._state && ref._state[prop])
        ) {
          return {
            enumerable: true,
            configurable: true,
          };
        }
      },
    },
  );
}

class Subscriber {
  +pubchan: PubChan;
  +callbacks: Set<PubChan$Ref> = new Set();
  // hold refs to the sets which we are subscribed to for
  // easy access and unsubscribe.
  +pathrefs: Map<PubChan$EmitID, PubChan$SubscriberSet> = new Map();
  +options: $StrictObject<PubChan$Options>;

  constructor(pubchan: PubChan, options: $Shape<PubChan$Options>): Subscriber {
    this.options = getSubscriberOptions(options);
    this.pubchan = pubchan;
    return this;
  }

  get length(): number {
    return this.callbacks.size;
  }

  get size(): number {
    return this.callbacks.size;
  }

  get keys(): Array<PubChan$EmitID> {
    return [...this.pathrefs.keys()];
  }

  to = (...args: Array<PubChan$EmitIDs>) => {
    // ACTIVE.add(this);
    args.forEach(
      el =>
        (Array.isArray(el) ? this.to(...el) : addSubscriberToEvent(this, el)),
    );
    return this;
  };

  once = (
    callback: PubChan$Callback,
    onComplete?: PubChan$CompleteCallback,
  ) => {
    const ref: PubChan$Ref = {
      subscription: this,
      chan: this.pubchan,
      once: true,
      state: {},
      cancel: () => handleRefCancellation(this, ref),
      callback,
    };
    addCallbackToSubscriber(this, ref);
    if (onComplete && typeof onComplete === 'function') {
      onComplete(ref);
      ref._state = ref.state;
    }
    return this;
  };

  do = (callback: PubChan$Callback, onComplete?: PubChan$CompleteCallback) => {
    const ref: PubChan$Ref = {
      subscription: this,
      chan: this.pubchan,
      state: {},
      cancel: () => handleRefCancellation(this, ref),
      callback,
    };
    addCallbackToSubscriber(this, ref);
    if (onComplete && typeof onComplete === 'function') {
      onComplete(ref);
      ref._state = ref.state;
    }
    return this;
  };

  cancel = () => removeSubscriber(this);

  trigger = (
    pipeline: PubChan$ResolvedPipeline,
  ): Array<void | Array<mixed> | mixed> => {
    const results = [];
    this.callbacks.forEach(ref => {
      let result;
      if (ref.once) {
        ref.cancel();
      }

      if (pipeline.state) {
        ref.state = proxiedState(pipeline, ref);
      } else if (ref._state) {
        ref.state = ref._state;
      }

      // const args = [ref, pipeline.emit, ...pipeline.with];
      if (!this.options.async) {
        result = executeCallback(ref, pipeline.emit, pipeline.with);
      } else {
        result = handleAsyncCallback(ref, pipeline.emit, pipeline.with);
      }

      results.push(result);
    });
    return results;
  };
}

export default Subscriber;

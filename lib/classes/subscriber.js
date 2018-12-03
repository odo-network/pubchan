"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const ProxyObj = Object.freeze({});
const StaticPropertyDescriptor = Object.freeze({
  enumerable: true,
  configurable: true
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

  if (!sub.pubchan.subscribers.has(sub)) {
    sub.pubchan.subscribers.add(sub);
  }
}

function removeSubscriber(sub) {
  sub._context = undefined;
  sub.pathrefs.forEach((set, e) => {
    set.delete(sub);

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
  sub.pathrefs.clear();
  sub.pubchan.subscribers.delete(sub);
  sub.pubchan.subscriberRemoved();
}

function handleRefCancellation(sub, ref) {
  sub.callbacks.delete(ref);

  if (!sub.callbacks.size) {
    removeSubscriber(sub);
  }
}

function executeCallback(args) {
  if (!args) return;
  const [ref, pipeline] = args;

  if (Array.isArray(ref.callback)) {
    return ref.callback.map(cb => cb.call(this, ref, pipeline.ids, ...pipeline.with));
  }

  return ref.callback.call(this, ref, pipeline.ids, ...pipeline.with);
} // provides a safe object which intermingles the global and local state
// for the publisher and consumer without the chance of consumer mutating
// the publishers value(s).


function proxiedState(pipeline, ref) {
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

    set(t, prop, value) {
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
      return [...new Set(Reflect.ownKeys(ref._state).concat(Reflect.ownKeys(pipeline.state)))];
    },

    defineProperty(t, prop, descriptor) {
      return Reflect.defineProperty(ref._state, prop, descriptor);
    },

    getOwnPropertyDescriptor(t, prop) {
      if (pipeline.state && pipeline.state[prop] || ref._state && ref._state[prop]) {
        return StaticPropertyDescriptor;
      }
    }

  });
}

class Subscriber {
  // hold refs to the sets which we are subscribed to for
  // easy access and unsubscribe.
  constructor(pubchan, options) {
    this.async = void 0;
    this.pubchan = void 0;
    this.callbacks = void 0;
    this.pathrefs = void 0;
    this._context = void 0;
    this.callbacks = new Set();
    this.pathrefs = new Map();
    this.pubchan = pubchan;
    this.async = options.async === true;

    if (options.context) {
      this._context = options.context;
    }

    return this;
  }

  get length() {
    return this.callbacks.size;
  }

  get size() {
    return this.callbacks.size;
  }

  get keys() {
    return new Set(this.pathrefs.keys());
  }

  context(context) {
    this._context = context;
    return this;
  }

  to(...args) {
    args.forEach(el => {
      if (Array.isArray(el)) {
        this.to(...el);
      } else {
        addSubscriberToEvent(this, el);
      }
    });
    console.log(this.pathrefs.keys());
    return this;
  }

  once(callback, onComplete) {
    return this.do(callback, onComplete, true);
  }

  do(callback, onComplete, once = false) {
    const ref = {
      once,
      state: {},
      subscription: this,
      chan: this.pubchan,
      cancel: () => handleRefCancellation(this, ref),
      callback
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

  trigger(pipeline, queue) {
    this.callbacks.forEach(ref => {
      if (ref.once) {
        ref.cancel();
      }

      if (pipeline.state) {
        ref.state = proxiedState(pipeline, ref);
      } else if (ref._state) {
        ref.state = ref._state;
      }

      queue.push(this.async ? () => executeCallback.call(this._context, [ref, pipeline]) : executeCallback.call(this._context, [ref, pipeline]));
    });
  }

}

var _default = Subscriber;
exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _constants = require("../constants");

var _subscriber = _interopRequireDefault(require("./subscriber"));

var _middleware = _interopRequireDefault(require("./middleware"));

var _async = require("../utils/async");

var _freeze = require("../utils/freeze");

var _queue = _interopRequireDefault(require("../utils/queue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BROADCAST_SET = (0, _freeze.frozenSet)(new Set([_constants.BROADCAST]));
const NULL_RESULT = Object.freeze({
  results: null
});

function resolvePipelineState(state) {
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
    const {
      keys
    } = subscriber;

    if (keys.size > _constants.IGNORED_SUBSCRIPTIONS.length) {
      return true;
    }

    return [...keys].some(key => !_constants.IGNORED_SUBSCRIPTIONS.includes(key) && key !== _constants.SUBSCRIBE_CLOSED);
  });
}

class PubChan {
  constructor(config) {
    this.pipeline = void 0;
    this.middleware = void 0;
    this.closed = void 0;
    this.listeners = void 0;
    this.subscribers = void 0;
    this.fnlisteners = void 0;
    this.closed = false;
    this.listeners = new Map();
    this.fnlisteners = new Map();
    this.subscribers = new Set();
    this.middleware = config && (config.find || config.prepare) ? new _middleware.default(this, config.find, config.prepare) : new _middleware.default(this);
  }

  get length() {
    return filterSpecialSubscriptions(this.subscribers).length;
  }

  get size() {
    return filterSpecialSubscriptions(this.subscribers).length;
  }

  sizeof(...ids) {
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

  setMiddleware(find, prepare) {
    this.middleware = new _middleware.default(this, find, prepare);
  }

  broadcast() {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to emit to a closed pubchan');
    }

    if (this.subscribers.size) {
      this.pipeline = {
        ids: BROADCAST_SET,
        with: [],
        broadcast: true,
        matches: new Set(filterSpecialSubscriptions(this.subscribers))
      };
    }

    return this;
  }

  emit(...ids) {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to emit to a closed pubchan');
    }

    if (this.subscribers.size) {
      this.pipeline = {
        with: [],
        broadcast: false,
        ids: new Set(),
        matches: new Set()
      };
      this.middleware.match(ids);
      const matchall = this.listeners.get(_constants.SUBSCRIBE_ALL);

      if (matchall && !ids.every(id => _constants.IGNORED_SUBSCRIPTIONS.includes(id))) {
        matchall.forEach(match => this.pipeline.matches.add(match));
      }
    }

    return this;
  }

  emitAsync(_ids, ...args) {
    const ids = Array.isArray(_ids) ? _ids : [_ids];

    const fn = () => this.emit(ids).send(...args);

    return (0, _async.asynchronously)(fn);
  }

  with(...args) {
    if (this.subscribers.size && this.pipeline && args.length && this.pipeline.matches.size > 0) {
      this.pipeline.with.push(...args);
    }

    return this;
  }

  filter(fn) {
    if (this.subscribers.size && this.pipeline && this.pipeline.matches.size > 0) {
      this.pipeline.matches = new Set([...this.pipeline.matches].filter(fn));
    }

    return this;
  }

  state(...args) {
    if (this.subscribers.size && this.pipeline && args.length) {
      this.pipeline.state = args.reduce((p, c) => p.concat(c || []), this.pipeline.state || []);
    }

    return this;
  }

  async send(...args) {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to send to a closed pubchan');
    } else if (!this.subscribers.size) {
      return NULL_RESULT;
    } else if (!this.pipeline.matches.size) {
      if (this.pipeline.state) {
        return {
          results: null,
          state: this.pipeline.state ? resolvePipelineState(this.pipeline.state) : undefined
        };
      }

      return NULL_RESULT;
    }

    const pipeline = {
      broadcast: this.pipeline.broadcast,
      ids: this.pipeline.ids,
      with: this.pipeline.with,
      matches: this.pipeline.matches,
      state: this.pipeline.state ? resolvePipelineState(this.pipeline.state) : undefined
    };

    if (args.length) {
      pipeline.with.push(...args);
    }

    const queue = (0, _queue.default)();
    pipeline.matches.forEach(match => match.trigger(pipeline, queue));
    const response = {
      results: await queue.promise
    };

    if (pipeline.state) {
      response.state = pipeline.state;
    }

    return response;
  }

  subscribe(options = {}) {
    if (this.closed) {
      throw new Error('[pubchan]: Tried to subscribe to a closed pubchan');
    }

    const subscriber = new _subscriber.default(this, options);

    if (this.listeners.has(_constants.SUBSCRIBE_SUBSCRIBERS_ALL) || this.listeners.has(_constants.SUBSCRIBE_SUBSCRIBERS_ADDED)) {
      const subscribersAtRequest = new Set(this.subscribers);
      (0, _async.asynchronously)(() => {
        if (this.subscribers.has(subscriber)) {
          this.emit(_constants.SUBSCRIBE_SUBSCRIBERS_ALL, _constants.SUBSCRIBE_SUBSCRIBERS_ADDED).with('added', subscriber).filter(match => match !== subscriber && subscribersAtRequest.has(match)).send();
        }
      });
    }

    return subscriber;
  }

  subscriberRemoved(subscriber) {
    if (this.listeners.has(_constants.SUBSCRIBE_SUBSCRIBERS_ALL) || this.listeners.has(_constants.SUBSCRIBE_SUBSCRIBERS_REMOVED)) {
      this.emit(_constants.SUBSCRIBE_SUBSCRIBERS_ALL, _constants.SUBSCRIBE_SUBSCRIBERS_REMOVED).with('removed').filter(match => match !== subscriber).send();
    }
  }

  async close(...args) {
    if (this.size === 0) return null;
    let result;

    if (this.listeners.has(_constants.SUBSCRIBE_CLOSED)) {
      result = await this.emit(_constants.SUBSCRIBE_CLOSED).with(args).send();
    }

    this.closed = true;
    this.subscribers.forEach(subscriber => subscriber.cancel());
    return result;
  }

}

var _default = PubChan;
exports.default = _default;
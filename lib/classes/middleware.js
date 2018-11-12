"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function defaultMiddlewareFind(event, matches, listeners) // fnlisteners: PubChan$FnListeners,
// middleware: PubChanMiddleware,
{
  const set = listeners.get(event);

  if (set instanceof Set) {
    set.forEach(match => matches.add(match));
  }
}

function iterateEvents(handler, events, matches, listeners, fnlisteners, middleware) {
  if (Array.isArray(events)) {
    // eslint-ignore-next-line max-len
    events.forEach(event => {
      iterateEvents(handler, event, matches, listeners, fnlisteners, middleware);
    });
  } else {
    middleware.pubchan.pipeline.ids.add(events);

    if (handler(events, matches, listeners, middleware) === null) {
      defaultMiddlewareFind(events, matches, listeners);
    }

    fnlisteners.forEach((fnset, fn) => {
      if (fnset instanceof Set && fn(events, matches, listeners, middleware)) {
        fnset.forEach(match => matches.add(match));
      }
    });
  }
} // Used to find matches when an event is emitted by a client.  This can
// be used to modify the standard handling of matching for a pubchan to
// add new matching configurations if needed.


class PubChanMiddleware {
  // called for each received id/event
  // called before starting any matching
  // so flow doesn't complain, a middleware
  // provider may use the state object to store
  // data if needed
  constructor(pubchan, find, prepare) {
    this.pubchan = void 0;
    this.find = void 0;
    this.prepare = void 0;
    this.state = void 0;
    this.pubchan = pubchan;
    this.find = find || defaultMiddlewareFind;

    if (prepare) {
      this.prepare = prepare;
    }
  }

  match(ids) {
    const {
      listeners,
      fnlisteners,
      pipeline
    } = this.pubchan;
    const {
      matches
    } = pipeline;

    if (this.prepare) {
      this.prepare(matches, listeners, this);
    }

    if (Array.isArray(ids) && ids.length) {
      ids.forEach(events => {
        iterateEvents(this.find, events, matches, listeners, fnlisteners, this);
      });
    }

    return matches;
  }

}

var _default = PubChanMiddleware;
exports.default = _default;
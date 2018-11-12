/* @flow */
import type PubChan from './pubchan';

import type {
  PubChan$FindMiddleware,
  PubChan$PrepareMiddleware,
  PubChan$FnListeners,
  PubChan$EmitID,
  PubChan$EmitIDs,
  PubChan$Listeners,
  PubChan$Matches,
} from '../types';

function defaultMiddlewareFind(
  event: PubChan$EmitID,
  matches: PubChan$Matches,
  listeners: PubChan$Listeners,
  // fnlisteners: PubChan$FnListeners,
  // middleware: PubChanMiddleware,
) {
  const set = listeners.get(event);
  if (set instanceof Set) {
    set.forEach(match => matches.add(match));
  }
}

function iterateEvents(
  handler: PubChan$FindMiddleware,
  events: PubChan$EmitIDs,
  matches: PubChan$Matches,
  listeners: PubChan$Listeners,
  fnlisteners: PubChan$FnListeners,
  middleware: PubChanMiddleware,
) {
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
}

// Used to find matches when an event is emitted by a client.  This can
// be used to modify the standard handling of matching for a pubchan to
// add new matching configurations if needed.
class PubChanMiddleware {
  +pubchan: PubChan;

  // called for each received id/event
  +find: PubChan$FindMiddleware;

  // called before starting any matching
  +prepare: PubChan$PrepareMiddleware;

  // so flow doesn't complain, a middleware
  // provider may use the state object to store
  // data if needed
  state: { [key: string]: * };

  constructor(
    pubchan: PubChan,
    find?: PubChan$FindMiddleware,
    prepare?: PubChan$PrepareMiddleware,
  ) {
    this.pubchan = pubchan;
    this.find = find || defaultMiddlewareFind;
    if (prepare) {
      this.prepare = prepare;
    }
  }

  match(ids: Array<PubChan$EmitIDs>): PubChan$Matches {
    const { listeners, fnlisteners, pipeline } = this.pubchan;
    const { matches } = pipeline;
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

export default PubChanMiddleware;

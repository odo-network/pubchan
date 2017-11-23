/* @flow */
import type PubChan from './pubchan';
import type {
  PubChan$FindMiddleware,
  PubChan$PrepareMiddleware,
  PubChan$EmitID,
  PubChan$EmitIDs,
  PubChan$Listeners,
  PubChan$Matches,
} from '../types';

function defaultMiddlewareFind(
  event: PubChan$EmitID,
  matches: PubChan$Matches,
  listeners: PubChan$Listeners,
  // middleware: PubChanMiddleware,
) {
  const set = listeners.get(event);
  if (set instanceof Set) {
    set.forEach(match => matches.add(match));
  }
}

function iterateEvents<S: {}>(
  handler: PubChan$FindMiddleware<S>,
  events: PubChan$EmitIDs,
  matches: PubChan$Matches,
  listeners: PubChan$Listeners,
  middleware: PubChanMiddleware<S>,
) {
  if (Array.isArray(events)) {
    events.forEach(event =>
      iterateEvents(handler, event, matches, listeners, middleware));
  } else {
    middleware.pubchan.pipeline.ids.add(events);
    handler(events, matches, listeners, middleware);
  }
}

// Used to find matches when an event is emitted by a client.  This can
// be used to modify the standard handling of matching for a pubchan to
// add new matching configurations if needed.
class PubChanMiddleware<S: {} = { [key: string]: * }> {
  +pubchan: PubChan;
  // called for each received id/event
  +find: PubChan$FindMiddleware<S>;
  // called before starting any matching
  +prepare: PubChan$PrepareMiddleware<S>;

  // so flow doesn't complain, a middleware
  // provider may use the state object to store
  // data if needed
  state: S;

  constructor(
    pubchan: PubChan,
    find?: PubChan$FindMiddleware<S>,
    prepare?: PubChan$PrepareMiddleware<S>,
  ) {
    this.pubchan = pubchan;
    this.find = find || defaultMiddlewareFind;
    if (prepare) {
      this.prepare = prepare;
    }
  }

  match(ids: Array<PubChan$EmitIDs>): PubChan$Matches {
    const { listeners, pipeline } = this.pubchan;
    const { matches } = pipeline;
    if (this.prepare) {
      this.prepare(matches, listeners, this);
    }
    if (Array.isArray(ids) && ids.length) {
      ids.forEach(events => {
        iterateEvents(this.find, events, matches, listeners, this);
      });
    }
    return matches;
  }
}

export default PubChanMiddleware;

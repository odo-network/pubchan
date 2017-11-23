/* @flow */

import Wildcard from 'wildcard-utils';
import type { Wildcard$ToPatternTypes } from 'wildcard-utils/lib/types';

import type {
  PubChan$EmitID,
  PubChan$Listeners,
  PubChan$Matches,
} from '../../pubchan/types';

import type { PubChan, Middleware } from '../../pubchan';

/*
  Implements a PubChan which is capable of using wildcard matching
  against subscriptions.

  Requires the user has wildcard-utils installed which is a peer
  dependency.

  Takes a PubChan instance and adds the wildcard middleware to it
*/

type WildcardMiddleware$State = {|
  keys: Array<Wildcard$ToPatternTypes>,
|};

const WC = new Wildcard();

function defaultMiddlewareFind(
  event: PubChan$EmitID,
  matches: PubChan$Matches,
  listeners: PubChan$Listeners,
  middleware: Middleware<WildcardMiddleware$State>,
) {
  if (
    event &&
    (typeof event === 'string' ||
      typeof event === 'object' ||
      event instanceof Set)
  ) {
    const { keys } = middleware.state;
    const matched = WC.pattern(keys).search(event);
    if (Array.isArray(matched) && matched.length) {
      matched.forEach(key => {
        const set = listeners.get(key);
        if (set instanceof Set) {
          set.forEach(match => matches.add(match));
        }
      });
    }
  }
}

function prepareWildcardSearch(
  matches: PubChan$Matches,
  listeners: PubChan$Listeners,
  middleware: Middleware<WildcardMiddleware$State>,
) {
  // pre-build our latest listen keys
  const keys = [...listeners.keys()].reduce((p, c) => {
    if (
      c != null &&
      (typeof c === 'string' || typeof c === 'object' || Array.isArray(c))
    ) {
      // Flow Failure
      // $FlowIgnore
      p.push((c: Wildcard$ToPatternTypes));
    }
    return p;
  }, ([]: Array<Wildcard$ToPatternTypes>));
  middleware.state = { keys };
}

function addWildcardMiddleware(pubchan: PubChan): PubChan {
  if (!pubchan) {
    throw new Error('addWildcardMiddleware expects a pubchan as its argument');
  }
  pubchan.setMiddleware(defaultMiddlewareFind, prepareWildcardSearch);
  return pubchan;
}

export default addWildcardMiddleware;

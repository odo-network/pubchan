/* @flow */

import Wildcard from 'wildcard-utils';
// import type { Wildcard$ToPatternTypes } from 'wildcard-utils/lib/types';

import type {
  PubChan$EmitID,
  PubChan$Listeners,
  PubChan$Matches,
  PubChan$PrepareMiddleware,
  PubChan$FindMiddleware,
} from '../../lib/types';

import type { PubChan } from '../../lib';

/*
  Implements a PubChan which is capable of using wildcard matching
  against subscriptions.

  Requires the user has wildcard-utils installed which is a peer
  dependency.

  Takes a PubChan instance and adds the wildcard middleware to it
*/

// type WildcardMiddleware$State = {|
//   keys: Array<Wildcard$ToPatternTypes>,
// |};

const WC = new Wildcard();

const handleWildcardFind: PubChan$FindMiddleware = function wildcardFind(
  event: PubChan$EmitID,
  matches: PubChan$Matches,
  listeners: PubChan$Listeners,
  // middleware: Middleware<WildcardMiddleware$State>,
) {
  if (
    event
    && (typeof event === 'string' || typeof event === 'object' || event instanceof Set)
  ) {
    const matched = WC.search(event);
    if (Array.isArray(matched) && matched.length) {
      matched.forEach(key => {
        const set = listeners.get(key);
        if (set instanceof Set) {
          set.forEach(match => matches.add(match));
        }
      });
    }
  } else {
    // relay event to default middleware handler by returning null
    return null;
  }
};

const prepareWildcardSearch: PubChan$PrepareMiddleware = function prepareSearch(
  matches: PubChan$Matches,
  listeners: PubChan$Listeners,
  // middleware: Middleware,
) {
  WC.pattern([...listeners.keys()].filter(el => typeof el === 'string'));
};

function addWildcardMiddleware(pubchan: PubChan): PubChan {
  if (!pubchan) {
    throw new Error('addWildcardMiddleware expects a pubchan as its argument');
  }
  pubchan.setMiddleware(handleWildcardFind, prepareWildcardSearch);
  return pubchan;
}

export default addWildcardMiddleware;

/* @flow */
/*
  Registry is used to coordinate channels centrally.  It can be used to
  allow the creation of pubchan's and retrieval of those channels from
  other parts of the application.

  This also allows us to easily introspect our pubchans.
*/
import type { PubChan } from '../lib';
import createPubChanInstance, { SUBSCRIBE_ALL, SUBSCRIBE_CLOSED } from '../lib';

interface getChan {
  (id: mixed, ifexists?: false): PubChan;
  (id: mixed, ifexists: void | false): PubChan;
  (id: mixed, ifexists: true): void | PubChan;
}

const PUBCHANS: Map<any, PubChan> = new Map();

function handleChanCreate(id: mixed, chan: PubChan) {
  PUBCHANS.set(id, chan);
  chan
    .subscribe()
    .to(SUBSCRIBE_CLOSED)
    .do(ref => {
      PUBCHANS.delete(id);
      ref.cancel();
    });
}

/*
  Flow is not capable of properly refining the type based on an
  argument parameter so this "hack" allows it to do so.  We need
  to Ignore the errors as the types are correct.
*/

const getPubChan = function getPubChanFn<I: mixed, B: boolean>(
  id: I,
  ifexists?: B,
): $Call<getChan, I, B> {
  const chan = PUBCHANS.get(id);
  if (!ifexists) {
    if (!chan) {
      return createPubChan(id);
    }
    return chan;
  }
  // $FlowIgnore
  return chan;
};

function createPubChan(id: mixed): PubChan {
  let chan = PUBCHANS.get(id);
  if (!chan) {
    chan = createPubChanInstance();
    handleChanCreate(id, chan);
  }
  return chan;
}

// This is not actually supported by Flow yet ( using %checks in this way )
// but should not hurt to have it this way in case they start supporting
// it in the future as this will be the syntax expected.
//
// in the meantime, it should not cause any errors or problems.
function hasPubChan(...ids: Array<mixed>): boolean %checks {
  return ids.every(id => PUBCHANS.get(id) !== undefined);
}

function pubChanKeys() {
  return Array.from(PUBCHANS.keys());
}

function pubChanValues() {
  return Array.from(PUBCHANS.values());
}

function pubChanEntries() {
  return Array.from(PUBCHANS.entries());
}

const PubChanRegistry = Object.freeze({
  has: hasPubChan,
  get: getPubChan,
  keys: pubChanKeys,
  create: createPubChan,
  values: pubChanValues,
  entries: pubChanEntries,
});

export default PubChanRegistry;

export {
  SUBSCRIBE_ALL,
  SUBSCRIBE_CLOSED,
  getPubChan,
  hasPubChan,
  pubChanKeys,
  pubChanValues,
  pubChanEntries,
};

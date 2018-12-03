/* @flow */
/*
  Registry is used to coordinate channels centrally.  It can be used to
  allow the creation of pubchan's and retrieval of those channels from
  other parts of the application.

  This also allows us to easily introspect our pubchans.
*/
import type { PubChan } from '../lib';
import createPubChanInstance from '../lib';

import { SUBSCRIBE_CLOSED } from '../lib/constants';

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

const getPubChan = function getPubChanFn(id: any) {
  const chan = PUBCHANS.get(id);
  if (!chan) {
    return createPubChan(id);
  }
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
function hasPubChan(...ids: Array<mixed>): boolean {
  return ids.every(id => PUBCHANS.get(id) !== undefined);
}

function pubChanKeys() {
  return (Array.from(PUBCHANS.keys()): any[]);
}

function pubChanValues() {
  return (Array.from(PUBCHANS.values()): PubChan[]);
}

function pubChanEntries() {
  return (Array.from(PUBCHANS.entries()): Array<[any, PubChan]>);
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
  getPubChan, hasPubChan, pubChanKeys, pubChanValues, pubChanEntries,
};

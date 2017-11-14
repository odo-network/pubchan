/* @flow */
/*
  Registry is used to coordinate channels centrally.  It can be used to
  allow the creation of pubchan's and retrieval of those channels from
  other parts of the application.

  This also allows us to easily introspect our pubchans.
*/
import type { PubChan } from 'pubchan';
import createPubChan from 'pubchan';

const PUBCHANS: Map<mixed, PubChan> = new Map();

function handleChanCreate(id: mixed, chan: PubChan) {
  PUBCHANS.set(id, chan);
  chan
    .subscribe()
    .to('$closed')
    .do(ref => {
      PUBCHANS.delete(id);
      ref.cancel();
    });
}

function getPubChan(id: mixed, ifexists: boolean = false) {
  let chan = PUBCHANS.get(id);
  if (!chan && !ifexists) {
    chan = createPubChan();
    handleChanCreate(id, chan);
  }
  return chan;
}

function hasPubChan(id: mixed) {
  return PUBCHANS.has(id);
}

function pubChanKeys() {
  return [...PUBCHANS.keys()];
}

function pubChanValues() {
  return [...PUBCHANS.entries()];
}

function pubChanEntries() {
  return [...PUBCHANS.entries()];
}

const PubChanRegistry = Object.freeze({
  has: hasPubChan,
  get: getPubChan,
  keys: pubChanKeys,
  create: getPubChan,
  values: pubChanValues,
  entries: pubChanEntries,
});

export default PubChanRegistry;

export { getPubChan, hasPubChan, pubChanKeys, pubChanValues, pubChanEntries };

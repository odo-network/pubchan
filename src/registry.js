/* @flow */
/*
  Registry is used to coordinate channels centrally.  It can be used to
  allow the creation of pubchan's and retrieval of those channels from
  other parts of the application.

  This also allows us to easily introspect our pubchans.
*/
import type PubChan from './classes/pubchan';
import createPubChan from './index';

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

function getPubChan(id: mixed) {
  let chan = PUBCHANS.get(id);
  if (!chan) {
    chan = createPubChan();
    handleChanCreate(id, chan);
  }
  return chan;
}

function hasPubChan(id: mixed) {
  return PUBCHANS.has(id);
}

export default getPubChan;

export { getPubChan, hasPubChan };

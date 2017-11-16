/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import registry, { hasPubChan } from '../src/registry';

getNativeAsyncCost().then(() => {
  // anywhere in app, get the channel by an id.  if it doesnt exist it
  // will be created and returned.
  const chan = registry.get('mychan');

  log('Has Pub Chan? ', hasPubChan('mychan'));

  chan
    .subscribe()
    .to('foo')
    .do(() => log('FOO!'));

  chan
    .emit('foo')
    .send()
    .then(() => {
      log('Emission Complete, Close PubChan mychan');
      // when we close the channel, it is automatically cleaned
      // up from the pubchan map.

      chan.close();

      log('Has Pub Chan? ', hasPubChan('mychan'));
    });
});

/*
  +75.2340   643405754.811798     Native Async Startup Complete (nextTick)
  +2.9768    643405757.788587     Has Pub Chan?  true
  +0.6116    643405758.400221     FOO!
  +0.1456    643405758.545823     Emission Complete, Close PubChan mychan
  +0.3416    643405758.887403     Has Pub Chan?  false
*/

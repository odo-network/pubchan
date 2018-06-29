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
  +0.0347    0.03764998912811279  Native Async Startup Complete (nextTick)
  +1.5733    1.6109249591827393   Has Pub Chan?  true
  +0.6749    2.285828948020935    FOO!
  +0.3893    2.675160050392151    Emission Complete, Close PubChan mychan
  +0.2954    2.9705770015716553   Has Pub Chan?  false

  * without logging 1.5187809467315674 elapsed
*/

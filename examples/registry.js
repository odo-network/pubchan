/* @flow */
import registry, { hasPubChan } from '../src/registry';

// anywhere in app, get the channel by an id.  if it doesnt exist it
// will be created and returned.
const chan = registry.get('mychan');

console.log('Has Pub Chan? ', hasPubChan('mychan'));

chan
  .subscribe()
  .to('foo')
  .do(() => console.log('FOO!'));

chan
  .emit('foo')
  .send()
  .then(() => {
    console.log('Emission Complete, Close PubChan mychan');
    // when we close the channel, it is automatically cleaned
    // up from the pubchan map.

    chan.close();

    console.log('Has Pub Chan? ', hasPubChan('mychan'));
  });

/*
  Has Pub Chan?  true
  FOO!
  Emission Complete, Close PubChan mychan
  Has Pub Chan?  false
*/

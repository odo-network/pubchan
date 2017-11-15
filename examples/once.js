/* @flow */
import createPubChan from '../src/pubchan';

const chan = createPubChan();

// take the first event emitted then cancel ourselves
chan
  .subscribe()
  .to('$all')
  .once(
    (ref, ids, ...args) => {
      console.log(ids, args);
      return 'all';
    },
    () => console.log('Subscribed To Next Event Only'),
  );

console.log('Channel Size (Before Emit): ', chan.size);

// doesnt matter what we emit, collect all results
chan
  .emit(() => {}, 'foo', 'bar')
  .send('hello, world!')
  .then(() => {
    console.log('Channel Size (After Emit): ', chan.size);
    return chan.emit('foo', 'bar').send();
  })
  .then(() => chan.emit('foo', 'bar').send())
  .then(() => chan.emit('foo', 'bar').send())
  .then(() => console.log('DONE!'))
  .catch((err: Error) => console.error(err));

/*
  Subscribed To Next Event Only
  Channel Size (Before Emit):  1
  Set { [Function], 'foo', 'bar' } []
  Channel Size (After Emit):  0
  DONE!
*/

/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan from '../src/lib';

const chan = createPubChan();

getNativeAsyncCost().then(() => {
  // take the first event emitted then cancel ourselves
  chan
    .subscribe()
    .to('$all')
    .once(
      (ref, ids, ...args) => {
        log(ids, args);
        return 'all';
      },
      () => log('Subscribed To Next Event Only'),
    );

  log('Channel Size (Before Emit): ', chan.size);

  // doesnt matter what we emit, collect all results
  chan
    .emit(() => {}, 'foo', 'bar')
    .send('hello, world!')
    .then(() => {
      log('Channel Size (After Emit): ', chan.size);
      return chan.emit('foo', 'bar').send();
    })
    .then(() => chan.emit('foo', 'bar').send())
    .then(() => chan.emit('foo', 'bar').send())
    .then(() => log('DONE!'))
    .catch(log);
});

/*
  +77.4480   643250397.257147     Native Async Startup Complete (nextTick)
  +1.9965    643250399.25366      Subscribed To Next Event Only
  +0.1195    643250399.373183     Channel Size (Before Emit):  1
  +0.6107    643250399.983836     Set { [Function], 'foo', 'bar' } [ 'hello, world!' ]
  +1.7448    643250401.728625     Channel Size (After Emit):  0
  +0.1606    643250401.889194     DONE!
*/

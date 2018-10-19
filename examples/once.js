/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan, { SUBSCRIBE_ALL } from '../src/lib';

const chan = createPubChan();

getNativeAsyncCost().then(() => {
  // take the first event emitted then cancel ourselves
  chan
    .subscribe()
    .to(SUBSCRIBE_ALL)
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
  +0.0273    0.029353022575378418 Native Async Startup Complete (nextTick)
  +1.3789    1.4082820415496826   Subscribed To Next Event Only
  +0.2187    1.6269770860671997   Channel Size (Before Emit):  1
  +0.6850    2.31194806098938     Set { [Function], 'foo', 'bar' } [ 'hello, world!' ]
  +1.7004    4.012350082397461    Channel Size (After Emit):  0
  +0.0949    4.107290983200073    DONE!
*/

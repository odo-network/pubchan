/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan, { SUBSCRIBE_ALL, SUBSCRIBE_CLOSED } from '../src/lib';

const chan = createPubChan();

getNativeAsyncCost().then(() => {
  // subscribe to ALL events synchronously ($ prefix denotes a possible utility event)
  chan
    .subscribe()
    .to(SUBSCRIBE_ALL, SUBSCRIBE_CLOSED)
    .do((ref, ids) => {
      log('EVENTS EMITTED: ', ids);
      if (ids.has(SUBSCRIBE_CLOSED)) {
        // handle channel closure
        log('Channel Closed!');
      } else if (ref.chan.size === 2) {
        // when we are the only ones left, close the channel
        log('CLOSING CHANNEL!');
        ref.chan.close();
      }
      return '*';
    });

  // subscribe to 'foo' and 'bar' events asynchronously and add two different
  // callbacks which can be separately cancelled easily

  // subscription.cancel() / subscription.do() / subscription.to() / subscription.size
  // subscriptions can occur with anything since we use `Map` and `Set`
  // under the hood.
  const fn = () => {};

  const subscription = chan
    .subscribe({
      async: true,
    })
    .to('foo', 'bar', fn)
    .do((ref, ids, ...args) => {
      log('First Callback! ', args);
      if (ids.has('kill')) {
        // cancel the entire subscription
        ref.subscription.cancel();
        return 'killed';
      }
    })
    .do((ref, ids, ...args) => {
      log('Second Callback! ');
      if (ids.has('foo')) {
        // handle foo
      }
      if (ids.has('bar')) {
        // handle bar
        // cancel this callback only
        ref.cancel();
        return 'cancelled';
      }
    });
  // emit bar twice -- second callback will only happen twice but foo or bar
  // will happen both times.
  chan
    .emit('bar')
    .send()
    .then(results => {
      log('First Bar Emit Complete! ', results);
      // ['*', undefined, 'cancelled']
      return chan.emit('bar').send();
    })
    .then(results => {
      log('Second bar emit complete ', results);
      // ['*', undefined]
      // send 'foo' and 'kill' events with args 'one' and 'two'
      return chan.emit('foo', 'kill').send('one', 'two');
    })
    .then(results => {
      log('Subscription Killed!', results);
      // ['*', 'killed']
      return chan.emit('foo', 'bar', 'kill').send();
    })
    .then(results => {
      log('Only Match All is Left! ', results);
      // ['*']
    })
    .catch((err: Error) => {
      // handle any errors in the chain
      log(err);
    });
});

/*
  +0.0279    0.030407071113586426 Native Async Startup Complete (nextTick)
  +2.0495    2.079913020133972    EVENTS EMITTED:  Set { 'bar' }
  +1.4240    3.503882050514221    First Callback!  []
  +0.1238    3.6277220249176025   Second Callback!
  +0.2031    3.8308000564575195   First Bar Emit Complete!  { results: [ undefined, 'cancelled', '*' ] }
  +0.4129    4.243713974952698    EVENTS EMITTED:  Set { 'bar' }
  +0.0899    4.333595037460327    First Callback!  []
  +0.0775    4.411064982414246    Second bar emit complete  { results: [ undefined, '*' ] }
  +0.0832    4.49431300163269     EVENTS EMITTED:  Set { 'foo', 'kill' }
  +0.0532    4.5475040674209595   First Callback!  [ 'one', 'two' ]
  +0.1655    4.713003039360046    Subscription Killed! { results: [ 'killed', '*' ] }
  +0.0711    4.784131050109863    EVENTS EMITTED:  Set { 'foo', 'bar', 'kill' }
  +0.0414    4.825531005859375    CLOSING CHANNEL!
  +0.1345    4.960064053535461    Only Match All is Left!  { results: [ '*' ] }

  * without logging 1.616373062133789 elapsed
*/

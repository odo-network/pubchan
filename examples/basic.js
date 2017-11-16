/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan from '../src/pubchan';

const chan = createPubChan();

getNativeAsyncCost().then(() => {
  // subscribe to ALL events synchronously ($ prefix denotes a possible utility event)
  chan
    .subscribe()
    .to('$all', '$close')
    .do((ref, ids) => {
      log('EVENTS EMITTED: ', ids);
      if (ids.has('$closed')) {
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
  +80.1632   643061208.450215     Native Async Startup Complete (nextTick)
  +2.7730    643061211.223202     EVENTS EMITTED:  Set { 'bar' }
  +1.4177    643061212.640947     First Callback!  []
  +0.1248    643061212.7657       Second Callback!
  +0.1537    643061212.919436     First Bar Emit Complete!  { results: [ '*', undefined, 'cancelled' ] }
  +0.4205    643061213.339908     EVENTS EMITTED:  Set { 'bar' }
  +0.1175    643061213.457383     First Callback!  []
  +0.1044    643061213.561789     Second bar emit complete  { results: [ '*', undefined ] }
  +0.0951    643061213.656853     EVENTS EMITTED:  Set { 'foo', 'kill' }
  +0.0703    643061213.727182     First Callback!  [ 'one', 'two' ]
  +0.1683    643061213.895443     Subscription Killed! { results: [ '*', 'killed' ] }
  +0.2068    643061214.102226     EVENTS EMITTED:  Set { 'foo', 'bar', 'kill' }
  +0.0519    643061214.154099     CLOSING CHANNEL!
  +0.1657    643061214.319783     Only Match All is Left!  { results: [ '*' ] }
*/

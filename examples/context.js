/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan from '../src/lib';

const chan = createPubChan();

function executeSubscriptionWithContext(ref, ids) {
  console.log('Context of Subscription: ', this);
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
}

getNativeAsyncCost().then(() => {
  // we can use the "context" option to assign a context to
  // the "this" value of the executed function.  This can be useful
  // for performance reasons in some cases among other things.
  //
  // if no context is provided, "this" will refer to the subscriber.
  chan
    .subscribe({ context: { test: 'success!' } })
    .to('$all', '$close')
    .do(executeSubscriptionWithContext);

  chan
    .subscribe({
      async: true,
    })
    .context({ foo: 'bar' })
    .to('foo', 'bar')
    .do(function executeCallback(ref, ids, ...args) {
      console.log('Second Subscriber Context: ', this);
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
  Context of Subscription:  { test: 'success!' }
  +3.6202    3.6478689908981323   EVENTS EMITTED:  Set { 'bar' }
  Second Subscriber Context:  { foo: 'bar' }
  +0.4680    4.115891098976135    First Callback!  []
  +0.0927    4.208602070808411    Second Callback!
  +0.1909    4.399551033973694    First Bar Emit Complete!  { results: [ undefined, 'cancelled', '*' ] }
  Context of Subscription:  { test: 'success!' }
  +0.2909    4.690468072891235    EVENTS EMITTED:  Set { 'bar' }
  Second Subscriber Context:  { foo: 'bar' }
  +0.1135    4.803952097892761    First Callback!  []
  +0.0719    4.875884056091309    Second bar emit complete  { results: [ undefined, '*' ] }
  Context of Subscription:  { test: 'success!' }
  +0.1036    4.979479074478149    EVENTS EMITTED:  Set { 'foo', 'kill' }
  Second Subscriber Context:  { foo: 'bar' }
  +0.0756    5.055037021636963    First Callback!  [ 'one', 'two' ]
  +0.1394    5.194409012794495    Subscription Killed! { results: [ 'killed', '*' ] }
  Context of Subscription:  { test: 'success!' }
  +0.0981    5.292482018470764    EVENTS EMITTED:  Set { 'foo', 'bar', 'kill' }
  +0.0375    5.330029010772705    CLOSING CHANNEL!
  +0.1384    5.468391060829163    Only Match All is Left!  { results: [ '*' ] }
*/

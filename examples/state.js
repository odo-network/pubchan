/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan, { SUBSCRIBE_ALL } from '../src/lib';

getNativeAsyncCost().then(() => {
  const chan = createPubChan();

  type SubscriberState = {
    foo: string,
    i: number,
  };

  /*
    PubChan state provides a powerful co-routine like pattern for handling
    asynchronous state over multiple executions.

    State provides a a multi-layered approach where the emitter passes its
    state at each iteration to the subscriber which is then merged with the
    subscribers state
  */

  /*
    Subscriptions receive a merged state from the emitter and their own
    state object which is maintained throughout executions.
  */
  chan
    .subscribe()
    .to(SUBSCRIBE_ALL)
    .do(
      (ref, ids) => {
        const { state }: { state: SubscriberState } = ref;
        state.i += 1;
        log('Subscriber: ', ids, state, state.i);
        return state.i;
      },
      // Use the onComplete handler to instantiate our state
      ref => {
        const { state }: { state: SubscriberState } = ref;
        state.i = 0;
        log('Subscriber Initial State: ', state);
      },
    );

  /*
    Emitters can maintain state throughout multiple calls which it
    passes back to all the subscribers.  While the subscribers receive
    any updated state from the emitter, the mutations done locally are not
    passed to the emitter (that should be done with a standard return).
  */
  chan
    .emit('start')
    .send('hello, world!')
    .then(ref => chan
      .emit('foo')
      .state(ref.state, { foo: 'foo!' })
      .send())
    .then(ref => chan
      .emit('bar')
      .state(ref.state, { foo: 'bar!', do: 2 })
      .send())
    .then(ref => chan
      .emit('baz')
      .state(ref.state, { foo: 'baz!', yeah: 'ok' })
      .send())
    .then(ref => log('EMITTER DONE! ', ref.state))
    .catch(log);

  /*
    If we wanted to aggregate and use the responses received from
    subscribers then we need to parse the results property
  */

  log('-----  NEXT! ----');

  type SubscriberStateTwo = {
    agg: Set<*>,
  };

  chan
    .emit('start')
    .state({ agg: new Set() })
    .send('hello, world!')
    .then(ref => chan
      .emit('foo')
      .state(ref.state, (state: SubscriberStateTwo) => {
        log('State Resolve: ', state);
        state.agg.add(ref.results);
      })
      .send())
    .then(ref => chan
      .emit('bar')
      .state(ref.state, (state: SubscriberStateTwo) => {
        log('State Resolve: ', state);
        state.agg.add(ref.results);
      })
      .send())
    .then(ref => chan
      .emit('baz')
      .state(ref.state, (state: SubscriberStateTwo) => {
        log('State Resolve: ', state);
        state.agg.add(ref.results);
      })
      .send())
    .then(ref => log('EMITTER DONE! ', ref.state))
    // .then(() => {
    //   console.log(log());
    // })
    .catch(log);
});

/*
  Since we utilize proxies here, it shows undefined when printed.  However,
  the values are there when used.

  +0.0242    0.02708899974822998  Native Async Startup Complete (nextTick)
  +1.5734    1.6004819869995117   Subscriber Initial State:  { i: 0 }
  +1.8394    3.439889907836914    Subscriber:  Set { 'start' } { i: 1 } 1
  +0.4873    3.9272348880767822   -----  NEXT! ----
  +0.3422    4.269402980804443    Subscriber:  Set { 'start' } { i: undefined, agg: undefined } 2
  +0.7294    4.998785972595215    Subscriber:  Set { 'foo' } { i: undefined, foo: undefined } 3
  +0.1763    5.175038933753967    State Resolve:  { agg: Set {} }
  +0.0722    5.247215986251831    Subscriber:  Set { 'foo' } { i: undefined, agg: undefined } 4
  +0.1560    5.403232932090759    Subscriber:  Set { 'bar' } { i: undefined, foo: undefined, do: undefined } 5
  +0.1477    5.5508869886398315   State Resolve:  { agg: Set { [ 2 ] } }
  +0.2071    5.7579768896102905   Subscriber:  Set { 'bar' } { i: undefined, agg: undefined } 6
  +0.1524    5.910362958908081    Subscriber:  Set { 'baz' } { i: undefined, foo: undefined, do: undefined, yeah: undefined } 7
  +0.1449    6.055239915847778    State Resolve:  { agg: Set { [ 2 ], [ 4 ] } }
  +0.0824    6.1376529932022095   Subscriber:  Set { 'baz' } { i: undefined, agg: undefined } 8
  +0.1101    6.247737884521484    EMITTER DONE!  { foo: 'baz!', do: 2, yeah: 'ok' }
  +0.0693    6.317052960395813    EMITTER DONE!  { agg: Set { [ 2 ], [ 4 ], [ 6 ] } }

  * without logs  elapsed 1.870985984802246
*/

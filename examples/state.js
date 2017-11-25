/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan from '../src/lib';

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
    .to('$all')
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
    .then(ref =>
      chan
        .emit('foo')
        .state(ref.state, { foo: 'foo!' })
        .send())
    .then(ref =>
      chan
        .emit('bar')
        .state(ref.state, { foo: 'bar!', do: 2 })
        .send())
    .then(ref =>
      chan
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
    .then(ref =>
      chan
        .emit('foo')
        .state(ref.state, (state: SubscriberStateTwo) => {
          log('State Resolve: ', state);
          state.agg.add(ref.results);
        })
        .send())
    .then(ref =>
      chan
        .emit('bar')
        .state(ref.state, (state: SubscriberStateTwo) => {
          log('State Resolve: ', state);
          state.agg.add(ref.results);
        })
        .send())
    .then(ref =>
      chan
        .emit('baz')
        .state(ref.state, (state: SubscriberStateTwo) => {
          log('State Resolve: ', state);
          state.agg.add(ref.results);
        })
        .send())
    .then(ref => log('EMITTER DONE! ', ref.state))
    .catch(log);
});

/*
  Since we utilize proxies here, it shows undefined when printed.  However,
  the values are there when used.

  +88.2339   643619209.475025     Native Async Startup Complete (nextTick)
  +2.2407    643619211.715686     Subscriber Initial State:  { i: 0 }
  +1.8317    643619213.547336     Subscriber:  Set { 'start' } { i: 1 } 1
  +0.4563    643619214.003648     -----  NEXT! ----
  +0.4310    643619214.434643     Subscriber:  Set { 'start' } { i: undefined, agg: undefined } 2
  +0.6043    643619215.038928     Subscriber:  Set { 'foo' } { i: undefined, foo: undefined } 3
  +0.1830    643619215.221915     State Resolve:  { agg: Set {} }
  +0.0806    643619215.3025       Subscriber:  Set { 'foo' } { i: undefined, agg: undefined } 4
  +0.1633    643619215.465842     Subscriber:  Set { 'bar' } { i: undefined, foo: undefined, do: undefined } 5
  +0.1749    643619215.64076      State Resolve:  { agg: Set { [ 2 ] } }
  +0.4767    643619216.117493     Subscriber:  Set { 'bar' } { i: undefined, agg: undefined } 6
  +0.1732    643619216.290665     Subscriber:  Set { 'baz' } { i: undefined, foo: undefined, do: undefined, yeah: undefined } 7
  +0.1768    643619216.467503     State Resolve:  { agg: Set { [ 2 ], [ 4 ] } }
  +0.1091    643619216.576652     Subscriber:  Set { 'baz' } { i: undefined, agg: undefined } 8
  +0.1002    643619216.676898     EMITTER DONE!  { foo: 'baz!', do: 2, yeah: 'ok' }
  +0.0762    643619216.753115     EMITTER DONE!  { agg: Set { [ 2 ], [ 4 ], [ 6 ] } }
*/

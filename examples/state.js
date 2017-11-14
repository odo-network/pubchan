/* @flow */
import createPubChan from '../src';

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
      console.log(ref);
      console.log('Subscriber: ', ids, state, state.i);
      return state.i;
    },
    // Use the onComplete handler to instantiate our state
    ref => {
      const { state }: { state: SubscriberState } = ref;
      state.i = 0;
      console.log('Subscriber Initial State: ', state);
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
  .then(ref => console.log('EMITTER DONE! ', ref.state))
  .catch((err: Error) => console.error(err));

/*
  Subscriber Initial State:  { i: 0 }
  Subscriber:  Set { 'start' } { i: 1 }
  Subscriber:  Set { 'foo' } { i: 2, foo: 'foo!' }
  Subscriber:  Set { 'bar' } { i: 3, foo: 'bar!' }
  Subscriber:  Set { 'baz' } { i: 4, foo: 'baz!', yeah: 'ok' }
  EMITTER DONE!  { foo: 'baz!', yeah: 'ok' }
*/

/*
  If we wanted to aggregate and use the responses received from
  subscribers then we need to parse the results property
*/

console.log('-----  NEXT! ----');

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
        console.log('State Resolve: ', state);
        state.agg.add(ref.results);
      })
      .send())
  .then(ref =>
    chan
      .emit('bar')
      .state(ref.state, (state: SubscriberStateTwo) => {
        console.log('State Resolve: ', state);
        state.agg.add(ref.results);
      })
      .send())
  .then(ref =>
    chan
      .emit('baz')
      .state(ref.state, (state: SubscriberStateTwo) => {
        console.log('State Resolve: ', state);
        state.agg.add(ref.results);
      })
      .send())
  .then(ref => console.log('EMITTER DONE! ', ref.state))
  .catch((err: Error) => console.error(err));

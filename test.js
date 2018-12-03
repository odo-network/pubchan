/* @flow */
import {
  SUBSCRIBE_ALL,
  SUBSCRIBE_SUBSCRIBERS_ADDED,
  SUBSCRIBE_SUBSCRIBERS_REMOVED,
} from './src/lib';

import registry from './src/registry';

const chan = registry.get(Symbol.for('@test'));

process.nextTick(() => {
  console.log('Next Tick');
});
chan
  .subscribe()
  .to(SUBSCRIBE_ALL, SUBSCRIBE_SUBSCRIBERS_ADDED)
  .do((ref, ids, subscriber, event) => {
    console.log('Subscribers Added!: ', subscriber.keys);
    ref.cancel();
  });

chan
  .subscribe()
  .to(SUBSCRIBE_SUBSCRIBERS_REMOVED)
  .do((ref, ids, subscriber, event) => {
    console.log('Subscriber Removed! ', subscriber.keys);
  });

chan
  .subscribe()
  .to(SUBSCRIBE_ALL)
  .do((ref, ids) => {
    console.log('Subscribe All Executes: ', ids);
  });

// const sub = chan
//   .subscribe({ async: true })
//   .to('test')
//   .do((...args) => {
//     console.log('Do One! ');
//   })
//   .do((ref, ...args) => {
//     console.log('Test Received');
//     sub.cancel();
//   });

// const sub2 = chan
//   .subscribe()
//   .to('test')
//   .do(() => {
//     console.log('DO 3!');
//   });

chan
  .broadcast()
  .send('one')
  .then(() => {
    console.log('Broadcast Next');
    chan.broadcast().send('two');
  });

// console.log('hi');

// import { frozenSet } from "./src/lib/utils/freeze";

// const set = new Set([1, 2, 3]);

// const frozen = frozenSet(set);

// Set.prototype.add.call(frozen);

// // console.log(frozen);

/* @flow */

// import registry from './src/registry';

// const chan = registry.get(Symbol.for('@test'));

// process.nextTick(() => {
//   console.log('Next Tick');
// });

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

// chan
//   .broadcast()
//   .send('one')
//   .then(() => {
//     console.log('Broadcast Next');
//     chan.broadcast().send('two');
//   });

// console.log('hi');

// import { frozenSet } from "./src/lib/utils/freeze";

// const set = new Set([1, 2, 3]);

// const frozen = frozenSet(set);

// Set.prototype.add.call(frozen);

// // console.log(frozen);

// /* @flow */
// import { performance } from 'perf_hooks';
// import psjs from 'pubsub-js';
//
// import { log, getNativeAsyncCost } from '../../utils/log';
//
// import createPubChan from '../../src/pubchan';
//
// const ITERATIONS = 1000;
//
// async function comparisonBenchmark() {
//   log('Start Benchmark');
//   let i = 0;
//   const results = {
//     psjs: [],
//     pchan: [],
//     nipubsub: [],
//     ee3: [],
//   };
//
//   pchanSetup();
//
//   const promises = [];
//
//   while (i < ITERATIONS) {
//     i += 1;
//     // eslint-ignore-next-line
//     promises.push(collectResults(results));
//   }
//
//   await Promise.all(promises);
//
//   const averages = {};
//   for (const pkg of Object.keys(results)) {
//     averages[pkg] =
//       results[pkg].length > 0 &&
//       results[pkg].reduce((t, n) => t + n) / results[pkg].length;
//   }
//
//   log('-- Complete --');
//   log(averages);
// }
//
// async function collectResults(results) {
//   let start;
//
//   start = performance.now();
//   await niPubSubTest();
//   results.nipubsub.push(performance.now() - start);
//
//   start = performance.now();
//   await ee3Test();
//   results.ee3.push(performance.now() - start);
//
//   start = performance.now();
//   await psjsTest();
//   results.psjs.push(performance.now() - start);
//
//   start = performance.now();
//   await pchanTest();
//   results.pchan.push(performance.now() - start);
//
//   start = performance.now();
//   await psjsTest();
//   results.psjs.push(performance.now() - start);
//
//   start = performance.now();
//   await pchanTest();
//   results.pchan.push(performance.now() - start);
//
//   start = performance.now();
//   await niPubSubTest();
//   results.nipubsub.push(performance.now() - start);
//
//   start = performance.now();
//   await ee3Test();
//   results.ee3.push(performance.now() - start);
// }
//
// function psjsTest() {
//   return new Promise(resolve => {
//     // create a function to subscribe to topics
//     const token = psjs.subscribe('foo', () => {
//       psjs.unsubscribe(token);
//       resolve();
//     });
//
//     // publish a topic asyncronously
//     psjs.publish('foo');
//   });
// }
// // let chan;
//
// function pchanSetup() {
//   // chan = createPubChan();
//   //
//   // chan
//   //   .subscribe()
//   //   // .subscribe({ async: true })
//   //   .to('foo')
//   //   .do((ref, ids, resolve) => {
//   //     resolve();
//   //   });
// }
//
// function pchanTest() {
//   return new Promise(resolve => {
//     const chan = createPubChan();
//
//     chan
//       .subscribe()
//       // .subscribe({ async: true })
//       .to('foo')
//       .do((ref, ids, r) => {
//         chan.close();
//         r();
//       });
//
//     chan.emit('foo').send(resolve);
//   });
// }
//
// function niPubSubTest() {
//   return new Promise(resolve => {
//     const pub = nipubsub.createPublisher();
//     const sub = nipubsub.createSubscriber();
//
//     sub.subscribe('foo');
//
//     sub.on('message', channel => {
//       if (channel === 'foo') {
//         sub.unsubscribe('foo');
//         resolve();
//       }
//     });
//
//     pub.publish('foo');
//     // console.log('Done');
//   });
// }
//
// function ee3Test() {
//   return new Promise(resolve => {
//     const emitter = new ee3();
//
//     emitter.on('foo', () => {
//       // emitter.removeAllListeners('foo');
//       resolve();
//     });
//
//     emitter.emit('foo');
//   });
// }
//
// getNativeAsyncCost()
//   .then(() => comparisonBenchmark())
//   .then(() => {
//     log('Comparison Benchmark Complete');
//   });

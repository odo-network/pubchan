/* @flow */

import { log, getNativeAsyncCost } from '../../utils/log';

import createPubChan from '../../src/pubchan';

const chan = createPubChan();

log('Benchmark Starting');
log('------------------');
/*
  To see how fast the package is at handling callbacks, we will run
  a few perf tests.

  Each call to log() will provide the ms since the last execution of log()
  so we can determine perf properly.

  This uses performance.now() from 'perf_hooks' (see utils/log);
*/

/*
  We call getNativeAsyncCost() because the first call to any timer has a
  general delay of 70ms+- which does not occur for future executions.
*/

getNativeAsyncCost().then(() => {
  log('Start PubChan');

  chan
    .subscribe({ async: true })
    .to('foo')
    .do(() => {
      log('Do Foo!');
    });

  chan
    .emit('foo')
    .send()
    .then(() => {
      log('Foo Emission Complete!');
      return chan
        .emit('foo')
        .send()
        .then(() => {
          log('Foo Emission Complete!');
        });
    });

  log('Finished Evaluation');
});

/*
  +82.4602   623688945.926412     Native Async Startup Complete (nextTick)
  +0.4504    623688946.376778     Start Perf Tests
  +107.5361  623689053.912922     Chan Size:  10000
  +53.2608   623689107.173682     Finished Evaluation
  +232.0740  623689339.247657     Foo Emission Complete!
*/

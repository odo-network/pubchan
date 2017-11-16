/* @flow */

import { log, getNativeAsyncCost } from '../../utils/log';

import createPubChan from '../../src/pubchan';

const chan = createPubChan();

async function asyncFn(str: string) {
  return str;
}

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
const SUBSCRIPTIONS = 10000;

getNativeAsyncCost().then(() => {
  let i = 0;

  log(`Creating ${SUBSCRIPTIONS} subscriptions`);
  while (i < SUBSCRIPTIONS) {
    i += 1;
    chan
      .subscribe({ async: true })
      .to('foo')
      .do(() => asyncFn('foo'));
  }
  log('Complete, Chan Size: ', chan.sizeof());

  chan
    .emit('foo')
    .send()
    .then(() => {
      log('Foo Emission Complete!');
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

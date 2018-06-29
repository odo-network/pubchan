/* @flow */

import { log, getNativeAsyncCost } from '../../utils/log';

import createPubChan from '../../src/lib';

const chan = createPubChan();
let executed = 0;

function execFn() {
  executed += 1;
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
const SUBSCRIPTIONS = 100000;

getNativeAsyncCost().then(() => {
  log(`Creating ${SUBSCRIPTIONS} subscriptions`);
  for (let i = 0; i < SUBSCRIPTIONS; i += 1) {
    chan
      .subscribe()
      .to('foo')
      .do(execFn);
  }

  log('Complete, Chan Size: ', chan.sizeof());

  chan
    .emit('foo')
    .send()
    .then(() => {
      console.log(log('Foo Emission Complete! Total Executed:', executed));
    });

  log('Finished Evaluation ');
});

/*
  +0.0412    0.044035911560058594 Native Async Startup Complete (nextTick)
  +1.3510    1.3950549364089966   Creating 100000 subscriptions
  +144.2231  145.6181799173355    Complete, Chan Size:  100000
  +44.3813   189.99945294857025   Finished Evaluation
  +0.3499    190.34939897060394   Foo Emission Complete! Total Executed: 100000
*/

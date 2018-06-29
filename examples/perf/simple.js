/* @flow */

import { log, getNativeAsyncCost } from '../../utils/log';

import createPubChan from '../../src/lib';

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
      return chan.emit('foo').send();
    })
    .then(() => {
      log('Foo Emission Complete!');
    });

  log('Finished Evaluation');
});

/*
  +5.4829    NaN                  Benchmark Starting
  +1.1150    NaN                  ------------------
  +0.0010    0.0033990144729614258 Native Async Startup Complete (nextTick)
  +0.1930    0.19638299942016602  Start PubChan
  +0.8684    1.064805030822754    Finished Evaluation
  +0.1940    1.2587599754333496   Do Foo!
  +0.1631    1.4218770265579224   Foo Emission Complete!
  +0.1041    1.5260149240493774   Do Foo!
  +0.0581    1.5840959548950195   Foo Emission Complete!
*/

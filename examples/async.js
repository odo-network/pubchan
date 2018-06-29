/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan from '../src/lib';

const chan = createPubChan();

async function asyncFn(str: string) {
  log('Whoop Whoop! ', str);
  return str;
}

async function collectResults() {
  log('Emitting Foo and Bar!');
  const ref = await chan.emit('bar', 'foo').send();
  const { results } = ref;
  if (Array.isArray(results)) {
    for (const res of results) {
      log('Result: ', res);
    }
  }
}

// we do this because the first call to nextTick is
// fairly slow.  This way we can get real-world perf
// results in our log.
getNativeAsyncCost().then(() => {
  log('Start Eval');

  chan
    .subscribe({ async: true })
    .to('foo')
    .do(() => {
      log('Foo Event');
      return asyncFn('foo');
    });

  chan
    .subscribe({ async: true })
    .to('bar')
    .do(() => {
      log('Bar Event');
      return asyncFn('bar');
    });

  log('Start Emit Foo and Bar (One)');

  chan
    .emit('foo')
    .send()
    .then(ref => {
      log('Foo Emission Complete! ', ref.results);
      log('Start Emission Two');
      return collectResults();
    })
    .then(() => {
      log('Async Example Completed!');
    });

  log('Finished Evaluation');
});

/*
  +0.0244    0.02683401107788086  Native Async Startup Complete (nextTick)
  +1.2221    1.2489420175552368   Start Eval
  +0.3480    1.5969619750976562   Start Emit Foo and Bar (One)
  +0.6564    2.2533990144729614   Finished Evaluation
  +0.1929    2.4462499618530273   Foo Event
  +0.0678    2.5140780210494995   Whoop Whoop!  foo
  +0.1886    2.7026339769363403   Foo Emission Complete!  [ 'foo' ]
  +1.2398    3.9424320459365845   Start Emission Two
  +0.1058    4.048208951950073    Emitting Foo and Bar!
  +0.1607    4.208904981613159    Bar Event
  +0.2113    4.420217037200928    Whoop Whoop!  bar
  +0.0388    4.459033012390137    Foo Event
  +0.0270    4.4860600233078      Whoop Whoop!  foo
  +0.0497    4.535755038261414    Result:  bar
  +0.0293    4.565060019493103    Result:  foo
  +0.0452    4.610306024551392    Async Example Completed!

  * without logging 1.3370959758758545 elapsed
*/

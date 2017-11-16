/* @flow */
import { log, getNativeAsyncCost } from '../utils/log';
import createPubChan from '../src/pubchan';

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
  +82.9568   642915961.83317      Native Async Startup Complete (nextTick)
  +2.3002    642915964.133401     Start Eval
  +0.4702    642915964.603646     Start Emit Foo and Bar (One)
  +0.7098    642915965.31349      Finished Evaluation
  +0.2909    642915965.604393     Foo Event
  +0.0973    642915965.701646     Whoop Whoop!  foo
  +0.1142    642915965.815873     Foo Emission Complete!  [ 'foo' ]
  +1.4834    642915967.299288     Start Emission Two
  +0.1378    642915967.437076     Emitting Foo and Bar!
  +0.1502    642915967.58732      Bar Event
  +0.0424    642915967.629693     Whoop Whoop!  bar
  +0.0344    642915967.664084     Foo Event
  +0.0245    642915967.688548     Whoop Whoop!  foo
  +0.1599    642915967.848444     Result:  bar
  +0.0337    642915967.882132     Result:  foo
  +0.0561    642915967.938207     Async Example Completed!
*/

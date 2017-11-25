/* @flow */
import { log, getNativeAsyncCost } from '../../utils/log';
import createPubChan from '../../src/lib';
import addWildcardMiddleware from '../../src/middleware/wildcard';

const chan = createPubChan();
addWildcardMiddleware(chan);

let i = 0;

const COUNT = 100000;

getNativeAsyncCost().then(() => {
  // subscribe to ALL events synchronously ($ prefix denotes a possible utility event)
  const START = log('Building ', COUNT, ' subscriptions');
  while (i < COUNT) {
    chan
      .subscribe()
      .to('foo*', i)
      .do(() => {
        i += 1;
      });
    i += 1;
  }
  log('Done Building Subscriptions');

  // emit bar twice -- second callback will only happen twice but foo or bar
  // will happen both times.

  log('Start Emit: foo:one:two');

  // chan.emitAsync(['foo:one:two']).then(() => {
  //   const END = log('foo:one:two emitted ', i);
  //   console.log('Total Duration: ', END - START);
  // });
  //
  // log('Start Emit: foo:one:two');
  // chan.emitAsync(['foo:one:two']).then(() => {
  //   const END = log('foo:one:two emitted ', i);
  //   console.log('Total Duration: ', END - START);
  // });

  chan
    .emit({ foobar: 'baz' })
    .send()
    .then(() => {
      const END = log('foo:one:two emitted ', i);
      console.log('Total Duration: ', END - START);
    });

  log('Done Emitting ', i);
});

/*
  +20.8719   1302312840.907464    Native Async Startup Complete (nextTick)
  +2.0461    1302312842.953525    Start Emit: foo:one:two
  +1.2032    1302312844.156684    Start Emit: bar:baz:foo
  +0.2287    1302312844.385417    Start Emit: bar:foo:baz
  +0.1546    1302312844.540045    bar:baz:foo emitted  { results: null }
  +1.1055    1302312845.645554    FOO!  Set { 'foo:one:two' }
  +0.3088    1302312845.954383    FOO!  Set { 'bar:baz:foo' }
  +0.1206    1302312846.074949    foo:one:two emitted  { results: [ 1302312845.645554 ] }
  +0.2767    1302312846.351611    bar:baz:foo emitted  { results: [ 1302312845.954383 ] }
*/

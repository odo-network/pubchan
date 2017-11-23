/* @flow */
import { log, getNativeAsyncCost } from '../../utils/log';
import createPubChan from '../../src/pubchan';
import addWildcardMiddleware from '../../src/middleware/wildcard';

const chan = createPubChan();
addWildcardMiddleware(chan);

getNativeAsyncCost().then(() => {
  // subscribe to ALL events synchronously ($ prefix denotes a possible utility event)
  chan
    .subscribe()
    .to('foo:*', '*foo')
    .do((ref, ids) => log('FOO! ', ids));

  // emit bar twice -- second callback will only happen twice but foo or bar
  // will happen both times.

  log('Start Emit: foo:one:two');

  chan
    .emit('foo:one:two')
    .send()
    .then(results => {
      log('foo:one:two emitted ', results);
    });

  log('Start Emit: bar:baz:foo');

  chan
    .emit('bar:baz:foo')
    .send()
    .then(results => {
      log('bar:baz:foo emitted ', results);
    });

  log('Start Emit: bar:foo:baz');

  chan
    .emit('bar:foo:baz')
    .send()
    .then(results => {
      log('bar:baz:foo emitted ', results);
    });
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

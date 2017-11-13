# pubchan

Simple yet powerful pub/sub channels for Javascript and Node.js.  

Tiny, fast, type-safe, reliable pubsub event emitter with promises, result aggregation, and async/sync controls.  

## Install

```
yarn add pubchan
```

**or**

```
npm install --save pubchan
```

## 100% Flow Coverage

Proudly built with 100% Flow Coverage and exported .flow.js files so your flow
projects will benefit!

## Example

### Simple

```js
import createPubChan from 'pubchan';
const chan = createPubChan();

chan.subscribe('foo').do(() => console.log('foo 1!'))
chan.subscribe('foo').do(() => console.log('foo 2!'))

chan.emit('foo').send().then(() => console.log('Finished Emitting foo!'));
```

### Basic Example

```js
import createPubChan from 'pubchan';

const chan = createPubChan();

// subscribe to ALL events synchronously ($ prefix denotes a possible utility event)
chan
  .subscribe()
  .to('$all', '$close')
  .do((ref, ids) => {
    console.log('EVENTS EMITTED: ', ids);
    if (ids.has('$closed')) {
      // handle channel closure
      console.log('Channel Closed!')
    } else {
      if (ref.chan.size === 2) {
        // when we are the only ones left, close the channel
        console.log('CLOSING CHANNEL!');
        ref.chan.close();
      }  
    }
    return '*';
  });

// subscribe to 'foo' and 'bar' events asynchronously and add two different
// callbacks which can be separately cancelled easily

// subscription.cancel() / subscription.do() / subscription.to() / subscription.size
const subscription = chan
  .subscribe({
    async: true,
  })
  .to('foo', 'bar')
  .do((ref, ids, ...args) => {
    console.log('First Callback! ');
    if (ids.has('kill')) {
      // cancel the entire subscription
      ref.subscription.cancel();
      return 'killed';
    }
  })
  .do((ref, ids, ...args) => {
    console.log('Second Callback! ');
    if (ids.has('foo')) {
      // handle foo
    }
    if (ids.has('bar')) {
      // handle bar
      // cancel this callback only
      ref.cancel();
      return 'cancelled';
    }
  });


// emit bar twice -- second callback will only happen twice but foo or bar
// will happen both times.  
chan
  .emit('bar')
  .send()
  .then(results => {
    console.log('First Bar Emit Complete! ', results);
    // ['*', undefined, 'cancelled']
    return chan.emit('bar').send();
  })
  .then(results => {
    console.log('Second bar emit complete ', results);
    // ['*', undefined]
    // send 'foo' and 'kill' events with args 'one' and 'two'
    return chan.emit('foo', 'kill').with('one', 'two').send()
  })
  .then(results => {
    console.log('Subscription Killed!', results)
    // ['*', 'killed']
    return chan.emit('foo', 'bar', 'kill').send();
  })
  .then(results => {
    console.log('Only Match All is Left! ', results)
    // ['*']
  })
  .catch(err => {
    // handle any errors in the chain
  });


```

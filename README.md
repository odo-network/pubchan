# pubchan

Simple yet powerful pub/sub channels for Javascript and Node.js.  

## Install

```
yarn add pubchan
```

**or**

```
npm install --save pubchan
```

## Example

```js
import createPubChan from 'pubchan';

const chan = createPubChan();

// subscribe to ALL events synchronously (* is only used in this one case)
chan
  .subscribe()
  .to('*')
  .do((ref, ids) => {
    console.log('EVENT EMITTED: ', ids);
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

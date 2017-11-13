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

We strongly recommend you look over the [types](https://github.com/Dash-OS/pubchan/tree/master/src/types) folder.  This will give you an idea of how the various pieces of the package work.  

## Example

### Simple

```js
/* @flow */

import createPubChan from 'pubchan';

const chan = createPubChan();

chan
  .subscribe({ async: true })
  .to('foo')
  .do(() => console.log('foo 1!'));

chan
  .subscribe()
  .to('foo')
  .do(() => console.log('foo 2!'));

chan
  .emit('foo')
  .send()
  .then(() => console.log('Finished Emitting foo!'));

/*
  // Console Output -->
  foo 2!
  foo 1!
  Finished Emitting foo!
*/
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

## API Reference

> **Note:** This is currently a work in progress.  The API is quite simple and can be understood by looking at our [types](https://github.com/Dash-OS/pubchan/tree/master/src/types) files as this packages has 100% flowtype coverage.

### Module Exports

#### createPubChan (Function) (default)

Our default export, creates an instance of `PubChan`.

```js
import createPubChan from 'pubchan'
const chan = createPubChan()
```

#### PubChan (Class)

Generally using the `createPubChan` function is the recommended method of creating a new channel.  However, you can also import the class directly if needed (can be useful for adding as flow type).

```js
import { PubChan } from 'pubchan'
const chan = new PubChan()
```

#### Subscriber (Class)

This should have no use other than possibly to use for flow-types.  A subscriber is useless unless created by an interface which matches the `PubChan`.

```js
/* @flow */
import type { Subscriber } from 'pubchan'
```

## `PubChan`

Below is a normalized version of the `PubChan` class which should provide the structure of the instance returned by our `createPubChan` factory.

```js
declare class PubChan {
  pipeline: {
    emit: Set<mixed>,
    matches: Set<Subscriber>,
    with: Array<mixed>,
  },
  +listeners: Map<mixed, Set<Subscriber>>,
  +subscribers: Set<Subscriber>,
  // how many total active subscribers do we have?
  get length(): number,
  get size(): number,
  emit: (...args: Array<Array<mixed> | mixed>) => this,
  // include args with the event emission
  with: (...args: Array<any>) => this,
  // send the event and optionally include args to the handlers.
  send: (...args: Array<any>) => Promise<null> | Promise<Array<any>>,
  close: (...args: Array<any>) => Promise<null> | Promise<Array<any>>,
  subscribe: (
    options?: $Shape<{|
      async: boolean,
    |}>,
  ) => Subscriber,
}
```

## `Subscriber`

`Subscriber` instances are returned by a call to `.subscribe()` on our `PubChan` instance.  

```js
declare type PubChan$EmitID = mixed;

type Callback = (
  ref: PubChan$Ref,
  ids: Set<PubChan$EmitID>,
  ...args: Array<mixed>
) => Array<mixed> | mixed;

declare type PubChan$Callback = Array<Callback> | Callback;

// called immediately after creating the subscription (not when the
// subscription is cancelled)
declare type PubChan$CompleteCallback = (ref: PubChan$Ref) => mixed;

declare interface PubChan$Ref {
  +once?: void | boolean,
  +id?: PubChan$EmitID,
  +state: { [key: string]: * },
  +subscription: Subscriber,
  +chan: PubChan,
  +callback: PubChan$Callback,
  +cancel: () => void,
}

declare class Subscriber {
  get length(): number,
  get size(): number,
  // all the ids we are subscribed to
  get keys(): Array<PubChan$EmitID>,

  to: (...args: Array<PubChan$EmitIDs>) => this,

  // add a callback that will happen once then cancel itself
  once: (
    callback: PubChan$Callback,
    onComplete?: PubChan$CompleteCallback,
  ) => this,

  // add a callback when this event occurs
  do: (
    callback: PubChan$Callback,
    onComplete?: PubChan$CompleteCallback,
  ) => this,

  // cancel the entire subscriber
  cancel: () => void,
}
```

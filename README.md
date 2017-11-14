# pubchan

Simple yet powerful pub/sub channels for Javascript and Node.js.  

Tiny, fast, and reliable pubsub event emitter with promises, optional result aggregation (state), and async/sync controls.  

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

// trigger asynchronously whenever foo is received
chan
  .subscribe({ async: true })
  .to('foo')
  .do(() => console.log('foo 1!'));

// trigger once synchronously then cancel
chan
  .subscribe()
  .to('foo')
  .once(() => console.log('foo 2!'));

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

### More Examples

For more examples you can check out the [examples directory](https://github.com/Dash-OS/pubchan/tree/master/examples)

---

## API Reference

> **Note:** This is currently a work in progress.  The API is quite simple and can be understood by looking at our [types](https://github.com/Dash-OS/pubchan/tree/master/src/types) files as this packages has 100% flowtype coverage.

### Module Exports

#### `createPubChan` (Function) (default)

Our default export, creates an instance of `PubChan`.

```js
import createPubChan from 'pubchan'
const chan = createPubChan()
```

#### `PubChan` (Class)

Generally using the `createPubChan` function is the recommended method of creating a new channel.  However, you can also import the class directly if needed (can be useful for adding as flow type).

```js
import { PubChan } from 'pubchan'
const chan = new PubChan()
```

#### `Subscriber` (Class)

This should have no use other than possibly to use for flow-types.  A subscriber is useless unless created by an interface which matches the `PubChan`.

```js
/* @flow */
import type { Subscriber } from 'pubchan'
```

---

### Registry Exports

#### `getPubChan` (Function) (default)

Gets a `PubChan` with a given `id` which can be any type that can be a key on a `Map`.  If the `id` already exists then it returns that `PubChan` instead of creating a new one.

`PubChan`'s that are created from the registry automatically subscribe to `$closed` events to clean themselves up when you close the channel from anywhere in the app.

```js
import getPubChan from 'pubchan/registry'
const chan = getPubChan('mychan');
```

#### `hasPubChan` (Function)

Check if a given PubChan exists within the registry.

```js
import { hasPubChan } from 'pubchan/registry'
if (hasPubChan('mychan')) {
  // ...
}
```

---

## `PubChan`

Below is a normalized version of the `PubChan` class's public interface which should provide the structure of the instance returned by our `createPubChan` factory.

```js
declare class PubChan {
  // how many total active subscribers do we have?
  get length(): number,
  get size(): number,

  emit: (...args: Array<Array<mixed> | mixed>) => this,

  // include args with the event emission
  with: (...args: Array<any>) => this,

  // include state with the event for chained emissions
  state = (...args: Array<?{ [key: string]: any }>) => this,

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
  // total number of active callbacks on the subscriber
  get length(): number,
  get size(): number,

  // all the ids we are subscribed to
  get keys(): Array<PubChan$EmitID>,

  // subscribe to EmitIDS
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

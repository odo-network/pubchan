# pubchan

Simple yet powerful async pub/sub channels for Javascript and Node.js with zero
dependencies.

Tiny, fast, and reliable pubsub event emitter with promises, optional result
aggregation (state), and async/sync controls.

Used in production to coordinate & route millions of events within our
proprietary Datastream Realtime Event Protocol.

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

We strongly recommend you look over the
[types](https://github.com/Dash-OS/pubchan/tree/master/src/pubchan/types)
folder. This will give you an idea of how the various pieces of the package
work.

## Tests

This library was taken out of our broad library used for our internal DRE
Protocol. While it has 100% Test Coverage there, we have not yet built
standalone tests for this library.

We plan to add coverage for it when time permits. In the meantime, it does
maintain it's 100% type coverage.

> Pull requests are more than welcome if you happen to have the time to
> contribute!

## Example

### Simple

```js
/* @flow */

import createPubChan from "pubchan";

const chan = createPubChan();

// trigger asynchronously whenever foo is received
chan
  .subscribe({ async: true })
  .to("foo")
  .do(() => console.log("foo 1!"));

// trigger once synchronously then cancel
chan
  .subscribe()
  .to("foo")
  .once(() => console.log("foo 2!"));

chan
  .emit("foo")
  .send()
  .then(() => console.log("Finished Emitting foo!"));

/*
  // Console Output -->
  foo 2!
  foo 1!
  Finished Emitting foo!
*/
```

### More Examples

For more examples you can check out the
[examples directory](https://github.com/Dash-OS/pubchan/tree/master/examples)

---

## API Reference

> **Note:** This is currently a work in progress. The API is quite simple and
> can be understood by looking at our
> [types](https://github.com/Dash-OS/pubchan/tree/master/src/types) files as
> this packages has 100% flowtype coverage.

### Module Exports

#### `createPubChan` (Function) (default)

##### Overview

Our default export, creates an instance of `PubChan`.

```js
import createPubChan from "pubchan";
const chan = createPubChan();
```

##### Type Signature

```js
declare function createPubChan(): PubChan;
```

---

#### `PubChan` (Class)

##### Overview

Generally using the `createPubChan` function is the recommended method of
creating a new channel. However, you can also import the class directly if
needed (can be useful for adding as flow type).

```js
import { PubChan } from "pubchan";
const chan = new PubChan();
```

---

#### `Subscriber` (Class)

##### Overview

This should have no use other than possibly to use for flow-types. A subscriber
is useless unless created by an interface which matches the `PubChan`.

```js
/* @flow */
import type { Subscriber } from "pubchan";
```

---

### Registry Exports

Registry is an optional sub-module which wraps `pubchan` and provides a registry
for creating and getting channels by a given `id`.

#### `PubChanRegistry` (Frozen Object) (default)

##### Overview

An object which encapsulates the standard exports listed below.

```js
const PubChanRegistry = Object.freeze({
  has: hasPubChan,
  get: getPubChan,
  keys: pubChanKeys,
  create: getPubChan,
  values: pubChanValues,
  entries: pubChanEntries
});

export default PubChanRegistry;
```

---

#### `getPubChan` (Function)

##### Overview

Gets a `PubChan` with a given `id` which can be any type that can be a key on a
`Map`. If the `id` already exists then it returns that `PubChan` instead of
creating a new one.

`PubChan`'s that are created from the registry automatically subscribe to
`$closed` events to clean themselves up when you close the channel from anywhere
in the app.

It's second argument optionally accepts a boolean which indicates if a `PubChan`
should only be returned if it already exists. If set to `true` then the function
will return `undefined` if the pubchan has not yet been created.

```js
import getPubChan from "pubchan/registry";
const chan = getPubChan("mychan");
```

##### Type Signature

```js
declare export function getPubChan(id: mixed): PubChan
declare export function getPubChan(id: ifexists: false): PubChan
declare export function getPubChan(id: mixed, ifexists: true): void | PubChan
```

---

#### `hasPubChan` (Function)

Check if the given PubChan(s) exists within the registry. Returns `true` if
every `id` given is found.

```js
import { hasPubChan } from "pubchan/registry";
if (hasPubChan("mychan", "anotherchan")) {
  // ...
}
```

##### Type Signature

```js
declare export function hasPubChan(...ids: Array<mixed>): boolean;
```

---

#### `pubChanKeys` (Function)

##### Overview

Returns an array with all entries within the registry. Takes the form of `[id, id, ...]` inline with a call to a `Map`'s `.keys()` call cast to an `Array`.

```js
import { pubChanKeys } from "pubchan/registry";
for (const id of pubChanKeys()) {
  // ...
}
```

##### Type Signature

```js
declare export function pubChanKeys(): Array<mixed>;
```

---

#### `pubChanValues` (Function)

##### Overview

Returns an array with all entries within the registry. Takes the form of `[chan, chan, ...]` inline with a call to a `Map`'s `.values()` call cast to an `Array`.

```js
import { pubChanValues } from "pubchan/registry";
for (const chan of pubChanValues()) {
  // ...
}
```

##### Type Signature

```js
declare export function pubChanValues(): Array<PubChan>;
```

---

#### `pubChanEntries` (Function)

##### Overview

Returns an array with all entries within the registry. Takes the form of `[[key, value], ...]` inline with a call to a `Map`'s `.entries()` call cast to an
`Array`.

```js
import { pubChanEntries } from "pubchan/registry";
for (const [id, chan] of pubChanEntries()) {
  // ...
}
```

##### Type Signature

```js
declare export function pubChanEntries(): Array<[mixed, PubChan]>;
```

---

### Type Exports

You can import the various
[flow-types](https://github.com/Dash-OS/pubchan/tree/master/src/pubchan/types)
that `pubchan` utilizes if needed while annotating your internal functions.

```js
import type {
  PubChan$EmitIDs,
  PubChan$Options,
  PubChan$Pipeline,
  PubChan$Listeners,
  PubChan$SubscriberSet,
  PubChan$EmitResponseRef,
  PubChan$State,
  PubChan$ResolvedPipeline,
  PubChan$Ref
} from "pubchan/lib/types";
```

There are some useful [utility types](https://flow.org/en/docs/types/utilities/)
also available at
[`pubchan/lib/types/utils`](https://github.com/Dash-OS/pubchan/tree/master/src/pubchan/types/utils)

---

### `PubChan`

##### Overview

Below is a normalized version of the `PubChan` class's public interface which
should provide the structure of the instance returned by our `createPubChan`
factory.

##### Type Signature

```js
declare class PubChan {
  // how many total active subscribers do we have?
  get length(): number,
  get size(): number,

  // emit the given ids and execute any matching subscribers
  emit: (...args: Array<Array<mixed> | mixed>) => PubChan,

  // include args with the event emission
  with: (...args: Array<any>) => PubChan,

  // include state with the event for chained emissions
  state = (...args: Array<?{ [key: string]: any }>) => PubChan,

  // send the event and optionally include args to the handlers.
  send: (...args: Array<any>) => Promise<null> | Promise<Array<any>>,

  close: (...args: Array<any>) => Promise<null> | Promise<Array<any>>,

  subscribe: (
    options?: $Shape<{|
      async?: boolean,
      context?: Object
    |}>,
  ) => Subscriber,
}
```

### `Subscriber`

`Subscriber` instances are returned by a call to `.subscribe()` on our `PubChan`
instance.

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
  +once?: void | boolean;
  +id?: PubChan$EmitID;
  +state: { [key: string]: * };
  +subscription: Subscriber;
  +chan: PubChan;
  +callback: PubChan$Callback;
  +cancel: () => void;
}

declare class Subscriber {
  // total number of active callbacks on the subscriber
  get length(): number;
  get size(): number;

  // all the ids we are subscribed to
  get keys(): Array<PubChan$EmitID>;

  // optionally attach a custom context to all "do" and "once" callbacks
  context: (context: Object) => Subscriber;

  // subscribe to EmitIDS
  to: (...args: Array<PubChan$EmitIDs>) => Subscriber;

  // add a callback that will happen once then cancel itself
  once: (
    callback: PubChan$Callback,
    onComplete?: PubChan$CompleteCallback
  ) => Subscriber;

  // add a callback when this event occurs
  do: (
    callback: PubChan$Callback,
    onComplete?: PubChan$CompleteCallback
  ) => Subscriber;

  // cancel the entire subscriber
  cancel: () => void;
}
```

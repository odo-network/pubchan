/* @flow */

import type Subscriber from './classes/subscriber';

// Holds a WeakSet of our subscribers indicating whether or not a given
// subscriber is still active.
export const ACTIVE: WeakSet<Subscriber> = new WeakSet();

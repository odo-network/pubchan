/* @flow */

import PubChan from './classes/pubchan';
import Subscriber from './classes/subscriber';
import Middleware from './classes/middleware';

export default function createPubChan(): PubChan {
  return new PubChan();
}

export { PubChan, Subscriber, Middleware };
/* @flow */

import PubChan from './classes/pubchan';
import Subscriber from './classes/subscriber';
import Middleware from './classes/middleware';

export default function createPubChan(): PubChan {
  return new PubChan();
}

export {
  BROADCAST,
  SUBSCRIBE_ALL,
  SUBSCRIBE_CLOSED,
  SUBSCRIBE_SUBSCRIBERS_ALL,
  SUBSCRIBE_SUBSCRIBERS_ADDED,
  SUBSCRIBE_SUBSCRIBERS_REMOVED,
} from './constants';

export { PubChan, Subscriber, Middleware };

/* @flow */

import PubChan from './classes/pubchan';
import Subscriber from './classes/subscriber';

export default function createPubChan(): PubChan {
  return new PubChan();
}

export { PubChan, Subscriber };

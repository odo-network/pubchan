/* @flow */

import Subscriber from '../classes/subscriber';
import PubChan from '../classes/pubchan';

export type PubChan$EmitID = mixed;

export type PubChan$Options = {|
  async: boolean,
|};

export type PubChan$EmitIDs = Array<PubChan$EmitID> | PubChan$EmitID;

export type PubChan$Matches = PubChan$SubscriberSet;

export type PubChan$SubscriberSet = Set<Subscriber>;

type Callback = (
  ref: PubChan$Ref,
  ids: Set<PubChan$EmitID>,
  ...args: Array<mixed>
) => Array<mixed> | mixed;

export type PubChan$Callback = Array<Callback> | Callback;

export interface PubChan$Ref {
  +once?: void | boolean,
  +id?: PubChan$EmitID,
  +state: { [key: string]: * },
  +subscription: Subscriber,
  +chan: PubChan,
  +callback: PubChan$Callback,
  +cancel: () => void,
}

export type PubChan$Listeners = Map<PubChan$EmitID, PubChan$SubscriberSet>;

export type PubChan$IDSet = Set<PubChan$EmitID>;

export type PubChan$Pipeline = {
  emit: PubChan$IDSet,
  matches: PubChan$Matches,
  with: Array<mixed>,
};

export type PubChan$CompleteCallback = (ref: PubChan$Ref) => mixed;

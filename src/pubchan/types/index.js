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

export type PubChan$IDSet = Set<PubChan$EmitID>;

type Callback = (
  ref: PubChan$Ref,
  ids: Set<PubChan$EmitID>,
  ...args: Array<mixed>
) => void | (Array<any> | any);

export type PubChan$Callback = Array<Callback> | Callback;

export interface PubChan$Ref {
  +ids?: PubChan$IDSet;
  +once?: void | boolean;
  +subscription: Subscriber;
  +chan: PubChan;
  +callback: PubChan$Callback;
  +cancel: () => void;
  _state?: $Shape<{ [key: string]: * }>;
  state: $Shape<{ [key: string]: * }>;
}

export type PubChan$StateShape = {
  // $call?: void,
  [key: string]: mixed,
};

export type PubChan$StateResolver = (
  state: PubChan$StateShape,
) => void | PubChan$StateShape;

export type PubChan$State = PubChan$StateShape | PubChan$StateResolver;

export type PubChan$EmitResponseRef = {
  results: null | Array<mixed> | mixed,
  state?: PubChan$StateShape,
};

export type PubChan$Listeners = Map<PubChan$EmitID, PubChan$SubscriberSet>;

export type PubChan$Pipeline = {
  ids: PubChan$IDSet,
  matches: PubChan$Matches,
  with: Array<mixed>,
  state?: Array<PubChan$State>,
};

export type PubChan$ResolvedPipeline = {|
  ...$Rest<$Exact<PubChan$Pipeline>, {| state?: Array<PubChan$State> |}>,
  state: void | PubChan$StateShape,
|};

// {
//   emit: PubChan$IDSet,
//   matches: PubChan$Matches,
//   with: Array<mixed>,
//   state?: Array<PubChan$State>,
// };

export type PubChan$CompleteCallback = (ref: PubChan$Ref) => ?mixed;

// /* @flow */
//
// import Subscriber from '../src/classes/subscriber';
// import PubChan from '../src/classes/pubchan';
//
// export type PubChan$EmitID = mixed;
//
// export type PubChan$Options = {|
//   async: boolean,
// |};
//
// export type PubChan$EmitIDs = Array<PubChan$EmitID> | PubChan$EmitID;
//
// export type PubChan$Matches = PubChan$SubscriberSet;
//
// export type PubChan$SubscriberSet = Set<Subscriber>;
//
// type Callback = (
//   ref: PubChan$Ref,
//   ids: Set<PubChan$EmitID>,
//   ...args: Array<mixed>
// ) => Array<mixed> | mixed;
//
// export type PubChan$Callback = Array<Callback> | Callback;
//
// export interface PubChan$Ref {
//   +once?: void | boolean;
//   +id?: PubChan$EmitID;
//   +state: { [key: string]: * };
//   +subscription: Subscriber;
//   +chan: PubChan;
//   +callback: PubChan$Callback;
//   +cancel: () => void;
// }
//
// // export type PubChan$Listeners = ;
// //
// // export type PubChan$IDSet = Set<PubChan$EmitID>;
// //
// // export type PubChan$Pipeline = ;
//
// export type PubChan$CompleteCallback = (ref: PubChan$Ref) => mixed;
//
// declare module 'pubchan' {
//   declare class PubChan {
//     pipeline: {
//       emit: Set<mixed>,
//       matches: Set<Subscriber>,
//       with: Array<mixed>,
//     };
//     +listeners: Map<mixed, Set<Subscriber>>;
//     +subscribers: Set<Subscriber>;
//     get length(): number;
//     get size(): number;
//     emit: (...args: Array<Array<mixed> | mixed>) => this;
//     with: (...args: Array<any>) => this;
//     send: (...args: Array<any>) => Promise<null> | Promise<Array<any>>;
//     close: (...args: Array<any>) => Promise<null> | Promise<Array<any>>;
//     subscribe: (
//       options?: $Shape<{|
//         async: boolean,
//       |}>,
//     ) => Subscriber;
//   }
//
//   declare type PubChan$EmitID = mixed;
//
//   declare interface PubChan$Ref {
//     +once?: void | boolean;
//     +id?: PubChan$EmitID;
//     +state: { [key: string]: * };
//     +subscription: Subscriber;
//     +chan: PubChan;
//     +callback: PubChan$Callback;
//     +cancel: () => void;
//   }
//
//   declare class Subscriber {
//     get length(): number;
//     get size(): number;
//     // all the ids we are subscribed to
//     get keys(): Array<PubChan$EmitID>;
//
//     to: (...args: Array<PubChan$EmitIDs>) => this;
//
//     // add a callback that will happen once then cancel itself
//     once: (
//       callback: PubChan$Callback,
//       onComplete?: PubChan$CompleteCallback,
//     ) => this;
//
//     // add a callback when this event occurs
//     do: (
//       callback: PubChan$Callback,
//       onComplete?: PubChan$CompleteCallback,
//     ) => this;
//
//     // cancel the entire subscriber
//     cancel: () => void;
//   }
// }

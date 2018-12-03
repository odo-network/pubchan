"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IGNORED_SUBSCRIPTIONS = exports.BROADCAST = exports.SUBSCRIBE_SUBSCRIBERS_REMOVED = exports.SUBSCRIBE_SUBSCRIBERS_ADDED = exports.SUBSCRIBE_SUBSCRIBERS_ALL = exports.SUBSCRIBE_CLOSED = exports.SUBSCRIBE_ALL = void 0;
const SUBSCRIBE_ALL = Symbol.for('@pubchan/subscribe_all_emits');
exports.SUBSCRIBE_ALL = SUBSCRIBE_ALL;
const SUBSCRIBE_CLOSED = Symbol.for('@pubchan/subscribe_channel_closed');
exports.SUBSCRIBE_CLOSED = SUBSCRIBE_CLOSED;
const SUBSCRIBE_SUBSCRIBERS_ALL = Symbol.for('@pubchan/subscribe_subscribers_all');
exports.SUBSCRIBE_SUBSCRIBERS_ALL = SUBSCRIBE_SUBSCRIBERS_ALL;
const SUBSCRIBE_SUBSCRIBERS_ADDED = Symbol.for('@pubchan/subscribe_subscribers_added');
exports.SUBSCRIBE_SUBSCRIBERS_ADDED = SUBSCRIBE_SUBSCRIBERS_ADDED;
const SUBSCRIBE_SUBSCRIBERS_REMOVED = Symbol.for('@pubchan/subscribe_subscribers_removed');
exports.SUBSCRIBE_SUBSCRIBERS_REMOVED = SUBSCRIBE_SUBSCRIBERS_REMOVED;
const BROADCAST = Symbol.for('@pubchan/broadcast');
exports.BROADCAST = BROADCAST;
const IGNORED_SUBSCRIPTIONS = [SUBSCRIBE_SUBSCRIBERS_ALL, SUBSCRIBE_SUBSCRIBERS_ADDED, SUBSCRIBE_SUBSCRIBERS_REMOVED];
exports.IGNORED_SUBSCRIPTIONS = IGNORED_SUBSCRIPTIONS;
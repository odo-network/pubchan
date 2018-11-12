"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ACTIVE = void 0;
// Holds a WeakSet of our subscribers indicating whether or not a given
const ACTIVE = new WeakSet();
exports.ACTIVE = ACTIVE;
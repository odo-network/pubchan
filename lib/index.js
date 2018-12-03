"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createPubChan;
Object.defineProperty(exports, "PubChan", {
  enumerable: true,
  get: function () {
    return _pubchan.default;
  }
});
Object.defineProperty(exports, "Subscriber", {
  enumerable: true,
  get: function () {
    return _subscriber.default;
  }
});
Object.defineProperty(exports, "Middleware", {
  enumerable: true,
  get: function () {
    return _middleware.default;
  }
});
Object.defineProperty(exports, "BROADCAST", {
  enumerable: true,
  get: function () {
    return _constants.BROADCAST;
  }
});
Object.defineProperty(exports, "SUBSCRIBE_ALL", {
  enumerable: true,
  get: function () {
    return _constants.SUBSCRIBE_ALL;
  }
});
Object.defineProperty(exports, "SUBSCRIBE_CLOSED", {
  enumerable: true,
  get: function () {
    return _constants.SUBSCRIBE_CLOSED;
  }
});
Object.defineProperty(exports, "SUBSCRIBE_SUBSCRIBERS_ALL", {
  enumerable: true,
  get: function () {
    return _constants.SUBSCRIBE_SUBSCRIBERS_ALL;
  }
});
Object.defineProperty(exports, "SUBSCRIBE_SUBSCRIBERS_ADDED", {
  enumerable: true,
  get: function () {
    return _constants.SUBSCRIBE_SUBSCRIBERS_ADDED;
  }
});
Object.defineProperty(exports, "SUBSCRIBE_SUBSCRIBERS_REMOVED", {
  enumerable: true,
  get: function () {
    return _constants.SUBSCRIBE_SUBSCRIBERS_REMOVED;
  }
});

var _pubchan = _interopRequireDefault(require("./classes/pubchan"));

var _subscriber = _interopRequireDefault(require("./classes/subscriber"));

var _middleware = _interopRequireDefault(require("./classes/middleware"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPubChan() {
  return new _pubchan.default();
}
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
Object.defineProperty(exports, "BROADCAST", {
  enumerable: true,
  get: function () {
    return _pubchan.BROADCAST;
  }
});
Object.defineProperty(exports, "SUBSCRIBE_ALL", {
  enumerable: true,
  get: function () {
    return _pubchan.SUBSCRIBE_ALL;
  }
});
Object.defineProperty(exports, "SUBSCRIBE_CLOSED", {
  enumerable: true,
  get: function () {
    return _pubchan.SUBSCRIBE_CLOSED;
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

var _pubchan = _interopRequireWildcard(require("./classes/pubchan"));

var _subscriber = _interopRequireDefault(require("./classes/subscriber"));

var _middleware = _interopRequireDefault(require("./classes/middleware"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function createPubChan() {
  return new _pubchan.default();
}
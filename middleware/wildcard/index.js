"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _wildcardUtils = _interopRequireDefault(require("wildcard-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  Implements a PubChan which is capable of using wildcard matching
  against subscriptions.

  Requires the user has wildcard-utils installed which is a peer
  dependency.

  Takes a PubChan instance and adds the wildcard middleware to it
*/
// type WildcardMiddleware$State = {|
//   keys: Array<Wildcard$ToPatternTypes>,
// |};
const WC = new _wildcardUtils.default();

const handleWildcardFind = function wildcardFind(event, matches, listeners) // middleware: Middleware<WildcardMiddleware$State>,
{
  if (event && (typeof event === 'string' || typeof event === 'object' || event instanceof Set)) {
    const matched = WC.search(event);

    if (Array.isArray(matched) && matched.length) {
      matched.forEach(key => {
        const set = listeners.get(key);

        if (set instanceof Set) {
          set.forEach(match => matches.add(match));
        }
      });
    }
  } else {
    // relay event to default middleware handler by returning null
    return null;
  }
};

const prepareWildcardSearch = function prepareSearch(matches, listeners) // middleware: Middleware,
{
  WC.pattern([...listeners.keys()].filter(el => typeof el === 'string'));
};

function addWildcardMiddleware(pubchan) {
  if (!pubchan) {
    throw new Error('addWildcardMiddleware expects a pubchan as its argument');
  }

  pubchan.setMiddleware(handleWildcardFind, prepareWildcardSearch);
  return pubchan;
}

var _default = addWildcardMiddleware;
exports.default = _default;
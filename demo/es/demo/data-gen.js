function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

import flatMap from '../lodash-es/flatMap.js';

export function dataGen(filter) {
  function splitData(data, keys) {
    var _keys = _toArray(keys),
        key = _keys[0],
        restKeys = _keys.slice(1);

    var parts = data[key].map(function (value) {
      return Object.assign({}, data, _defineProperty({}, key, value));
    });

    if (restKeys.length) {
      return flatMap(parts, function (part) {
        return splitData(part, restKeys);
      });
    }

    return parts;
  }

  return splitData(filter, Object.keys(filter));
}
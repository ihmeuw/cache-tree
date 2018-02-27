import flatMap from '../lodash-es/flatMap.js';

export function dataGen(filter) {
  function splitData(data, keys) {
    const [key, ...restKeys] = keys;

    const parts = data[key].map((value) => (Object.assign({}, data, { [key]: value })));

    if (restKeys.length) {
      return flatMap(parts, (part) => splitData(part, restKeys));
    }

    return parts;
  }

  return splitData(filter, Object.keys(filter));
}
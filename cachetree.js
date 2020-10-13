import {
  assign,
  castArray,
  compact,
  every,
  flatMap,
  forEach,
  has,
  isArray,
  isEmpty,
  map,
  mergeWith,
  omit,
  pick,
  reduce,
  union,
} from 'lodash';
import { LinkedList, ListNode } from './linkedlist';

/**
 * ack 12/28/2016
 * CacheTree is a class for storing data objects in a nested object. CacheTree takes an array of
 * key names as a hierarchy to structure the levels of the nested object that stores the
 * data. Given a piece of data with keys that match the hierarchy, the values of the keys
 * in the data become keys in the nested structure of the cache.
 *
 * At the bottom of the tree, each leaf is an object that is a node in a linked list. The 'key'
 * property holds the data to be consumed. The linked list implements a Least Recently Used cache
 * replacement policy. Older unused data is removed from the cache as new data is being stored.
 * Any data that gets reused is moved to the front of the list. The length of the list is set by
 * 'maxSize' in the constructor.
 *
 * There is a 'getDiff' method that when given a set of parameters as a query, will return an
 * object that describes the missing data in the cache. This difference is not perfect however.
 * It should return an object that describes the smallest cartesian product of parameters that are
 * missing. This difference object maybe used as a smaller query to a database, but over fetching
 * is unavoidable in some cases at the moment.
 */
export default class CacheTree {
  constructor(hierarchy, maxSize = 1000000) {
    this._structure = hierarchy;
    this._cache = {};
    this._maxSize = maxSize;

    // LRU-LINKED-LIST
    this._lru = new LinkedList(this._maxSize);
  }

  // /////////////////
  // "private methods"
  // /////////////////

  _search(path, cache, filter, extract) {
    const [pathNode, ...pathRemaining] = path;

    if (path.length === 0) {
      const datum = cache.key;
      if (extract) {
        this._remove(this._structure, this._cache, cache.key);
        this._lru.delete(cache);
      } else {
        this._lru.refresh(cache);
      }

      return castArray(datum);
    } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
      if (process.env.CACHE_TREE_LOG_LEVEL === 'error') {
        forEach(filter[pathNode], (item) => {
          if (!has(cache, item)) {
            console.error(`missing parameter: ${pathNode}: ${item}`);
          }
        });
      }

      const trimmedCache = pick(cache, filter[pathNode]);

      return flatMap(
        trimmedCache,
        subCache => this._search(pathRemaining, subCache, filter, extract),
      );
    } else if (has(filter, pathNode)) {
      if (!has(cache, filter[pathNode])) {
        return [];
      }

      return this._search(pathRemaining, cache[filter[pathNode]], filter, extract);
    }

    // select all at this level
    return flatMap(cache, subCache => this._search(pathRemaining, subCache, filter, extract));
  }

  _insert(path, subCache, data) {
    const [pathNode, ...pathRemaining] = path;

    if (path.length && !has(data, pathNode)) {
      throw new Error('missing property in data');
    }

    if (path.length === 0) {
      if (!isEmpty(subCache)) { // data is already exists, do not replace
        return subCache;
      }

      // otherwise, insert data
      // _lru - insert into list
      const node = new ListNode(Object.freeze(data));

      this._lru.insert(node);

      // check length of list, evict data if necessary
      if (this._lru.length > this._lru.maxLength) {
        this._remove(this._structure, this._cache, this._lru.tail.prev.key);
        this._lru.evict();
      }

      return node;
    }

    if (!has(subCache, data[pathNode])) { // create property if it does not exist
      subCache[data[pathNode]] = {};
    }

    subCache[data[pathNode]] = this._insert(pathRemaining, subCache[data[pathNode]], data);

    return subCache;
  }

  _check(path, cache, filter) {
    const [pathNode, ...pathRemaining] = path;

    if (path.length === 0) {
      return true;
    } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
      return every(
        filter[pathNode],
        param => has(cache, param) && this._check(pathRemaining, cache[param], filter),
      );
    } else if (has(filter, pathNode) && has(cache, filter[pathNode])) {
      return this._check(pathRemaining, cache[filter[pathNode]], filter);
    }

    return false;
  }

  _size(path, cache) {
    const [, ...pathRemaining] = path;

    if (path.length === 0) {
      return 1;
    }

    return reduce(cache, (acc, subCache) => acc + this._size(pathRemaining, subCache), 0);
  }

  // pseudo-diff (not true diff)
  _diff(path, cache, filter) {
    const [pathNode, ...pathRemaining] = path;

    if (path.length === 0) {
      return filter;
    } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
      // map over elements of the array for this field
      const filterPieces = map(filter[pathNode], (param) => {
        if (has(cache, param)) {
          const subDiff = this._diff(pathRemaining, cache[param], omit(filter, pathNode));

          if (isEmpty(subDiff)) return subDiff;

          return assign({}, { [pathNode]: param }, subDiff);
        }

        return assign({}, { [pathNode]: [param] }, omit(filter, pathNode));
      });

      return reduce(
        filterPieces,
        (acc, partial) => mergeWith(
          acc, partial,
          (accValue, partialValue) => compact(union(castArray(accValue), castArray(partialValue))),
        ),
        {},
      );
    } else if (has(filter, pathNode) && has(cache, filter[pathNode])) {
      const subDiff = this._diff(pathRemaining, cache[filter[pathNode]], omit(filter, pathNode));

      if (isEmpty(subDiff)) return subDiff;

      return assign({}, { [pathNode]: filter[pathNode] }, subDiff);
    }

    return filter;
  }

  _remove(path, cache, data) {
    const [pathNode, ...pathRemaining] = path;

    if (path.length === 1) {
      return delete cache[data[pathNode]]; // returns true if object property is deleted
    } else if (
      this._remove(pathRemaining, cache[data[pathNode]], data)
      && isEmpty(cache[data[pathNode]])
    ) {
      return delete cache[data[pathNode]]; // clean up branch on the way out
    }

    return false;
  }

  // ////////////////
  // "public methods"
  // ////////////////

  /**
   *
   * Retrieves new copies of data from cache that passes through the filter
   * and pushes to queryResult.
   *
   * @param {object} filter
   * @return {Array}
   */
  get(filter) {
    return this._search(this._structure, this._cache, filter);
  }

  /**
   *
   * Sets data into the cache.
   *
   * @param {object} data
   */
  set(data) {
    if (isArray(data)) {
      forEach(data, (datum) => {
        this._insert(this._structure, this._cache, datum);
      });
    } else {
      this._insert(this._structure, this._cache, data);
    }
  }

  /**
   *
   * Get a copy of the cache.
   *
   * @return {Object|*|{}}
   */
  clone() {
    const newCache = new CacheTree();
    return assign(newCache, this);
  }

  /**
   *
   * Checks the cache to see if specified data is available.
   * Filter is an object that has keys matching each part of the structure
   * of the cache. The filter must be specific about each key.
   *
   * @param {object} filter
   * @return {boolean}
   */
  has(filter) {
    return this._check(this._structure, this._cache, filter);
  }

  /**
   *
   * Like `get`, retrieves new copies of data from cache that pass through the filter,
   * but also removes the data from the cache and LRU list.
   *
   * @param {object} filter
   * @return {Array}
   */
  extract(filter) {
    return this._search(this._structure, this._cache, filter, true);
  }

  /**
   *
   * Checks cache against filter to return a parameters object of data that is missed.
   *
   * @param {object} paramFilter
   * @return {object}
   */
  getDiff(paramFilter) {
    return this._diff(this._structure, this._cache, pick(paramFilter, this._structure));
  }

  /**
   * Replaces cache with an empty object.
   */
  clearCache() {
    this._cache = {};
    this._lru = new LinkedList(this._maxSize);
  }

  /**
   *
   * The number of data objects stored in cache.
   *
   * @return {number}
   */
  getSize() {
    return this._size(this._structure, this._cache);
  }
}

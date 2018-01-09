var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { assign, castArray, compact, every, flatMap, forEach, has, isArray, isEmpty, map, mergeWith, omit, pick, reduce, union } from 'lodash';
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

var CacheTree = function () {
  function CacheTree(hierarchy) {
    var maxSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000000;

    _classCallCheck(this, CacheTree);

    this._structure = hierarchy;
    this._cache = {};
    this._maxSize = maxSize;

    // LRU-LINKED-LIST
    this._lru = new LinkedList(this._maxSize);
  }

  // /////////////////
  // "private methods"
  // /////////////////

  _createClass(CacheTree, [{
    key: '_search',
    value: function _search(path, cache, filter, extract) {
      var _this = this;

      var _path = _toArray(path),
          pathNode = _path[0],
          pathRemaining = _path.slice(1);

      if (path.length === 0) {
        var datum = cache.key;
        if (extract) {
          this._remove(this._structure, this._cache, cache.key);
          this._lru.delete(cache);
        } else {
          this._lru.refresh(cache);
        }

        return castArray(datum);
      } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
        if (process.env.NODE_ENV === 'development') {
          forEach(filter[pathNode], function (item) {
            if (!has(cache, item)) {
              console.error('missing parameter: ' + pathNode + ': ' + item);
            }
          });
        }

        var trimmedCache = pick(cache, filter[pathNode]);

        return flatMap(trimmedCache, function (subCache) {
          return _this._search(pathRemaining, subCache, filter, extract);
        });
      } else if (has(filter, pathNode)) {
        if (!has(cache, filter[pathNode])) {
          return [];
        }

        return this._search(pathRemaining, cache[filter[pathNode]], filter, extract);
      }

      // select all at this level
      return flatMap(cache, function (subCache) {
        return _this._search(pathRemaining, subCache, filter, extract);
      });
    }
  }, {
    key: '_insert',
    value: function _insert(path, subCache, data) {
      var _path2 = _toArray(path),
          pathNode = _path2[0],
          pathRemaining = _path2.slice(1);

      if (path.length && !has(data, pathNode)) {
        throw new Error('missing property in data');
      }

      if (path.length === 0) {
        if (!isEmpty(subCache)) {
          // data is already exists, do not replace
          return subCache;
        }

        // otherwise, insert data
        // _lru - insert into list
        var node = new ListNode(Object.freeze(data));

        this._lru.insert(node);

        // check length of list, evict data if necessary
        if (this._lru.length > this._lru.maxLength) {
          this._remove(this._structure, this._cache, this._lru.tail.prev.key);
          this._lru.evict();
        }

        return node;
      }

      if (!has(subCache, data[pathNode])) {
        // create property if it does not exist
        subCache[data[pathNode]] = {};
      }

      subCache[data[pathNode]] = this._insert(pathRemaining, subCache[data[pathNode]], data);

      return subCache;
    }
  }, {
    key: '_check',
    value: function _check(path, cache, filter) {
      var _this2 = this;

      var _path3 = _toArray(path),
          pathNode = _path3[0],
          pathRemaining = _path3.slice(1);

      if (path.length === 0) {
        return true;
      } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
        return every(filter[pathNode], function (param) {
          return has(cache, param) && _this2._check(pathRemaining, cache[param], filter);
        });
      } else if (has(filter, pathNode) && has(cache, filter[pathNode])) {
        return this._check(pathRemaining, cache[filter[pathNode]], filter);
      }

      return false;
    }
  }, {
    key: '_size',
    value: function _size(path, cache) {
      var _this3 = this;

      var _path4 = _toArray(path),
          pathRemaining = _path4.slice(1);

      if (path.length === 0) {
        return 1;
      }

      return reduce(cache, function (acc, subCache) {
        return acc + _this3._size(pathRemaining, subCache);
      }, 0);
    }

    // pseudo-diff (not true diff)

  }, {
    key: '_diff',
    value: function _diff(path, cache, filter) {
      var _this4 = this;

      var _path5 = _toArray(path),
          pathNode = _path5[0],
          pathRemaining = _path5.slice(1);

      if (path.length === 0) {
        return filter;
      } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
        // map over elements of the array for this field
        var filterPieces = map(filter[pathNode], function (param) {
          if (has(cache, param)) {
            var subDiff = _this4._diff(pathRemaining, cache[param], omit(filter, pathNode));

            if (isEmpty(subDiff)) return subDiff;

            return assign({}, _defineProperty({}, pathNode, param), subDiff);
          }

          return assign({}, _defineProperty({}, pathNode, [param]), omit(filter, pathNode));
        });

        return reduce(filterPieces, function (acc, partial) {
          return mergeWith(acc, partial, function (accValue, partialValue) {
            return compact(union(castArray(accValue), castArray(partialValue)));
          });
        }, {});
      } else if (has(filter, pathNode) && has(cache, filter[pathNode])) {
        var subDiff = this._diff(pathRemaining, cache[filter[pathNode]], omit(filter, pathNode));

        if (isEmpty(subDiff)) return subDiff;

        return assign({}, _defineProperty({}, pathNode, filter[pathNode]), subDiff);
      }

      return filter;
    }
  }, {
    key: '_remove',
    value: function _remove(path, cache, data) {
      var _path6 = _toArray(path),
          pathNode = _path6[0],
          pathRemaining = _path6.slice(1);

      if (path.length === 1) {
        return delete cache[data[pathNode]]; // returns true if object property is deleted
      } else if (this._remove(pathRemaining, cache[data[pathNode]], data) && isEmpty(cache[data[pathNode]])) {
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

  }, {
    key: 'get',
    value: function get(filter) {
      return this._search(this._structure, this._cache, filter);
    }

    /**
     *
     * Sets data into the cache.
     *
     * @param {object} data
     */

  }, {
    key: 'set',
    value: function set(data) {
      var _this5 = this;

      if (isArray(data)) {
        forEach(data, function (datum) {
          _this5._insert(_this5._structure, _this5._cache, datum);
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

  }, {
    key: 'clone',
    value: function clone() {
      var newCache = new CacheTree();
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

  }, {
    key: 'has',
    value: function has(filter) {
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

  }, {
    key: 'extract',
    value: function extract(filter) {
      return this._search(this._structure, this._cache, filter, true);
    }

    /**
     *
     * Checks cache against filter to return a parameters object of data that is missed.
     *
     * @param {object} paramFilter
     * @return {object}
     */

  }, {
    key: 'getDiff',
    value: function getDiff(paramFilter) {
      return this._diff(this._structure, this._cache, pick(paramFilter, this._structure));
    }

    /**
     * Replaces cache with an empty object.
     */

  }, {
    key: 'clearCache',
    value: function clearCache() {
      this._cache = {};
      this._lru = new LinkedList(this._maxSize);
    }

    /**
     *
     * The number of data objects stored in cache.
     *
     * @return {number}
     */

  }, {
    key: 'getSize',
    value: function getSize() {
      return this._size(this._structure, this._cache);
    }
  }]);

  return CacheTree;
}();

export default CacheTree;
import {
  assign,
  castArray,
  compact,
  Dictionary,
  every,
  flatMap,
  forEach,
  get as getValue,
  has,
  isArray,
  isEmpty,
  map,
  mergeWith,
  omit,
  pick,
  reduce,
  set,
  toString,
  union,
  unset,
} from 'lodash';
import LinkedList from './linked-list';
import ListNode from './list-node';

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

type Filter<T> = {
  [K in keyof T]?: number | number[];
};

type Cache<T> = ListNode<T> | {
  [id: number]: ListNode<T> | Cache<T>;
};

declare const process: {
  env: {
    NODE_ENV: string
  }
};

export default class CacheTree<T, K extends keyof T> {
  private cacheTree: Dictionary<Cache<T>>;
  private hierarchy: K[];
  private lru: LinkedList<T>;
  private maxSize: number;

  constructor(hierarchy: K[], maxSize: number = 1000000) {
    this.hierarchy = hierarchy;
    this.cacheTree = {};
    this.maxSize = maxSize;

    // LRU-LINKED-LIST
    this.lru = new LinkedList(this.maxSize);
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
  get(filter: Filter<T>): T[] {
    return this._get(this.hierarchy, this.cacheTree, filter);
  }

  /**
   *
   * Returns a frozen object copy of cacheTree property
   *
   * @return {object}
   */
  getCachedDataTree(): Cache<T> {
    return Object.freeze(assign({}, this.cacheTree));
  }

  /**
   *
   * Sets data into the cache.
   *
   * @param {object} data
   */
  insert(data: T | T[]): CacheTree<T, keyof T> {
    if (isArray(data)) {
      forEach(data, (datum) => {
        this._insert(this.hierarchy, this.cacheTree, datum);
      });

      return this;
    } else {
      this._insert(this.hierarchy, this.cacheTree, data);

      return this;
    }
  }

  /**
   *
   * Get a copy of the cache.
   *
   * @return {Object|*|{}}
   */
  clone(): CacheTree<T, K> {
    const newCache = new CacheTree<T, K>(this.hierarchy, this.maxSize);
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
  has(filter: Filter<T>): boolean {
    return this._has(this.hierarchy, this.cacheTree, filter);
  }

  /**
   *
   * Checks cache against filter to return a parameters object of data that is missed.
   *
   * @param {object} filter
   * @return {object}
   */
  getDiff(filter: Filter<T>): Dictionary<Filter<T>> {
    return this._diff(this.hierarchy, this.cacheTree, pick(filter, this.hierarchy));
  }

  /**
   * Replaces cache with an empty object.
   */
  clearCache() {
    this.cacheTree = {};
    this.lru = new LinkedList(this.maxSize);
  }

  /**
   *
   * The number of data objects stored in cache.
   *
   * @return {number}
   */
  getSize(): number {
    return this._size(this.hierarchy, this.cacheTree);
  }

  // /////////////////
  // "private methods"
  // /////////////////

  private isListNode(cache: Cache<T> | ListNode<T>): cache is ListNode<T> {
    return (cache as ListNode<T>).key !== undefined;
  }

  private isData(data: ListNode<T> | T | null): data is T {
    return data !== null && every(this.hierarchy, (prop) => has(data, prop));
  }

  private _get(path: K[], cache: Cache<T>, filter: Filter<T>): T[] {
    const [pathNode, ...pathRemaining] = path;

    if (path.length === 0 && this.isListNode(cache) && this.isData(cache.key)) {
      this.lru.refresh(cache);

      return castArray(cache.key);
    } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
      if (process.env.NODE_ENV === 'development') {
        forEach(getValue(filter, pathNode), (item) => {
          if (!has(cache, item)) {
            /* tslint:disable no-console */
            console.error(`missing parameter: ${pathNode}: ${item}`);
            /* tslint:enable no-console */
          }
        });
      }

      const cacheBranches = pick(cache, getValue(filter, pathNode));

      return flatMap(cacheBranches, (cacheBranch) => this._get(pathRemaining, cacheBranch, filter));
    } else if (has(filter, pathNode) && has(cache, getValue(filter, pathNode))) {
      return this._get(pathRemaining, getValue(cache, getValue(filter, pathNode)), filter);
    }

    // select all at this level
    return flatMap(cache, (cacheBranch) => this._get(pathRemaining, cacheBranch, filter));
  }

  private _insert(path: K[], cache: Cache<T>, data: T): Cache<T> {
    const [pathNode, ...pathRemaining] = path;

    if (path.length && !has(data, pathNode)) {
      throw new Error('missing property in data');
    }

    if (path.length === 0) {
      if (isEmpty(cache)) {
        // lru - insert into list
        this.lru.insert(data);

        // check length of list, evict data if necessary
        if (this.lru.length > this.lru.maxLength && this.lru.sentinel.prev.key !== null) {
          this._remove(this.hierarchy, this.cacheTree, this.lru.sentinel.prev.key);
          this.lru.evict();
        }
      }

      return this.lru.sentinel.next;
    }

    if (!has(cache, toString(data[pathNode]))) {
      set(cache, [data[pathNode]], {});
    }

    const cacheBranch: Cache<T> = getValue(cache, toString(data[pathNode]));

    set(cache, [data[pathNode]], this._insert(pathRemaining, cacheBranch, data) );

    return cache;
  }

  private _has(path: K[], cache: Cache<T>, filter: Filter<T>): boolean {
    const [pathNode, ...pathRemaining] = path;

    if (path.length === 0) {
      return true;
    } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
      return every(
        castArray(getValue(filter, pathNode)),
        (param) => {
          const cacheBranch: Cache<T> = getValue(cache, param);

          return has(cache, param) && this._has(pathRemaining, cacheBranch, filter);
        }
      );
    } else if (has(filter, pathNode) && has(cache, getValue(filter, pathNode))) {
      const cacheBranch: Cache<T> = getValue(cache, getValue(filter, pathNode));

      return this._has(pathRemaining, cacheBranch, filter);
    }

    return false;
  }

  private _size(path: K[], cache: Dictionary<Cache<T>>): number {
    const [, ...pathRemaining] = path;

    if (path.length === 0) {
      return 1;
    }

    return reduce(cache, (acc, cacheBranch: Dictionary<Cache<T>>) => acc + this._size(pathRemaining, cacheBranch), 0);
  }

  // pseudo-diff (not true diff)
  private _diff(path: K[], cache: Cache<T>, filter: Dictionary<Filter<T>>): Dictionary<Filter<T>> {
    const [pathNode, ...pathRemaining] = path;

    if (path.length === 0) {
      return filter;
    } else if (has(filter, pathNode) && isArray(filter[pathNode])) {
      // map over elements of the array for this field
      const filterPieces = map(getValue(filter, pathNode), (param: number) => {
        if (has(cache, param)) {
          const cacheBranch: Cache<T> = getValue(cache, param);
          const subDiff = this._diff(pathRemaining, cacheBranch, omit(filter, pathNode));

          if (isEmpty(subDiff)) {
            return subDiff;
          }

          return assign({}, { [pathNode]: param }, subDiff);
        }

        return assign({}, { [pathNode]: [param] }, omit(filter, pathNode));
      });

      return reduce(
        filterPieces,
        (acc, partial) => mergeWith(
          acc, partial,
          (accValue, partialValue) => compact(union(castArray(accValue), castArray(partialValue)))
        ),
        {}
      );
    } else if (has(filter, pathNode) && has(cache, filter[pathNode])) {
      const cacheBranch: Cache<T> = getValue(cache, filter[pathNode]);
      const subDiff = this._diff(pathRemaining, cacheBranch, omit(filter, pathNode));

      if (isEmpty(subDiff)) {
        return subDiff;
      }

      return assign({}, { [pathNode]: filter[pathNode] }, subDiff);
    }

    return filter;
  }

  private _remove(path: K[], cache: Cache<T>, data: T): boolean {
    const [pathNode, ...pathRemaining] = path;
    const cacheBranch: Cache<T> = getValue(cache, toString(data[pathNode]));

    if (path.length === 1) {
      return unset(cache, getValue(data, pathNode)); // returns true if object property is deleted
    } else if (
      this._remove(pathRemaining, cacheBranch, data)
      && isEmpty(cacheBranch)
    ) {
      return unset(cache, getValue(data, pathNode)); // clean up branch on the way out
    }

    return false;
  }
}

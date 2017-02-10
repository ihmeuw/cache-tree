/* eslint-disable no-unused-expressions, max-len, no-use-before-define, no-underscore-dangle,   */

import { expect } from 'chai';

import CacheTree from '../cachetree';

import {
  mockData,
  mockDatum1,
  mockDatum2,
  mockDatum3,
  mockDatum4,
  mockDatum5,
} from './testUtil/mockdata.js';

describe('CacheTree', () => {
  describe('set', () => {
    const cache = new CacheTree(['sex', 'estimate', 'age']);
    const data = [mockDatum1, mockDatum2, mockDatum3, mockDatum4];
    it('will insert data into cache', () => {
      cache.set(data[0]);
      cache.set(data[1]);
      cache.set(data[2]);
      cache.set(data[3]);
      expect(cache._cache[1][1][1].key).to.deep.equal(data[0]);
      expect(cache._cache[1][2][1].key).to.deep.equal(data[1]);
      expect(cache._cache[1][2][2].key).to.deep.equal(data[2]);
      expect(cache._cache[1][2][3].key).to.deep.equal(data[3]);
      cache.clearCache();
    });

    it('will insert a data array into cache', () => {
      cache.set(data);
      expect(cache._cache[1][1][1].key).to.deep.equal(data[0]);
      expect(cache._cache[1][2][1].key).to.deep.equal(data[1]);
      expect(cache._cache[1][2][2].key).to.deep.equal(data[2]);
      expect(cache._cache[1][2][3].key).to.deep.equal(data[3]);
      cache.clearCache();
    });
  });

  describe('get', () => {
    const cache = new CacheTree(['sex', 'estimate', 'age', 'year', 'location']);
    cache.set(mockData);

    // all fields have a value
    it('returns data given a path and filter', () => {
      const filter = { age: 1, sex: 1, estimate: 1, location: 345, year: 1990 };
      expect(cache.get(filter)[0])
        .to.deep.equal(mockData[0]);
    });

    it('returns data not referentially equal to input data', () => {
      const filter = { age: 1, sex: 1, estimate: 1, location: 345, year: 1990 };
      expect(cache.get(filter)[0])
        .to.not.equal(mockData[0]);
    });

    // missing year field
    it('will return data for a time trend', () => {
      const lineChartFilter = { age: 1, sex: 1, estimate: 1, location: 345 };
      expect(cache.get(lineChartFilter))
        .to.deep.equal([mockData[0], mockData[3]]);
    });

    // missing location field
    it('will return data for a choropleth', () => {
      const choroplethFilter = { age: 1, sex: 1, estimate: 1, year: 1990 };
      expect(cache.get(choroplethFilter))
        .to.deep.equal(
        [mockData[2], mockData[0], mockData[1]]
      );
    });

    // missing age field
    it('will return data for an age pattern', () => {
      const agePatternFilter = { sex: 1, estimate: 1, location: 345, year: 1995 };
      expect(cache.get(agePatternFilter))
        .to.deep.equal(
        [mockData[3], mockData[9], mockData[15]]
      );
    });

    // one field is an array and missing year field
    it('will return data for a multiline', () => {
      const multilineFilter = { age: 1, sex: 1, estimate: 1, location: [345, 457] };
      expect(cache.get(multilineFilter))
        .to.deep.equal([
        mockData[0],
        mockData[1],
        mockData[3],
        mockData[4],
      ]);
    });

    // get data not in cache?
    it('will try to get data not in the cache', () => {
      const multilineFilter = { age: 1, sex: 1, estimate: 1, location: [345, 457, 100] };
      expect(cache.get(multilineFilter))
        .to.deep.equal([
        mockData[0],
        mockData[1],
        mockData[3],
        mockData[4],
      ]);
    });
  });

  describe('clearCache', () => {
    const cache = new CacheTree(['sex', 'estimate', 'age', 'year', 'location']);
    cache.set(mockData);

    it('will clear its stored data', () => {
      expect(cache._cache.hasOwnProperty('1')).to.be.true;
      expect(cache._lru.head.next).to.not.equal(cache._lru.tail);
      cache.clearCache();
      expect(cache._cache.hasOwnProperty('1')).to.be.false;
      expect(cache._cache).to.be.empty;
      expect(cache._lru.head.next).to.equal(cache._lru.tail);
    });
  });

  describe('cloneCache', () => {
    const cache = new CacheTree(['sex', 'estimate', 'age', 'year', 'location']);
    cache.set(mockData);
    const clone = cache.cloneCache();

    it('will return a clone of the cache that is not referentially equal to the original', () => {
      expect(clone).to.not.equal(cache);
    });

    it('will return a cache with the same underlying properties', () => {
      expect(clone._cache).to.equal(cache._cache);
    });
  });

  describe('has', () => {
    const cache = new CacheTree(['sex', 'estimate', 'age', 'year', 'location']);
    cache.set(mockData);

    it('returns true if full data description exists in cache', () => {
      const filter = { age: 1, sex: 1, estimate: 1, location: 345, year: 1990 };
      expect(cache.has(filter)).to.be.true;
    });

    it('returns false if full data description does not exist in cache', () => {
      const filter = { age: 1, sex: 1, estimate: 1, location: 345, year: 1992 };
      expect(cache.has(filter)).to.be.false;
    });

    it('returns true for all combinations of parameters in arrays in filter and data exists in cache', () => {
      const filter = { age: [1, 2, 3], sex: 1, estimate: 1, location: [345, 102], year: [1995, 1990] };
      expect(cache.has(filter)).to.be.true;
    });

    it('returns false if any parameter is not in cache', () => {
      const filter = { age: [1, 2, 3], sex: 1, estimate: 1, location: [345, 555], year: [1995, 1990] };
      expect(cache.has(filter)).to.be.false;
    });
  });

  describe('getSize', () => {
    const cache = new CacheTree(['sex', 'estimate', 'age', 'year', 'location']);

    it('will return 0 if cache is empty', () => {
      expect(cache.getSize()).to.equal(0);
    });

    it('will return the number of available data objects in cache', () => {
      cache.set(mockData);
      expect(cache.getSize()).to.equal(mockData.length);
    });
  });

  describe('getDiff', () => {
    const cache = new CacheTree(['sex', 'estimate', 'age']);
    cache.set([mockDatum1, mockDatum2, mockDatum3, mockDatum4, mockDatum5]);

    it('will return an empty object if there is no diff', () => {
      const filter = {
        sex: 1,
        estimate: 2,
        age: [1, 2],
      };
      expect(cache.getDiff(filter)).to.be.empty;
    });

    it('will return an object describing a missed piece of data in the cache', () => {
      const filter = {
        sex: 1,
        estimate: 1,
        age: 2,
      };
      expect(cache.getDiff(filter)).to.deep.equal(filter);
    });

    it('will return an object describing the diff of the filter and cache', () => {
      const filter = {
        sex: 1,
        estimate: 1,
        age: [1, 2, 3],
      };
      const expectedResult = {
        sex: 1,
        estimate: 1,
        age: [2, 3],
      };
      expect(cache.getDiff(filter)).to.deep.equal(expectedResult);
    });

    it('will return the diff of a complex filter', () => {
      const filter = {
        sex: 1,
        estimate: [1, 2],
        age: [1, 2, 3],
      };
      const expectedResult = {
        sex: 1,
        estimate: [1],
        age: [2, 3],
      };
      expect(cache.getDiff(filter)).to.deep.equal(expectedResult);
    });

    it('will not return a perfect diff, but will try to return the smallest set of parameters for a diff', () => {
      const filter = {
        sex: 1,
        estimate: [1, 2],
        age: [1, 2, 4],
      };
      const expectedResult = {
        sex: 1,
        estimate: [1, 2],
        age: [2, 4],
      };
      expect(cache.getDiff(filter)).to.deep.equal(expectedResult);
    });
  });

  describe('Least Recently Used (LRU) cache replacement policy', () => {
    const cache = new CacheTree(['sex', 'estimate', 'age', 'year', 'location'], 5);
    cache.set([mockData[0], mockData[1], mockData[2], mockData[3]]);

    it('will hold only "maxSize" number of data', () => {
      expect(cache.getSize()).to.equal(4);
      cache.set(mockData[4]);
      expect(cache.getSize()).to.equal(5);
      cache.set(mockData[5]);
      expect(cache.getSize()).to.equal(5);
    });

    it('will remove older data', () => {
      expect(cache.has(mockData[1])).to.be.true;
      cache.set(mockData[6]);
      expect(cache.has(mockData[1])).to.be.false;
    });

    it('will move recently used data to the front of the list', () => {
      expect(cache._lru.tail.prev.key).to.deep.equal(mockData[2]);
      expect(cache._lru.head.next.key).to.deep.equal(mockData[6]);
      cache.get(mockData[2]);
      expect(cache._lru.tail.prev.key).to.deep.equal(mockData[3]);
      expect(cache._lru.head.next.key).to.deep.equal(mockData[2]);
      expect(cache._lru.head.next.next.key).to.deep.equal(mockData[6]);
    });
  });
});

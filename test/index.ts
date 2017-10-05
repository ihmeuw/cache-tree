/* tslint:disable no-unused-expression */

import { expect } from 'chai';
import { assign, forEach, get as getValue, has, map } from 'lodash';

import CacheTree from '../src';
import LinkedList from '../src/linked-list';
import ListNode from '../src/list-node';
import IData, * as mockData from './mockData';

const hierarchy: Array<keyof IData> = ['sex', 'estimate', 'age', 'location', 'year'];

describe('ListNode', () => {
  describe('properties', () => {
    const listNode = new ListNode<IData>(mockData.d1);

    it('stores a reference to data in key', () => {
      expect(listNode.key).to.equal(mockData.d1);
    });

    it('stores a reference to other list nodes in prev and next', () => {
      listNode.next = new ListNode<IData>(mockData.d2);
      listNode.prev = new ListNode<IData>(mockData.d3);

      expect(listNode.next.key).to.equal(mockData.d2);
      expect(listNode.prev.key).to.equal(mockData.d3);
    });
  });

  describe('clear', () => {
    const listNode = new ListNode<IData>(mockData.d1);
    listNode.next = new ListNode<IData>(mockData.d2);
    listNode.prev = new ListNode<IData>(mockData.d3);

    it('removes all properties and references to other objects', () => {
      listNode.clear();

      expect(listNode.key).to.be.undefined;
      expect(listNode.next).to.be.undefined;
      expect(listNode.prev).to.be.undefined;
    });
  });
});

describe('LinkedList', () => {
  describe('insert', () => {
    const list = new LinkedList<IData>();

    it('will insert data', () => {
      list.insert(mockData.d1);
      expect(list.sentinel.next.key).to.equal(mockData.d1);
      expect(list.sentinel.prev.key).to.equal(mockData.d1);
    });

    it('will insert further nodes before the rest of the list', () => {
      list.insert(mockData.d2);
      list.insert(mockData.d3);
      expect(list.sentinel.next.key).to.equal(mockData.d3);
      expect(list.sentinel.next.next.key).to.equal(mockData.d2);
    });
  });

  describe('refresh', () => {
    const list = new LinkedList();

    list.insert(mockData.d1);
    list.insert(mockData.d2);
    list.insert(mockData.d3);

    it('will move data to the front of the list', () => {
      expect(list.sentinel.next.key).to.equal(mockData.d3);
      expect(list.sentinel.next.next.key).to.equal(mockData.d2);
      expect(list.sentinel.next.next.next.key).to.equal(mockData.d1);
      list.refresh(list.sentinel.next.next);
      expect(list.sentinel.next.key).to.equal(mockData.d2);
      expect(list.sentinel.next.next.key).to.equal(mockData.d3);
      expect(list.sentinel.next.next.next.key).to.equal(mockData.d1);
    });
  });

  describe('evict', () => {
    const list = new LinkedList();

    list.insert(mockData.d1);
    list.insert(mockData.d2);
    list.insert(mockData.d3);

    it('will remove the last node', () => {
      expect(list.sentinel.prev.key).to.equal(mockData.d1);
      list.evict();
      expect(list.sentinel.prev.key).to.equal(mockData.d2);
      expect(list.sentinel.next.next.next).to.equal(list.sentinel);
    });
  });

  describe('length', () => {
    const list = new LinkedList();

    list.insert(mockData.d1);
    list.insert(mockData.d2);
    list.insert(mockData.d3);

    it('will return the length of the list', () => {
      expect(list.length).to.equal(3);
      list.evict();
      expect(list.length).to.equal(2);
    });
  });
});

describe('CacheTree', () => {
  /**
   * Methods to test:
   *
   * get [X]
   * getCachedDataTree [X]
   * insert [X]
   * clone []
   * has []
   * getDiff []
   * clearCache []
   * getSize []
   */

  describe('getCachedDataTree', () => {
    const testCache = new CacheTree<IData, keyof IData>(hierarchy);

    it('will return a frozen copy of the private cacheTree property', () => {
      const dataTree = testCache.getCachedDataTree();

      expect(dataTree).to.be.an('object').and.is.empty.and.to.be.frozen;

      assign(dataTree, { foo: 'bar'});

      expect(has(dataTree, 'foo')).to.be.false;
    });
  });

  describe('insert', () => {
    const testCache = new CacheTree<IData, keyof IData>(hierarchy);

    it('will insert a data object', () => {
      const result = testCache.insert(mockData.d1);
      const path = map(hierarchy, (str) => mockData.d1[str]);
      const cacheLeaf: ListNode<IData> = getValue(result.getCachedDataTree(), path);

      expect(cacheLeaf.key).to.equal(mockData.d1);
    });

    it('will insert an array of data objects', () => {
      const data = [mockData.d2, mockData.d3];
      const result = testCache.insert(data);

      const path2 = map(hierarchy, (str) => mockData.d2[str]);
      const cacheLeaf2: ListNode<IData> = getValue(result.getCachedDataTree(), path2);

      expect(cacheLeaf2.key).to.equal(mockData.d2);

      const path3 = map(hierarchy, (str) => mockData.d3[str]);
      const cacheLeaf3: ListNode<IData> = getValue(result.getCachedDataTree(), path3);

      expect(cacheLeaf3.key).to.equal(mockData.d3);
    });
  });

  describe('get', () => {
    const testCache = new CacheTree<IData, keyof IData>(hierarchy);
    const insertData = [mockData.d1, mockData.d2, mockData.d3];
    testCache.insert(insertData);

    it('will return a single data object', () => {
      const filter = {
        age: 1,
        estimate: 1,
        location: 345,
        sex: 1,
        year: 1990,
      };

      const result = testCache.get(filter);

      expect(result).to.be.an('array');
      expect(result[0]).to.equal(mockData.d1).and.to.be.frozen;

      assign(result[0], { foo: 'bar'});

      expect(has(result[0], 'foo')).to.be.false;
    });

    it('will return an array of data objects by leaving off a filter parameter', () => {
      const filter = {
        age: 1,
        estimate: 1,
        location: 345,
        sex: 1,
      };

      const result = testCache.get(filter);

      expect(result).to.be.an('array').and.to.have.length(3);

      forEach(result, (resultData) => {
        expect(resultData).to.be.oneOf(insertData);
      });
    });

    it('will return an array of data objects by giving a filter parameter an array', () => {
      const filter = {
        age: 1,
        estimate: 1,
        location: 345,
        sex: 1,
        year: [1990, 2010],
      };

      const result = testCache.get(filter);

      expect(result).to.be.an('array').and.to.have.length(2);

      forEach(result, (resultData) => {
        expect(resultData).to.be.oneOf([insertData[0], insertData[2]]);
      });
    });
  });
});

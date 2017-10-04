/* tslint:disable no-unused-expression */

import { expect } from 'chai';

import LinkedList from '../src/linked-list';
import ListNode from '../src/list-node';

interface IData {
  age: number;
  estimate: number;
  key: string;
  location: number;
  sex: number;
  year: number;
}

const mockDatum1 = {
  age: 1,
  estimate: 1,
  key: 'brazil 1:1:1:1990:345',
  location: 345,
  sex: 1,
  year: 1990,
};

const mockDatum2 = {
  age: 1,
  estimate: 1,
  key: 'brazil 1:1:1:2000:345',
  location: 345,
  sex: 1,
  year: 2000,
};

const mockDatum3 = {
  age: 1,
  estimate: 1,
  key: 'brazil 1:1:1:2010:345',
  location: 345,
  sex: 1,
  year: 2010,
};

describe('ListNode', () => {
  describe('properties', () => {
    const listNode = new ListNode<IData>(mockDatum1);

    it('stores a reference to data in key', () => {
      expect(listNode.key).to.equal(mockDatum1);
    });

    it('stores a reference to other list nodes in prev and next', () => {
      listNode.next = new ListNode<IData>(mockDatum2);
      listNode.prev = new ListNode<IData>(mockDatum3);

      expect(listNode.next.key).to.equal(mockDatum2);
      expect(listNode.prev.key).to.equal(mockDatum3);
    });
  });

  describe('clear', () => {
    const listNode = new ListNode<IData>(mockDatum1);
    listNode.next = new ListNode<IData>(mockDatum2);
    listNode.prev = new ListNode<IData>(mockDatum3);

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
      list.insert(mockDatum1);
      expect(list.sentinel.next.key).to.equal(mockDatum1);
      expect(list.sentinel.prev.key).to.equal(mockDatum1);
    });

    it('will insert further nodes before the rest of the list', () => {
      list.insert(mockDatum2);
      list.insert(mockDatum3);
      expect(list.sentinel.next.key).to.equal(mockDatum3);
      expect(list.sentinel.next.next.key).to.equal(mockDatum2);
    });
  });

  describe('refresh', () => {
    const list = new LinkedList();

    list.insert(mockDatum1);
    list.insert(mockDatum2);
    list.insert(mockDatum3);

    it('will move data to the front of the list', () => {
      expect(list.sentinel.next.key).to.equal(mockDatum3);
      expect(list.sentinel.next.next.key).to.equal(mockDatum2);
      expect(list.sentinel.next.next.next.key).to.equal(mockDatum1);
      list.refresh(list.sentinel.next.next);
      expect(list.sentinel.next.key).to.equal(mockDatum2);
      expect(list.sentinel.next.next.key).to.equal(mockDatum3);
      expect(list.sentinel.next.next.next.key).to.equal(mockDatum1);
    });
  });

  describe('evict', () => {
    const list = new LinkedList();

    list.insert(mockDatum1);
    list.insert(mockDatum2);
    list.insert(mockDatum3);

    it('will remove the last node', () => {
      expect(list.sentinel.prev.key).to.equal(mockDatum1);
      list.evict();
      expect(list.sentinel.prev.key).to.equal(mockDatum2);
      expect(list.sentinel.next.next.next).to.equal(list.sentinel);
    });
  });

  describe('length', () => {
    const list = new LinkedList();

    list.insert(mockDatum1);
    list.insert(mockDatum2);
    list.insert(mockDatum3);

    it('will return the length of the list', () => {
      expect(list.length).to.equal(3);
      list.evict();
      expect(list.length).to.equal(2);
    });
  });
});

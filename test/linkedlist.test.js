/* eslint-disable no-unused-expressions, max-len, no-use-before-define, no-underscore-dangle, camelcase  */

import { expect } from 'chai';

import { LinkedList, ListNode } from '../linkedlist';

describe('LinkedList', () => {
  describe('Initial LinkedList', () => {
    const list = new LinkedList();
    it('will have a properties called head and tail', () => {
      expect(list.head.key).to.equal('head');
      expect(list.tail.key).to.equal('tail');
      expect(list.head.next).to.equal(list.tail);
      expect(list.tail.prev).to.equal(list.head);
    });
  });

  describe('insert', () => {
    const list = new LinkedList();
    it('will insert a node after head and before tail', () => {
      const node_a = new ListNode();
      list.insert(node_a);
      expect(list.head.next).to.equal(node_a);
      expect(list.tail.prev).to.equal(node_a);
    });

    it('will insert further nodes after head and before the rest of the list', () => {
      const node_b = new ListNode();
      const node_c = new ListNode();
      list.insert(node_b);
      list.insert(node_c);
      expect(list.head.next).to.equal(node_c);
      expect(list.head.next.next).to.equal(node_b);
    });

    it('will set a reference to the data in the node', () => {
      const data = { info: 'Data' };
      const node_d = new ListNode(data);
      list.insert(node_d);
      expect(node_d).to.have.property('key');
      expect(node_d.key).to.equal(data);
    });
  });

  describe('refresh', () => {
    it('will move data to the front of the list', () => {
      const list = new LinkedList();
      const node_a = new ListNode();
      const node_b = new ListNode();
      const node_c = new ListNode();
      list.insert(node_a);
      list.insert(node_b);
      list.insert(node_c);
      expect(list.head.next).to.equal(node_c);
      expect(node_c.next).to.equal(node_b);
      expect(node_b.next).to.equal(node_a);
      list.refresh(node_b);
      expect(list.head.next).to.equal(node_b);
      expect(node_b.next).to.equal(node_c);
      expect(node_c.next).to.equal(node_a);
    });
  });

  describe('length', () => {
    const list = new LinkedList();
    const data_a = { info: 'A' };
    const data_b = { info: 'B' };
    const data_c = { info: 'C' };
    list.insert(data_a);
    list.insert(data_b);
    list.insert(data_c);

    it('will return the length of the list', () => {
      expect(list.length).to.equal(3);
    });
  });

  describe('evict', () => {
    const list = new LinkedList();
    const node_a = new ListNode();
    const node_b = new ListNode();
    const node_c = new ListNode();
    list.insert(node_a);
    list.insert(node_b);
    list.insert(node_c);
    it('will remove the last node before the tail of the list', () => {
      expect(list.tail.prev).to.equal(node_a);
      list.evict();
      expect(list.tail.prev).to.equal(node_b);
      expect(node_b.next).to.equal(list.tail);
    });
  });
});

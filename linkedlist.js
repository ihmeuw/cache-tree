export class ListNode {
  constructor(key = null, prev = null, next = null) {
    this.key = key;
    this.prev = prev;
    this.next = next;
  }

  clear() {
    this.key = null;
    this.prev = null;
    this.next = null;
  }
}

export class LinkedList {
  constructor(maxLength = 100000) {
    this.head = new ListNode('head');
    this.tail = new ListNode('tail');

    this.head.next = this.tail;
    this.tail.prev = this.head;

    this.length = 0;
    this.maxLength = maxLength;
  }

  // insert node after head
  insert(node) {
    const nodeRef = node;

    nodeRef.prev = this.head;
    nodeRef.next = this.head.next;

    this.head.next.prev = nodeRef;
    this.head.next = nodeRef;

    this.length += 1;
  }

  // move node to after head
  refresh(node) {
    const nodeRef = node;

    nodeRef.prev.next = nodeRef.next;
    nodeRef.next.prev = nodeRef.prev;

    nodeRef.prev = this.head;
    nodeRef.next = this.head.next;

    this.head.next.prev = nodeRef;
    this.head.next = nodeRef;
  }

  // remove node before tail
  evict() {
    const evicted = this.tail.prev;

    this.tail.prev = evicted.prev;
    this.tail.prev.next = this.tail;
    evicted.clear();

    this.length -= 1;
  }

  // utility and testing method
  traverseSize() {
    let count = 0;
    let node = this.head.next;
    while (node.next !== null) {
      count += 1;
      node = node.next;
    }
    return count;
  }
}

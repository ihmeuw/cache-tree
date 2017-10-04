import ListNode from './list-node';

export default class LinkedList<T> {
  sentinel: ListNode<T>;
  length: number;
  maxLength: number;

  constructor(maxLength: number = 100000) {
    this.sentinel = new ListNode(null);

    this.sentinel.next = this.sentinel;
    this.sentinel.prev = this.sentinel;

    this.length = 0;
    this.maxLength = maxLength;
  }

  // insert node as sentinel next
  insert(data: T) {
    const newNode = new ListNode(Object.freeze(data));

    newNode.prev = this.sentinel;
    newNode.next = this.sentinel.next;

    this.sentinel.next.prev = newNode;
    this.sentinel.next = newNode;

    this.length += 1;
  }

  // move node to sentinel next
  refresh(node: ListNode<T>) {
    node.prev.next = node.next;
    node.next.prev = node.prev;

    node.prev = this.sentinel;
    node.next = this.sentinel.next;

    this.sentinel.next.prev = node;
    this.sentinel.next = node;
  }

  // remove node previous to sentinel
  evict() {
    const evicted = this.sentinel.prev;

    this.sentinel.prev = evicted.prev;
    this.sentinel.prev.next = this.sentinel;
    evicted.clear();

    this.length -= 1;
  }
}

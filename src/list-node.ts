export default class ListNode<T> {
  key: T | null;
  prev: ListNode<T>;
  next: ListNode<T>;

  constructor(key: T | null) {
    this.key = key;
  }

  clear() {
    delete this.key;
    delete this.prev;
    delete this.next;
  }
}

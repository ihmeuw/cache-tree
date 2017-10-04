import ListNode from './list-node';

export default class Sentinel<T> extends ListNode<T> {
  next: ListNode<T>;
  prev: ListNode<T>;
}

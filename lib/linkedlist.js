'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ListNode = exports.ListNode = function () {
  function ListNode() {
    var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var prev = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var next = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, ListNode);

    this.key = key;
    this.prev = prev;
    this.next = next;
  }

  _createClass(ListNode, [{
    key: 'clear',
    value: function clear() {
      this.key = null;
      this.prev = null;
      this.next = null;
    }
  }]);

  return ListNode;
}();

var LinkedList = exports.LinkedList = function () {
  function LinkedList() {
    var maxLength = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100000;

    _classCallCheck(this, LinkedList);

    this.head = new ListNode('head');
    this.tail = new ListNode('tail');

    this.head.next = this.tail;
    this.tail.prev = this.head;

    this.length = 0;
    this.maxLength = maxLength;
  }

  // insert node after head


  _createClass(LinkedList, [{
    key: 'insert',
    value: function insert(node) {
      var nodeRef = node;

      nodeRef.prev = this.head;
      nodeRef.next = this.head.next;

      this.head.next.prev = nodeRef;
      this.head.next = nodeRef;

      this.length += 1;
    }

    // move node to after head

  }, {
    key: 'refresh',
    value: function refresh(node) {
      var nodeRef = node;

      nodeRef.prev.next = nodeRef.next;
      nodeRef.next.prev = nodeRef.prev;

      nodeRef.prev = this.head;
      nodeRef.next = this.head.next;

      this.head.next.prev = nodeRef;
      this.head.next = nodeRef;
    }

    // delete node

  }, {
    key: 'delete',
    value: function _delete(node) {
      var nodeRef = node;

      nodeRef.next.prev = nodeRef.prev;
      nodeRef.prev.next = nodeRef.next;
      nodeRef.clear();

      this.length -= 1;
    }

    // remove node before tail

  }, {
    key: 'evict',
    value: function evict() {
      var evicted = this.tail.prev;

      this.tail.prev = evicted.prev;
      this.tail.prev.next = this.tail;
      evicted.clear();

      this.length -= 1;
    }

    // utility and testing method

  }, {
    key: 'traverseSize',
    value: function traverseSize() {
      var count = 0;
      var node = this.head.next;
      while (node.next !== null) {
        count += 1;
        node = node.next;
      }
      return count;
    }
  }]);

  return LinkedList;
}();
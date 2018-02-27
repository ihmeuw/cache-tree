var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import CacheTree from '../cachetree.js';
import { dataGen } from './data-gen.js';

var dataProps = ['foo', 'bar', 'baz'];
var bigDataProps = ['one', 'two', 'three', 'four', 'five', 'six'];

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      cache: new CacheTree(props.dataProps, 125),
      data: [],
      diff: {},
      hasData: "? ?",
      bigCache: new CacheTree(props.bigDataProps)
    };

    _this.addData = _this.addData.bind(_this);
    _this.addBigData = _this.addBigData.bind(_this);
    _this.getDiff = _this.getDiff.bind(_this);
    _this.getData = _this.getData.bind(_this);
    _this.hasData = _this.hasData.bind(_this);
    return _this;
  }

  _createClass(App, [{
    key: 'addData',
    value: function addData() {
      var fooData = this.fooRef.value.split(/\s*;\s*/);
      var barData = this.barRef.value.split(/\s*;\s*/);
      var bazData = this.bazRef.value.split(/\s*;\s*/);

      var data = dataGen({ foo: fooData, bar: barData, baz: bazData });

      this.state.cache.set(data);

      this.setState({
        cache: this.state.cache.clone()
      });
    }
  }, {
    key: 'addBigData',
    value: function addBigData() {
      var params = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
      var filter = this.props.bigDataProps.reduce(function (acc, prop) {
        acc[prop] = params;
        return acc;
      }, {});

      var data = dataGen(filter);
      this.state.bigCache.set(data);

      this.setState({
        bigCache: this.state.bigCache.clone()
      });
    }
  }, {
    key: 'getData',
    value: function getData() {
      var fooData = this.fooRef.value.split(/\s*;\s*/);
      var barData = this.barRef.value.split(/\s*;\s*/);
      var bazData = this.bazRef.value.split(/\s*;\s*/);

      var data = this.state.cache.get({ foo: fooData, bar: barData, baz: bazData });

      this.setState({
        data: data
      });
    }
  }, {
    key: 'getDiff',
    value: function getDiff() {
      var fooData = this.fooRef.value.split(/\s*;\s*/);
      var barData = this.barRef.value.split(/\s*;\s*/);
      var bazData = this.bazRef.value.split(/\s*;\s*/);

      var diff = this.state.cache.getDiff({ foo: fooData, bar: barData, baz: bazData });

      this.setState({
        diff: diff
      });
    }
  }, {
    key: 'hasData',
    value: function hasData() {
      var fooData = this.fooRef.value.split(/\s*;\s*/);
      var barData = this.barRef.value.split(/\s*;\s*/);
      var bazData = this.bazRef.value.split(/\s*;\s*/);

      var hasData = this.state.cache.has({ foo: fooData, bar: barData, baz: bazData });

      this.setState({
        hasData: hasData ? 'tru' : 'false'
      });
    }
  }, {
    key: 'showData',
    value: function showData() {
      return this.state.data.map(function (datum, i) {
        return React.createElement(
          'div',
          { key: i },
          JSON.stringify(datum)
        );
      });
    }
  }, {
    key: 'showDiff',
    value: function showDiff() {
      var _this2 = this;

      var keys = Object.keys(this.state.diff);

      return keys.map(function (key, i) {
        return React.createElement(
          'div',
          { key: i },
          key + ': ' + JSON.stringify(_this2.state.diff[key])
        );
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return React.createElement(
        'div',
        null,
        React.createElement(
          'h1',
          null,
          'CacheTree'
        ),
        React.createElement(
          'div',
          null,
          'foo:',
          React.createElement('input', {
            ref: function ref(input) {
              _this3.fooRef = input;
            },
            type: 'text'
          })
        ),
        React.createElement(
          'div',
          null,
          'bar:',
          React.createElement('input', {
            ref: function ref(input) {
              _this3.barRef = input;
            },
            type: 'text'
          })
        ),
        React.createElement(
          'div',
          null,
          'baz:',
          React.createElement('input', {
            ref: function ref(input) {
              _this3.bazRef = input;
            },
            type: 'text'
          })
        ),
        React.createElement(
          'div',
          { className: 'things' },
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                {
                  onClick: this.addData
                },
                'Add Data'
              )
            ),
            'cache size: ',
            this.state.cache.getSize()
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                {
                  onClick: this.getData
                },
                'Get Data'
              )
            ),
            React.createElement(
              'div',
              null,
              'data:'
            ),
            this.showData()
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                {
                  onClick: this.hasData
                },
                'Has Data?'
              )
            ),
            'I has data? ',
            this.state.hasData
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                {
                  onClick: this.getDiff
                },
                'Get Diff'
              )
            ),
            React.createElement(
              'div',
              null,
              'diff:'
            ),
            this.showDiff()
          )
        ),
        React.createElement(
          'h2',
          null,
          'Big Cache'
        ),
        React.createElement(
          'div',
          { className: 'things' },
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                {
                  onClick: this.addBigData
                },
                'Add Big Data'
              )
            ),
            'big cache size: ',
            this.state.bigCache.getSize()
          )
        )
      );
    }
  }]);

  return App;
}(React.Component);

ReactDOM.render(React.createElement(App, {
  dataProps: dataProps,
  bigDataProps: bigDataProps
}), document.getElementById('page'));
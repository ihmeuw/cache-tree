var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import CacheTree from '../cachetree.js';
import { dataGen } from './data-gen.js';

var dataProps = ['foo', 'bar', 'baz'];

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.cache = new CacheTree(props.dataProps, 343000);

    _this.state = {
      cache: _this.cache,
      data: [],
      diff: {},
      hasData: "? ?"
    };

    _this.addData = _this.addData.bind(_this);
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

      this.cache.set(data);

      this.setState({
        cache: this.cache.clone()
      });
    }
  }, {
    key: 'getData',
    value: function getData() {
      var fooData = this.fooRef.value.split(/\s*;\s*/);
      var barData = this.barRef.value.split(/\s*;\s*/);
      var bazData = this.bazRef.value.split(/\s*;\s*/);

      var data = this.cache.get({ foo: fooData, bar: barData, baz: bazData });

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

      var diff = this.cache.getDiff({ foo: fooData, bar: barData, baz: bazData });

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

      var hasData = this.cache.has({ foo: fooData, bar: barData, baz: bazData });

      this.setState({
        hasData: hasData ? 'tru' : 'flase'
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

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
              _this2.fooRef = input;
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
              _this2.barRef = input;
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
              _this2.bazRef = input;
            },
            type: 'text'
          })
        ),
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
          React.createElement(
            'button',
            {
              onClick: this.hasData
            },
            'Has Data?'
          )
        ),
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
          'cache size: ',
          this.state.cache.getSize()
        ),
        React.createElement(
          'div',
          null,
          'data: ',
          JSON.stringify(this.state.data)
        ),
        React.createElement(
          'div',
          null,
          'I has data? ',
          this.state.hasData
        ),
        React.createElement(
          'div',
          null,
          'diff: ',
          JSON.stringify(this.state.diff)
        )
      );
    }
  }]);

  return App;
}(React.Component);

ReactDOM.render(React.createElement(App, {
  dataProps: dataProps
}), document.getElementById('page'));
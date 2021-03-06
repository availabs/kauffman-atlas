'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scrollspy = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Scrollspy = exports.Scrollspy = function (_React$Component) {
  _inherits(Scrollspy, _React$Component);

  _createClass(Scrollspy, null, [{
    key: 'PropTypes',
    get: function get() {
      return {
        items: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string).isRequired,
        currentClassName: _react2.default.PropTypes.string.isRequired
      };
    }
  }, {
    key: 'defaultProps',
    get: function get() {
      return {
        items: [],
        currentClassName: ''
      };
    }
  }]);

  function Scrollspy(props) {
    _classCallCheck(this, Scrollspy);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Scrollspy).call(this, props));

    _this.state = {
      targetItems: [],
      inViewState: []
    };
    // manually bind as ES6 does not apply this
    // auto binding as React.createClass does
    _this._handleSpy = _this._handleSpy.bind(_this);
    return _this;
  }

  _createClass(Scrollspy, [{
    key: '_initSpyTarget',
    value: function _initSpyTarget(items) {
      
      var targetItems = items.map(function (item) {
        console.log('item', item, document.getElementById(item));
        return document.getElementById(item);
      });

      return targetItems;
    }
  }, {
    key: '_getElemsViewState',
    value: function _getElemsViewState(targets) {
      var elemsInView = [];
      var elemsOutView = [];
      var viewStatusList = [];

      var targetItems = targets ? targets : this.state.targetItems;

      var hasInViewAlready = false;

      for (var i = 0, max = targetItems.length; i < max; i++) {
        var currentContent = targetItems[i];
        var isInView = hasInViewAlready ? false : this._isInView(currentContent);

        if (isInView) {
          hasInViewAlready = true;
          elemsInView.push(currentContent);
        } else {
          elemsOutView.push(currentContent);
        }

        viewStatusList.push(isInView);
      }

      return {
        inView: elemsInView,
        outView: elemsOutView,
        viewStatusList: viewStatusList
      };
    }
  }, {
    key: '_isInView',
    value: function _isInView(el) {
      if(el){
        var rect = el.getBoundingClientRect();
        var winH = window.innerHeight;
        var doc = document;
        var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
        var scrollBottom = scrollTop + winH;
        var elTop = rect.top + scrollTop;
        var elBottom = elTop + el.offsetHeight;

        return elTop < scrollBottom && elBottom > scrollTop;
      }
      return false
    }
  }, {
    key: '_spy',
    value: function _spy(targets) {
      this.setState({
        inViewState: this._getElemsViewState(targets).viewStatusList
      });
    }
  }, {
    key: '_handleSpy',
    value: function _handleSpy() {
      var timer = void 0;

      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timer = setTimeout(this._spy.bind(this), 100);
    }
  }, {
    key: '_initFromProps',
    value: function _initFromProps() {
      var targetItems = this._initSpyTarget(this.props.items);

      this.setState({
        targetItems: targetItems
      });
      console.log('targeting',targetItems)
      this._spy(targetItems);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._initFromProps();
      window.addEventListener('scroll', this._handleSpy);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('scroll', this._handleSpy);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps() {
      window.removeEventListener('scroll', this._handleSpy);
      window.addEventListener('scroll', this._handleSpy);
      this._initFromProps();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var counter = 0;
      var items = _react2.default.Children.map(this.props.children, function (child, idx) {
        return _react2.default.cloneElement(child, {
          className: (child.props.className ? child.props.className : '') + (_this2.state.inViewState[idx] ? ' ' + _this2.props.currentClassName : ''),
          key: counter++
        });
      });

      return _react2.default.createElement(
        'ul',
        { className: this.props.className ? this.props.className : '' },
        items
      );
    }
  }]);

  return Scrollspy;
}(_react2.default.Component);

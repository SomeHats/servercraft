'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MinecraftServerStatus = undefined;

var _net = require('net');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _protocol = require('./protocol');

var p = _interopRequireWildcard(_protocol);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _debug2.default)('servercraft:query');

var TimeoutError = function (_Error) {
  _inherits(TimeoutError, _Error);

  function TimeoutError() {
    _classCallCheck(this, TimeoutError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TimeoutError).apply(this, arguments));
  }

  return TimeoutError;
}(Error);

;

var MinecraftServerStatus = exports.MinecraftServerStatus = function () {
  function MinecraftServerStatus(host) {
    var port = arguments.length <= 1 || arguments[1] === undefined ? 25565 : arguments[1];

    _classCallCheck(this, MinecraftServerStatus);

    this.host = host;
    this.port = port;
  }

  _createClass(MinecraftServerStatus, [{
    key: 'getStatus',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var _ref, packetId, data, _p$readString, _p$readString2, str;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.request(p.status());

              case 2:
                _ref = _context.sent;
                packetId = _ref.packetId;
                data = _ref.data;

                if (!(packetId !== 0)) {
                  _context.next = 7;
                  break;
                }

                throw new Error('Received invalid status response: ' + packetId);

              case 7:
                _p$readString = p.readString(data);
                _p$readString2 = _slicedToArray(_p$readString, 1);
                str = _p$readString2[0];
                return _context.abrupt('return', JSON.parse(str));

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function getStatus() {
        return ref.apply(this, arguments);
      };
    }()
  }, {
    key: 'ping',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var _ref2, packetId, data;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return this.request(p.ping());

              case 3:
                _ref2 = _context2.sent;
                packetId = _ref2.packetId;
                data = _ref2.data;

                if (!(packetId !== 1)) {
                  _context2.next = 8;
                  break;
                }

                throw new Error('Received invalid ping response: ' + packetId);

              case 8:
                return _context2.abrupt('return', true);

              case 11:
                _context2.prev = 11;
                _context2.t0 = _context2['catch'](0);
                return _context2.abrupt('return', false);

              case 14:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 11]]);
      }));

      return function ping() {
        return ref.apply(this, arguments);
      };
    }()
  }, {
    key: 'request',
    value: function request(payload) {
      var _this2 = this;

      var timeout = arguments.length <= 1 || arguments[1] === undefined ? 5000 : arguments[1];

      return new Promise(function (resolve, reject) {
        var socket = (0, _net.createConnection)(_this2.port, _this2.host);
        socket.setTimeout(timeout);

        socket._oldWrite = socket.write;
        socket.write = function (data, enc, cb) {
          debug('write', data);
          socket._oldWrite(data, enc, cb);
        };

        socket.on('connect', function () {
          debug('connect', { port: _this2.port, host: _this2.host });
          socket.write(p.handshake(_this2.host, _this2.port));
          socket.write(payload);
        });

        socket.on('data', function (d) {
          debug('data', d);
          resolve(p.readPacket(d));
          socket.end();
        });

        socket.on('timeout', function () {
          reject(new TimeoutError('Connection timed out after ' + timeout + 'ms.'));
          socket.end();
        });

        socket.on('error', reject);
        socket.on('close', function (hasError) {
          debug('close', { hasError: hasError });
        });
      });
    }
  }]);

  return MinecraftServerStatus;
}();

var main = function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var server;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            server = new MinecraftServer('dytry.ch');
            _context3.next = 3;
            return server.ping();

          case 3:
            if (!_context3.sent) {
              _context3.next = 11;
              break;
            }

            _context3.t0 = console;
            _context3.next = 7;
            return server.getStatus();

          case 7:
            _context3.t1 = _context3.sent;

            _context3.t0.log.call(_context3.t0, _context3.t1);

            _context3.next = 12;
            break;

          case 11:
            console.log('Server is down');

          case 12:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function main() {
    return ref.apply(this, arguments);
  };
}();

main();

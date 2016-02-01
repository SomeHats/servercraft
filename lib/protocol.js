"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
var varint = exports.varint = function varint(value) {
  var bytes = [],
      remaining = value;

  for (var i = 0; i < 5; i++) {
    if ((remaining & ~0x7F) === 0) {
      bytes.push(remaining);
      return new Buffer(bytes);
    }
    bytes.push(remaining & 0x7f | 0x80);
    remaining >>= 7;
  }

  throw new Error("Value " + value + " is too big to send in a varint");
};

var readVarint = exports.readVarint = function readVarint(buffer) {
  var idx = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var result = 0;
  for (var i = 0; i < 5; i++) {
    var part = buffer[i + idx];
    result |= (part & 0x7F) << 7 * i;
    if (!(part & 0x80)) return [result, idx + i + 1];
  }

  throw new Error("Serversent a too big varint");
};

// short
var int16 = exports.int16 = function int16(value) {
  var buf = new Buffer(2);
  buf.writeInt16BE(value, 0);
  return buf;
};

// int
var int32 = exports.int32 = function int32(value) {
  var buf = new Buffer(4);
  buf.writeInt32BE(value, 0);
  return buf;
};

// long
var int64 = exports.int64 = function int64(value) {
  var buf = new Buffer(8);
  buf.writeInt32BE(value >> 8, 0);
  buf.writeInt32BE(value & 0x00FF, 4);
  return buf;
};

var buffer = exports.buffer = function buffer(data) {
  return Buffer.concat([varint(data.length), data]);
};
var readBuffer = exports.readBuffer = function readBuffer(buffer) {
  var start = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var _readVarint = readVarint(buffer, start);

  var _readVarint2 = _slicedToArray(_readVarint, 2);

  var length = _readVarint2[0];
  var idx = _readVarint2[1];

  return [buffer.slice(idx, idx + length), idx + length];
};

var string = exports.string = function string(value) {
  return buffer(new Buffer(value));
};
var readString = exports.readString = function readString(buffer) {
  var start = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var _readBuffer = readBuffer(buffer, start);

  var _readBuffer2 = _slicedToArray(_readBuffer, 2);

  var buf = _readBuffer2[0];
  var idx = _readBuffer2[1];

  return [buf.toString(), idx];
};

var packet = exports.packet = function packet(buffers) {
  return buffer(Buffer.concat(buffers));
};
var readPacket = exports.readPacket = function readPacket(packet) {
  var _readBuffer3 = readBuffer(packet);

  var _readBuffer4 = _slicedToArray(_readBuffer3, 1);

  var payload = _readBuffer4[0];

  var _readVarint3 = readVarint(payload);

  var _readVarint4 = _slicedToArray(_readVarint3, 2);

  var packetId = _readVarint4[0];
  var dataStart = _readVarint4[1];
  var data = payload.slice(dataStart, payload.length);

  return { data: data, packetId: packetId };
};

// High level:
var handshake = exports.handshake = function handshake(host, port) {
  var version = arguments.length <= 2 || arguments[2] === undefined ? 47 : arguments[2];
  return packet([varint(0), varint(version), string(host), int16(port), varint(1)]);
};

var ping = exports.ping = function ping() {
  var pingId = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  return packet([varint(1), int64(pingId = pingId || Math.floor(Math.random() * (Math.pow(2, 32) - 1)))]);
};

var status = exports.status = function status() {
  return packet([varint(0)]);
};

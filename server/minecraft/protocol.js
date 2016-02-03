export const varint = (value) => {
  let bytes = [],
      remaining = value;

  for (let i = 0; i < 5; i++) {
    if ((remaining & ~0x7F) === 0) {
      bytes.push(remaining);
      return new Buffer(bytes);
    }
    bytes.push(remaining & 0x7f | 0x80);
    remaining >>= 7;
  }

  throw new Error(`Value ${value} is too big to send in a varint`);
};

export const readVarint = (buffer, idx = 0) => {
  let result = 0;
  for (let i = 0; i < 5; i++) {
    let part = buffer[i + idx];
    result |= (part & 0x7F) << 7 * i;
    if (!(part & 0x80)) return [result, idx + i + 1];
  }

  throw new Error(`Serversent a too big varint`);
};

// short
export const int16 = (value) => {
  let buf = new Buffer(2);
  buf.writeInt16BE(value, 0);
  return buf;
};

// int
export const int32 = (value) => {
  let buf = new Buffer(4);
  buf.writeInt32BE(value, 0);
  return buf;
};

// long
export const int64 = (value) => {
  let buf = new Buffer(8);
  buf.writeInt32BE(value >> 8, 0);
  buf.writeInt32BE(value & 0x00FF, 4);
  return buf;
};

export const buffer = (data) => Buffer.concat([varint(data.length), data]);
export const readBuffer = (buffer, start = 0) => {
  let [length, idx] = readVarint(buffer, start);
  return [buffer.slice(idx, idx + length), idx + length];
};

export const string = (value) => buffer(new Buffer(value));
export const readString = (buffer, start = 0) => {
  let [buf, idx] = readBuffer(buffer, start);
  return [buf.toString(), idx];
};

export const packet = (buffers) => buffer(Buffer.concat(buffers));
export const readPacket = (packet) => {
  let [payload] = readBuffer(packet),
      [packetId, dataStart] = readVarint(payload),
      data = payload.slice(dataStart, payload.length);

  return {data, packetId};
};

// High level:
export const handshake = (host, port, version = 47) => packet([
  varint(0),
  varint(version),
  string(host),
  int16(port),
  varint(1)
]);

export const ping = (pingId = null) => packet([
  varint(1),
  int64(pingId = pingId || Math.floor(Math.random() * ((2 ** 32) - 1))),
]);

export const status = () => packet([varint(0)]);

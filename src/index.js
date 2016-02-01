import {createConnection} from 'net';
import createDebug from 'debug';
import * as p from './protocol';

const debug = createDebug('servercraft:query');

class TimeoutError extends Error {};

export class MinecraftServerStatus {
  constructor(host, port = 25565) {
    this.host = host;
    this.port = port;
  }

  async getStatus() {
    let {packetId, data} = await this.request(p.status());
    if (packetId !== 0) {
      throw new Error(`Received invalid status response: ${packetId}`);
    }

    let [str] = p.readString(data);
    return JSON.parse(str);
  }

  async ping() {
    try {
      let {packetId, data} = await this.request(p.ping());
      if (packetId !== 1) {
        throw new Error(`Received invalid ping response: ${packetId}`);
      }
      return true;
    } catch(e) {
      return false;
    }
  }

  request(payload, timeout = 5000) {
    return new Promise((resolve, reject) => {
      let socket = createConnection(this.port, this.host);
      socket.setTimeout(timeout);

      socket._oldWrite = socket.write;
      socket.write = (data, enc, cb) => {
        debug('write', data);
        socket._oldWrite(data, enc, cb);
      };

      socket.on('connect', () => {
        debug('connect', {port: this.port, host: this.host});
        socket.write(p.handshake(this.host, this.port));
        socket.write(payload);
      });

      socket.on('data', (d) => {
        debug('data', d);
        resolve(p.readPacket(d));
        socket.end();
      });

      socket.on('timeout', () => {
        reject(new TimeoutError(`Connection timed out after ${timeout}ms.`));
        socket.end();
      });

      socket.on('error', reject);
      socket.on('close', (hasError) => {
        debug('close', {hasError});
      });
    });
  }
}

async function main() {
  let server = new MinecraftServer('dytry.ch');
  if (await server.ping()) {
    console.log(await server.getStatus());
  } else {
    console.log('Server is down');
  }
}

main();

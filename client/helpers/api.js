import http from 'axios';
import SockJS from 'sockjs-client';
import UserStore from '../stores/user-store';
import EventEmitter from 'events';

const addToken = (config = {}) => {
  if (UserStore.token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${UserStore.token}`;
  }

  return config;
};

export const request = (config = {}) => http(addToken(config));
export const get = (url, config = {}) => http.get(url, addToken(config));
export const del = (url, config = {}) => http.delete(url, addToken(config));
export const head = (url, config = {}) => http.head(url, addToken(config));
export const post = (url, data, config = {}) => http.post(url, data, addToken(config));
export const put = (url, data, config = {}) => http.put(url, data, addToken(config));
export const patch = (url, data, config = {}) => http.patch(url, data, addToken(config));

let sockPromise;
const getSock = () => {
  if (sockPromise) return sockPromise;
  if (!UserStore.token) throw 'Cannot connect websocket without being logged in';

  return sockPromise = new Promise((resolve, reject) => {
    let sock = new SockJS(`/api/realtime?token=${UserStore.token}`);
    sock.onopen = () => {
      console.log('open');
      sock.events.emit('_open');
      resolve(sock);
    };

    sock.onclose = () => {
      console.log('close');
      sock.events.emit('_close');
      unsubscribe();
      sock.events.removeAllListeners();
      reject('Error establishing connection');
      sockPromise = null;
    };

    let unsubscribe = UserStore.listen(({loggedIn}) => {
      if (loggedIn === false) {
        sock.close();
      }
    });

    sock.events = new EventEmitter();
    sock.onmessage = ({data}) => {
      data = JSON.parse(data);
      console.log('message', data);
      let args = data.args || [];
      sock.events.emit(data.event, ...args);
    };
  });
};

export const subscribe = async (event, handler) => {
  let sock = await getSock();
  sock.send(JSON.stringify({type: 'subscribe', event}));
  sock.events.on(event, handler);

  return () => {
    sock.send(JSON.stringify({type: 'unsubscribe', event}));
    sock.events.removeListener(event, handler);
  };
}

let idCounter = 0;
export const realtime = (url, data, progressHandler) => new Promise(async (resolve, reject) => {
  let sock = await getSock();
  const clientId = idCounter++;
  sock.send(JSON.stringify({type: 'request', clientId, url, data}));

  let completedHandler = (data) => {
    removeListeners();
    resolve(data);
  };

  let failedHandler = (err) => {
    removeListeners();
    reject(err);
  };

  let closeHandler = () => {
    removeListeners();
    reject('Socket closed before request completed');
  };

  sock.events.on(`req:${clientId}:progress`, progressHandler);
  sock.events.on(`req:${clientId}:completed`, completedHandler);
  sock.events.on(`req:${clientId}:failed`, failedHandler);
  sock.events.on(`_close`, closeHandler);

  let removeListeners = () => {
    sock.events.removeListener(`req:${clientId}:progress`, progressHandler);
    sock.events.removeListener(`req:${clientId}:completed`, completedHandler);
    sock.events.removeListener(`req:${clientId}:failed`, failedHandler);
    sock.events.removeListener(`_close`, closeHandler);
  };
});

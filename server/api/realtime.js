import sockjs from 'sockjs';
import createDebug from 'debug';

let debug = createDebug('servercraft:api:realtime');

let sock = sockjs.createServer({
  sockjs_url: '//cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
});

sock.on('connection', conn => {
  debug('connection', conn);
  let accept = false;
  let authPromise = sock.checkAuth(conn)
    .then(() => {
      accept = true;
    })
    .catch(() => {
      conn.close();
    });

  conn.send = (event, ...args) => conn.write(JSON.stringify({event, args}));

  conn.on('close', () => debug('close', conn));
  conn.on('data', async (message) => {
    debug('data', conn, message);
    await authPromise;
    if (!accept) return;

    let request = JSON.parse(message);

    if (request.type === 'subscribe') {
      // TODO
    } else if (request.type === 'unsubscribe') {
      // TODO
    } else if (request.type === 'request') {
      let {clientId, url, data} = request;
      processRequest(conn, clientId, url, data);
    }
  });
});

async function processRequest(connection, clientId, url, data) {
  let handler = getHandler(url);
  let progressHandler = (progress) => {
    connection.send(`req:${clientId}:progress`, progress);
  };

  try {
    let response = await handler(data, connection, progressHandler);
    debug('req-completed', response);
    connection.send(`req:${clientId}:completed`, response);
  } catch(error) {
    debug('req-failed', error);
    connection.send(`req:${clientId}:failed`, formatError(error));
  }
}

function formatError(err) {
  let status = err.status || err.statusCode || 500;
  if (status < 400) status = 500;

  let body = {status};
  if (process.env.NODE_ENV !== 'production') body.stack = err.stack;

  if (status >= 500) {
    console.error(err.stack);
    body.message = 'Internal server error';
    return body;
  }

  body.message = err.message;
  if (err.code) body.code = err.code;
  if (err.name) body.name = err.name;
  if (err.type) body.type = err.type;

  return body;
}

let urls = {};
function getHandler(url) {
  return urls[url] || (() => { throw `No handler found for ${url}`; });
}

export const on = (url, handler) => {
  urls[url] = handler;
};

export const attach = (server, checkAuth) => {
  sock.installHandlers(server, {prefix: '/api/realtime'});
  sock.checkAuth = checkAuth;
};

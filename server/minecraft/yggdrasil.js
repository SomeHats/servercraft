import 'babel-polyfill';
import http from 'axios';
import createDebug from 'debug';

let debug = createDebug('servercraft:yggdrasil');

const authserver = 'https://authserver.mojang.com';
const agent = {
  name: 'Minecraft',
  version: 1
};

export class AuthError extends Error {
  constructor({error, errorMessage}, status) {
    super(errorMessage);
    this.status = status;
    this.name = error;
  }
}

async function formatRequest(request) {
  try {
    let response = await request;
    return response.data;
  } catch(e) {
    if (e.data) {
      throw new AuthError(e.data, e.status);
    } else throw e;
  }
}

export function authenticate(username, password, clientToken) {
  debug('authenticate', {username, clientToken});
  return formatRequest(http.post(`${authserver}/authenticate`,
                                 {agent, username, password, clientToken}));
}

export function refresh(accessToken, clientToken) {
  debug('refresh', {clientToken});
  return formatRequest(http.post(`${authserver}/refresh`, {accessToken, clientToken}));
}

export async function validate(accessToken, clientToken) {
  debug('validate', {clientToken});

  try {
    let res = await formatRequest(http.post(`${authserver}/validate`, {accessToken, clientToken}));
    if (res === '') {
      return {accessToken, clientToken};
    }
  } catch(e) {
    if (e instanceof AuthError) {
      return refresh(accessToken, clientToken);
    }
    throw e;
  }
}

export async function invalidate(accessToken, clientToken) {
  debug('invalidate', {clientToken});
  let res = await formatRequest(http.post(`${authserver}/invalidate`, {accessToken, clientToken}));
  if (res === '') return true;
  return res;
}

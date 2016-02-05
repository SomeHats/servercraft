import http from 'axios';
import UserStore from '../stores/user-store';

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

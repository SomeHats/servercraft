import Reflux from 'reflux';
import http from 'axios';

const UserActions = Reflux.createActions({
  'loadUser': {asyncResult: true},
  'login': {asyncResult: true},
  'logout': {asyncResult: true}
});

UserActions.loadUser.listenAndPromise(async (reportErrors) => {
  try {
    let token = localStorage.getItem('servercraft-token');
    if (!token) throw new Error('No token saved locally.');

    let response = await http.post('/api/token', {token});
    localStorage.setItem('servercraft-token', response.data.token);

    return response.data;
  } catch (e) {
    if (reportErrors) throw e;
    throw null;
  }
});

UserActions.login.listenAndPromise(async (username, password) => {
  let response = await http.post('/api/login', {username, password});
  localStorage.setItem('servercraft-token', response.data.token);
  return response.data;
});

UserActions.logout.listenAndPromise(async (token) => {
  localStorage.clear();
  await http.post('/api/logout', {token});
  return true;
});

export default UserActions;

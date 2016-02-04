import Reflux from 'reflux';
import UserActions from '../actions/user-actions';

const formatError = error => {
  if (typeof error === 'string') return error;
  if (error && error.data && error.data.message) return error.data.message;
  if (error && error.message) return error.message;
  return 'Unknown error';
};

let UserStore = Reflux.createStore({
  listenables: UserActions,

  init() {
    this.listenTo(UserActions.loadUser, this.onLogin);
    this.listenTo(UserActions.loadUser.completed, this.onLoginCompleted);
    this.listenTo(UserActions.loadUser.failed, this.onLoginFailed);
  },

  onLogin() {
    this.trigger({loading: true, error: null});
  },

  onLoginCompleted({user, token}) {
    this.user = user;
    this.token = token;
    this.loggedIn = true;
    this.trigger({loading: false, loggedIn: true, user, token});
  },

  onLoginFailed(error) {
    this.user = null;
    this.token = null;
    this.loggedIn = false;
    this.trigger({loading: false, loggedIn: false, error: error ? formatError(error) : null});
  },

  onLogout() {
    this.user = null;
    this.token = null;
    this.loggedIn = null;
    this.trigger({loading: true, loggedIn: false, error: null, user: null, token: null});
  },

  onLogoutCompleted() {
    this.trigger({loading: false});
  },

  onLogoutFailed(error) {
    this.trigger({loading: false, error: formatError(error)});
  }
});

export default UserStore;

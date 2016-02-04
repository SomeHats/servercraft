import Reflux from 'reflux';
import UserActions from '../actions/user-actions';

let UserStore = Reflux.createStore({
  listenables: UserActions,

  init() {
    this.listenTo(UserActions.loadUser, this.onLoadUser);
    this.listenTo(UserActions.login, this.onLoadUser);
    this.listenTo(UserActions.loadUser.completed, this.onLoadUserCompleted);
    this.listenTo(UserActions.login.completed, this.onLoadUserCompleted);
    this.listenTo(UserActions.loadUser.failed, this.onLoadUserFailed);
    this.listenTo(UserActions.login.failed, this.onLoadUserFailed);
  },

  onLoadUser() {
    this.trigger({loading: true, error: null});
  },

  onLoadUserCompleted({user, token}) {
    this.user = user;
    this.token = token;
    this.loggedIn = true;
    this.trigger({loading: false, loggedIn: true, user, token});
  },

  onLoadUserFailed(error) {
    this.user = null;
    this.token = null;
    this.loggedIn = false;
    if (error && error.data && error.data.message) {
      error = error.data.message;
    } else if (error && error.message) {
      error = error.message;
    } else if (error && typeof error !== 'string') {
      error = 'Unknown error';
    }
    this.trigger({loading: false, loggedIn: false, error});
  }
});

export default UserStore;

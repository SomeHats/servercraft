import React from 'react';
import {Router, Route, hashHistory} from 'react-router';

import AppBar from './components/app-bar';
import Home from './components/home'
import SignIn from './components/sign-in';
import UserActions from './actions/user-actions';
import UserStore from './stores/user-store';

export default class Routes extends React.Component {
  constructor() {
    super();
    this.state = {user: {}};
    this.onSignOut = this.onSignOut.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = UserStore.listen(state => this.setState(state));
    UserActions.loadUser(false);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onSignOut() {
    UserActions.logout(UserStore.token);
  }

  render() {
    return (
      <div>
        <AppBar loggedIn={this.state.loggedIn} user={this.state.user} onSignOut={this.onSignOut} />
        {this.state.loggedIn ? this.renderApp() : this.renderLogin()}
      </div>
    );
  }

  renderApp() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={Home} />
      </Router>
    );
  }

  renderLogin() {
    return <SignIn />;
  }
}


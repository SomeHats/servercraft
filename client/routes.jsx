import React from 'react';
import {Router, Route, hashHistory} from 'react-router';
import UserStore from './stores/user-store';
import UserActions from './actions/user-actions';
import AppBar from './components/app-bar';
import SignIn from './components/sign-in';
import Home from './components/home'

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


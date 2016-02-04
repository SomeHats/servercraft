import React from 'react';
import {Router, Route, hashHistory} from 'react-router';
import AppBar from 'react-toolbox/lib/app_bar';
import SignIn from './components/sign-in/';
import UserStore from './stores/user-store';
import UserActions from './actions/user-actions';

export default class Routes extends React.Component {
  constructor() {
    super();
    this.state = {user: {}};
  }

  componentDidMount() {
    this.unsubscribe = UserStore.listen(state => this.setState(state));
    UserActions.loadUser(false);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div>
        <AppBar fixed>
          <h4>ServerCraft? loading: {this.state.loading + ''}, loggedIn: {this.state.loggedIn + ''}, user: {this.state.user.displayName}</h4>
        </AppBar>
        <Router history={hashHistory}>
          <Route path='/' component={SignIn} />
        </Router>
      </div>
    );
  }
}


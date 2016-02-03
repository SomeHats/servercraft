import React from 'react';
import {Router, Route, hashHistory} from 'react-router';
import AppBar from 'react-toolbox/lib/app_bar';
import SignIn from './components/sign-in/';

export default class Routes extends React.Component {
  render() {
    return (
      <div>
        <AppBar fixed>
          <h4>ServerCraft?</h4>
        </AppBar>
        <Router history={hashHistory}>
          <Route path='/' component={SignIn} />
        </Router>
      </div>
    );
  }
}


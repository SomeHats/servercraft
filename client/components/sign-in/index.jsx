import http from 'axios';
import React from 'react';

import style from './style';
import Button from 'react-toolbox/lib/button';
import {Card, CardTitle, CardText} from 'react-toolbox/lib/card';
import Input from 'react-toolbox/lib/input';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import {Page, Pages} from '../pages';

export default class SignIn extends React.Component {
  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);

    this.state = {page: 0, username: '', password: ''};
  }

  async onSubmit() {
    this.setState({page: 1, error: null});

    try {
      let response = await http.post('/api/login', {
        username: this.state.username,
        password: this.state.password
      });

      console.log(response);
    } catch(e) {
      if (e.data) {
        this.setState({error: e.data.message});
      } else {
        this.setState({error: e.message});
      }
    } finally {
      this.setState({page: 0, password: ''});
    }
  }

  onChangeUsername(username) {
    this.setState({username});
  }

  onChangePassword(password) {
    this.setState({password});
  }

  render() {
    return (
      <div className={style.root}>
        <Card className={style.card}>
          <CardTitle title='Sign In to ServerCraft' subtitle='Use your Mojang/Minecraft account'/>
          <Pages active={this.state.page}>
            {this.renderLoginForm()}
            {this.renderLoading()}
          </Pages>
        </Card>
      </div>
    );
  }

  renderErrors() {
    return (
      <CardText className={this.state.error ? style.errorActive : style.errorInactive}>
        {this.state.error}
      </CardText>
    );
  }

  renderLoginForm() {
    return (
      <Page>
        {this.renderErrors()}
        <CardText>
          <Input type='email' label='Username or E-Mail' name='username' onChange={this.onChangeUsername} value={this.state.username} />
          <Input type='password' label='Password' name='password' onChange={this.onChangePassword} value={this.state.password} />
        </CardText>
        <CardText>
          <div className={style.submit}>
            <Button onClick={this.onSubmit} label='Sign In' raised primary />
          </div>
        </CardText>
      </Page>
    );
  }

  renderLoading() {
    return (
      <Page className={style.loadingPage}>
        <ProgressBar type='circular' mode='indeterminate' />
        <h6>Signing In...</h6>
      </Page>
    );
  }
}

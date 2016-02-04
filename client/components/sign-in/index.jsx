import http from 'axios';
import React from 'react';
import style from './style';
import Button from 'react-toolbox/lib/button';
import {Card, CardTitle, CardText} from 'react-toolbox/lib/card';
import Input from 'react-toolbox/lib/input';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import {Page, Pages} from '../pages';
import UserStore from '../../stores/user-store';
import UserActions from '../../actions/user-actions';

export default class SignIn extends React.Component {
  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);

    this.state = {loading: true, username: '', password: ''};
  }

  componentDidMount() {
    this.unsubscribe = UserStore.listen(state => this.setState(state));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onSubmit() {
    this.setState({password: ''});
    UserActions.login(this.state.username, this.state.password);
  }

  onChangeUsername(username) {
    this.setState({username});
  }

  onChangePassword(password) {
    this.setState({password});
  }

  render() {
    let page = this.state.loading ? 1 : 0;

    return (
      <div className={style.root}>
        <Card className={style.card}>
          <CardTitle title='Sign In to ServerCraft' subtitle='Use your Mojang/Minecraft account'/>
          <Pages active={page}>
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
      </Page>
    );
  }
}

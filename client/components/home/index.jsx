import React from 'react';

import Button from 'react-toolbox/lib/button';
import styles from './style';
import NewWorld from '../new-world';

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = {creatingNew: false};
  }

  render() {
    return (
      <div className={styles.root}>
        <Button raised label="New World" onClick={() => this.setState({creatingNew: true})} />
        <NewWorld active={this.state.creatingNew} onClose={() => this.setState({creatingNew: false})} />
      </div>
    );
  }
}

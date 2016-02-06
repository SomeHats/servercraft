import React from 'react';
import _ from 'lodash';

import WorldActions from '../../actions/world-actions';
import WorldStore from '../../stores/world-store';
import Button from 'react-toolbox/lib/button';
import styles from './style';
import NewWorld from '../new-world';
import WorldCard from '../world-card';

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = {creatingNew: false, worlds: WorldStore.worlds};
  }

  componentDidMount() {
    this.unsubscribe = WorldStore.listen((update) => this.setState(update));
    WorldActions.load();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div className={styles.root}>
        <Button raised label="New World" onClick={() => this.setState({creatingNew: true})} />
        <NewWorld active={this.state.creatingNew} onClose={() => this.setState({creatingNew: false})} />
        <div className={styles.worlds}>
          {_(this.state.worlds)
            .orderBy('updatedAt', 'desc')
            .map((world) => <WorldCard world={world} />)
            .value()}
        </div>
      </div>
    );
  }
}

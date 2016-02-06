import React from 'react';
import {Card, CardTitle, CardText} from 'react-toolbox/lib/card';
import styles from './style';

export default class WorldCard extends React.Component {
  render() {
    let world = this.props.world;

    return (
      <Card className={styles.root}>
        <CardTitle title={world.name} subtitle={world.message} />
        <CardText>
          <pre>{JSON.stringify(world, null, 2)}</pre>
        </CardText>
      </Card>
    );
  }
}

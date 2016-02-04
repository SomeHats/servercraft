import React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import Navigation from 'react-toolbox/lib/navigation';
import Button from 'react-toolbox/lib/button';
import styles from './style';

export default ({user, loggedIn, onSignOut}) => {
  let userDetails;
  if (loggedIn) {
    userDetails = (
      <div className={styles.userDetails}>
        <Navigation key='nav'>
          <span className={styles.username}>{user.displayName}</span>
          <Button label='Sign Out' raised accent onClick={onSignOut} />
        </Navigation>
      </div>
    );
  } else {
    userDetails = <div className={styles.userDetails}></div>
  }

  return (
    <AppBar fixed>
      <h4>ServerCraft?</h4>
      {userDetails}
    </AppBar>
  );
};

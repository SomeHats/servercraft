import React from 'react';
import style from './style';

export class Pages extends React.Component {
  render() {
    return (
      <div className={style.root}>
        <div className={style.slider} style={{transform: `translateX(-${this.props.active}00%)`}}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export class Page extends React.Component {
  render() {
    return (
      <div className={`${style.page} ${this.props.className}`}>
        {this.props.children}
      </div>
    );
  }
}

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

if (module.hot) module.hot.accept();

import Routes from './routes.jsx';

window.addEventListener('load', () => {
  Array.from(document.querySelectorAll('.no-js')).forEach((el) => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  ReactDOM.render(React.createElement(Routes), document.getElementById('app'));
});


import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';

if (module.hot) module.hot.accept();

import Routes from './routes';

if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    Array.from(document.querySelectorAll('.no-js')).forEach((el) => {
      if (el.parentElement) el.parentElement.removeChild(el);
    });

    ReactDOM.render(React.createElement(Routes), document.getElementById('app'));
  });
}

export default (locals, callback) => {
  let template = locals.webpackStats.compilation.assets['index-template.html'].source();
  let html = ReactDOMServer.renderToString(React.createElement(Routes));
  callback(null, template.replace('{{app}}', html));
};

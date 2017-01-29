import 'babel-polyfill'

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

import Home from './components/Home.jsx';
import Login from './components/Login.jsx';

render((
  <Router history={browserHistory}>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
  </Router>
), document.querySelector("#app"))

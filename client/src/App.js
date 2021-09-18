import React, {useState} from "react";

import './App.css';
import 'antd/dist/antd.css';
import {
  BrowserRouter as Router,
  Switch,
  NavLink,
  Route
} from "react-router-dom";

import Home from "./pages/Home/Home";
import Image from "./HTNLogo.png";

function App() {
  return (
    <Router>
      <ul className="navbar">
        <li id="logo">
          <NavLink exact to="/" className="link" activeClassName="activeLink"><img src={Image} alt="Logo"/> Home</NavLink>
        </li>
      </ul>
        
      <Switch>
        <Route exact path="/">
          <Home/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

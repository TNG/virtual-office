import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";

import * as serviceWorker from "./serviceWorker";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

import "./index.css";
import theme from "./theme";

document.title = process.env.REACT_APP_TITLE || "Virtual Office";

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/login">
          <Login />
        </Route>
      </Switch>
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

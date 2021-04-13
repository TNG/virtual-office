import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import * as serviceWorker from "./serviceWorker";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

import "./index.css";
import theme from "./theme";
import axios from "axios";
import { ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject } from "@apollo/client";

// Initialize ApolloClient
const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache: new InMemoryCache({
    possibleTypes: {
      Block: ["GroupBlock", "ScheduleBlock", "SessionBlock"],
      Session: ["GroupSession", "RoomSession"],
    },
  }),
  uri: "http://localhost:9000/graphql",
  connectToDevTools: true,
});

axios.get("/api/clientConfig").then(({ data }) => {
  document.title = data.title ?? "Virtual Office";
  ReactDOM.render(
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme(data)}>
          <CssBaseline />
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/login">
              <Login />
            </Route>
          </Switch>
        </ThemeProvider>
      </BrowserRouter>
    </ApolloProvider>,
    document.getElementById("root")
  );
});

if ((import.meta as any).hot) {
  (import.meta as any).hot.accept();
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

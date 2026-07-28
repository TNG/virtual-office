import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";

import * as serviceWorker from "./serviceWorker";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

import "./index.css";
import theme from "./theme";
import axios from "axios";

axios.get("/api/clientConfig").then(({ data }) => {
  document.title = data.title ?? "Virtual Office";
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <BrowserRouter>
      <ThemeProvider theme={theme(data)}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

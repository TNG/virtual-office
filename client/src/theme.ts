import { createMuiTheme } from "@material-ui/core";
import { ClientConfig } from "../../server/express/types/ClientConfig";

const theme = (config: ClientConfig) =>
  createMuiTheme({
    breakpoints: {
      values: {
        xs: 320,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1920,
      },
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
      h5: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    palette: palettes[config.theme] || palettes.dark,
  });

const palettes = {
  light: {
    primary: {
      main: "#a4a9b1",
      light: "#2d8acd",
      contrastText: "#2c6aa8",
    },
    secondary: {
      main: "#2d8cff",
      light: "#e5f1ff",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
    },
  },
  dark: {
    primary: {
      main: "#323232",
      light: "#ffe842",
      contrastText: "#ffed3b",
    },
    secondary: {
      main: "#2d8cff",
      light: "#e5f1ff",
      contrastText: "#ffffff",
    },
    background: {
      default: "#323232",
    },
  },
};

export default theme;

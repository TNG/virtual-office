import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
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
  palette: {
    primary: {
      main: "#323232",
      light: "rgba(255,232,66,0.6)",
      contrastText: "#ffed3b",
    },
    secondary: {
      main: "#2d8cff",
      light: "#e5f1ff",
      contrastText: "#ffffff",
    },
  },
});

export default theme;

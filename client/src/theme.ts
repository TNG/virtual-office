import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";

let theme = createMuiTheme({
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
    fontFamily: "Roboto",
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
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;

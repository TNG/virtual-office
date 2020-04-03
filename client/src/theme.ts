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
    fontFamily: "Roboto",
  },
  palette: {
    primary: {
      main: "#323232",
      contrastText: "#ffed3b",
    },
    secondary: {
      main: "#2d8cff",
      contrastText: "#2e2e2e",
    },
  },
});

export default theme;

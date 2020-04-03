import { createMuiTheme } from "@material-ui/core";

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const breakpoints: BreakpointConfig = {
  xs: 320,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1920,
};

const theme = createMuiTheme({
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
  breakpoints: {
    values: breakpoints,
  },
});

export default theme;

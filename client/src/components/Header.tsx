import { Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box/Box";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("md")]: {
      flexWrap: "wrap",
      flexDirection: "column",
    },
  },
}));

export const Header = () => {
  const classes = useStyles();

  return (
    <Box>
      <Box className={classes.container}>
        <Box padding={1} flex="1">
          <a target="_blank" href="https://bigtechday.com" rel="noopener noreferrer">
            <img alt="TNG Logo" width="300" src="/images/tng.png" />
          </a>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h3">Virtual Big Techday 13</Typography>
          <Box paddingTop={1}>
            <Typography variant="h4">Live-Programm</Typography>
          </Box>
        </Box>
        <Box flex="1" />
      </Box>
      <Box display="flex" justifyContent="center" marginTop={2}>
        <img alt="Super Collider" width="100%" src="/images/BTD7_SuperCollider.jpg" />
      </Box>
    </Box>
  );
};

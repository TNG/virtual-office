import React from "react";
import { AppBar as MaterialAppBar, IconButton, Toolbar, Typography } from "@material-ui/core";
import LocalCafeIcon from "@material-ui/icons/LocalCafe";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  menuButton: {
    marginRight: 4,
  },
  title: {
    flexGrow: 1,
  },
});

const AppBar = () => {
  const classes = useStyles();

  return (
    <MaterialAppBar position="fixed">
      <Toolbar>
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <LocalCafeIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Virtual Office
        </Typography>
      </Toolbar>
    </MaterialAppBar>
  );
};

export default AppBar;

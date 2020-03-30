import {
  AppBar as MaterialAppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import LocalCafeIcon from "@material-ui/icons/LocalCafe";
import { makeStyles } from "@material-ui/styles";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { User } from "../../../server/express/types/User";

const useStyles = makeStyles((theme: Theme) => ({
  menuButton: {
    marginRight: 4,
  },
  title: {
    flexGrow: 1,
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
}));

const AppBar = () => {
  const classes = useStyles();

  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    axios.get("/api/me").then(({ data }) => setUser(data));
  }, []);

  const logout = () => {
    window.location.href = "/logout";
  };

  return (
    <MaterialAppBar position="fixed">
      <Toolbar>
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <LocalCafeIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Virtual Office
        </Typography>
        {user && (
          <Box display="flex" alignItems="center">
            <Box px={1}>
              <Avatar src={user.imageUrl} className={classes.avatar} />
            </Box>
            <Button color="inherit" onClick={() => logout()}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </MaterialAppBar>
  );
};

export default AppBar;

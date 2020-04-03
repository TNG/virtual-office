import React, { useEffect, useState } from "react";
import axios from "axios";

import { User } from "../../../server/express/types/User";
import {
  AppBar as MaterialAppBar,
  Avatar,
  Box,
  Button,
  fade,
  IconButton,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import LocalCafeIcon from "@material-ui/icons/LocalCafe";
import { makeStyles } from "@material-ui/styles";
import SearchInput from "./SearchInput";

const useStyles = makeStyles((theme: Theme) => ({
  menuButton: {
    marginRight: 4,
  },
  title: {
    flex: "1 0 auto",
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export interface Props {
  onSearchTextChange: (searchText: string) => void;
}

const AppBar = (props: Props) => {
  const classes = useStyles();

  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    axios.get("/api/me").then(({ data }) => setUser(data));
  }, []);

  return (
    <MaterialAppBar position="fixed">
      <Toolbar>
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <LocalCafeIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Virtual Office
        </Typography>
        <SearchInput onSearchTextChange={props.onSearchTextChange} drawBorder={false} />
        {user && (
          <Box display="flex" alignItems="center">
            <Box px={1}>
              <Avatar src={user.imageUrl} className={classes.avatar} />
            </Box>
            <Button color="inherit" href="/logout">
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </MaterialAppBar>
  );
};

export default AppBar;

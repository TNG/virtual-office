import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/styles";

import {
  AppBar as MaterialAppBar,
  Avatar,
  Box,
  fade,
  IconButton,
  Menu,
  MenuItem,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import LocalCafeIcon from "@material-ui/icons/LocalCafe";

import { User } from "../../../server/express/types/User";
import SearchInput from "./SearchInput";
import RoomDialog from "./RoomDialog";

const useStyles = makeStyles((theme: Theme) => ({
  coffee: {
    margin: 0,
  },
  title: {
    flex: "1 0 auto",
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  avatar: {
    cursor: "pointer",
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginLeft: 12,
  },
  search: {
    position: "relative",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "auto",
    },
    marginLeft: 8,
    marginRight: 8,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
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
  menuItem: {
    width: 240,
  },
}));

const AppBar = (props: { onSearchTextChange: (searchText: string) => void }) => {
  const classes = useStyles();

  const [user, setUser] = useState<User | undefined>(undefined);
  useEffect(() => {
    axios.get("/api/me").then(({ data }) => setUser(data));
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  function handleAddRoom() {
    setMenuOpen(false);
    setDialogOpen(true);
  }

  function handleLogout() {
    window.location.href = "/logout";
  }

  return (
    <MaterialAppBar position="fixed">
      <Toolbar>
        <IconButton className={classes.coffee} aria-label="home" edge="start" color="inherit">
          <LocalCafeIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Virtual Office
        </Typography>
        <SearchInput onSearchTextChange={props.onSearchTextChange} drawBorder={false} />
        {user && (
          <Box display="flex" alignItems="center">
            <Avatar
              className={classes.avatar}
              aria-controls="user-menu"
              aria-haspopup="true"
              ref={menuRef}
              src={user.imageUrl}
              onClick={() => setMenuOpen(true)}
            />

            <Menu
              id="user-menu"
              anchorEl={menuRef.current}
              keepMounted
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
            >
              <MenuItem className={classes.menuItem} onClick={handleAddRoom}>
                Add Room
              </MenuItem>
              <MenuItem className={classes.menuItem} onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>

            <RoomDialog open={dialogOpen} setOpen={setDialogOpen} />
          </Box>
        )}
      </Toolbar>
    </MaterialAppBar>
  );
};

export default AppBar;

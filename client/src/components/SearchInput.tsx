import SearchIcon from "@material-ui/icons/Search";
import { fade, InputBase, Theme } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import { debounce } from "lodash";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    border: `1px ${theme.palette.primary.main} solid`,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
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

const SearchInput = (props: { onSearchTextChange: (text: string) => void; drawBorder: boolean }) => {
  const classes = useStyles();
  const searchDebounced = debounce(props.onSearchTextChange, 300);

  return (
    <div className={classes.root}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>

      <InputBase
        placeholder="Search…"
        onChange={(event) => searchDebounced(event.target.value)}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{ "aria-label": "search" }}
      />
    </div>
  );
};

export default SearchInput;

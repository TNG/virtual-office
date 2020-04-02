import React from "react";
import { IconButton } from "@material-ui/core";
import AddBoxIcon from "@material-ui/icons/AddBox";
import { makeStyles } from "@material-ui/styles";
import theme from "../theme";
import Dialog from "./Dialog";

const useStyles = makeStyles<typeof theme>((_) => ({
  addButton: {
    float: "right",
    marginRight: 4,
  },
}));

const RoomCreation = () => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  return (
    <React.Fragment>
      <IconButton
        edge="end"
        className={classes.addButton}
        color="secondary"
        aria-label="create"
        onClick={() => setOpen(true)}
      >
        <AddBoxIcon />
      </IconButton>

      <Dialog open={open} setOpen={setOpen} title="Add Room">
        Coming soon
      </Dialog>
    </React.Fragment>
  );
};

export default RoomCreation;

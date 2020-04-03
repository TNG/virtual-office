import React from "react";
import { Card, CardContent, CardHeader, Modal, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/styles";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>((theme) => ({
  dialog: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    width: "100%",
    height: "100%",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    borderRadius: 0,
    [theme.breakpoints.up("sm")]: {
      width: "90%",
      height: "85%",
      top: "10%",
      right: "5%",
      left: "5%",
      bottom: "5%",
      borderRadius: 4,
    },
    outline: "none",
  },
  dialogAction: {
    margin: 0,
    cursor: "pointer",
  },
  dialogHeader: {
    flex: "0 0 auto",
  },
  dialogContent: {
    flex: "1 1 auto",
    overflowY: "auto",
  },
}));

const Dialog = ({
  open,
  setOpen,
  title,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: any;
}) => {
  const classes = useStyles();

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <Card className={classes.dialog}>
        <CardHeader
          className={classes.dialogHeader}
          title={<Typography variant="h5">{title}</Typography>}
          action={<CloseIcon color="action" fontSize="default" onClick={() => setOpen(false)} />}
          classes={{ action: classes.dialogAction }}
        />

        <CardContent className={classes.dialogContent}>{children}</CardContent>
      </Card>
    </Modal>
  );
};

export default Dialog;

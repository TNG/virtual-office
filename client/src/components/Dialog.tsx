import React, { MouseEvent } from "react";
import { makeStyles } from "@material-ui/styles";

import { Box, Button, Card, CardActions, CardContent, CardHeader, Modal, Theme, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import SearchInput from "./SearchInput";

type Variant = "big" | "small";

const useStyles = (variant: Variant) =>
  makeStyles<Theme>((theme) => ({
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
        minWidth: theme.breakpoints.width("sm"),
        maxWidth: theme.breakpoints.width(variant === "big" ? "lg" : "md"),
        width: variant === "big" ? "90%" : "45%",
        height: variant === "big" ? "80%" : "fit-content",
        top: "10%",
        left: "50%",
        transform: "translate(-50%,0)",
        borderRadius: 4,
      },
      outline: "none",
    },
    dialogAction: {
      margin: 0,
      marginLeft: 12,
      marginTop: 8,
      cursor: "pointer",
    },
    dialogHeader: {
      flex: "0 0 auto",
    },
    dialogContent: {
      flex: "1 1 auto",
      overflowY: "auto",
    },
    dialogActions: {
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
      padding: 16,
    },
    cardHeader: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardCaption: {
      flex: "0 0 auto",
      marginRight: 8,
    },
    cardSearch: {
      flex: "0 1 auto",
      marginLeft: 8,
    },
  }));

const Dialog = (props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  variant: Variant;
  children?: any;
  handleOk?: (event: MouseEvent) => void;
  handleCancel?: (event: MouseEvent) => void;
  handleSearch?: (searchText: string) => void;
}) => {
  const classes = useStyles(props.variant)();

  function renderHeader() {
    return (
      <Box className={classes.cardHeader}>
        <Typography variant="h5" className={classes.cardCaption}>
          {props.title}
        </Typography>

        {props.handleSearch && (
          <Box className={classes.cardSearch}>
            <SearchInput onSearchTextChange={props.handleSearch} drawBorder={true} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Modal
      open={props.open}
      onClose={() => props.setOpen(false)}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <Card className={classes.dialog}>
        <CardHeader
          className={classes.dialogHeader}
          title={renderHeader()}
          action={<CloseIcon color="action" fontSize="default" onClick={() => props.setOpen(false)} />}
          classes={{ action: classes.dialogAction }}
        />

        <CardContent className={classes.dialogContent}>{props.children}</CardContent>
        <CardActions className={classes.dialogActions}>
          {props.handleCancel && (
            <Button color="secondary" onClick={props.handleCancel}>
              Cancel
            </Button>
          )}
          {props.handleOk && (
            <Button color="secondary" variant="contained" type="submit" onClick={props.handleOk}>
              Ok
            </Button>
          )}
        </CardActions>
      </Card>
    </Modal>
  );
};

export default Dialog;

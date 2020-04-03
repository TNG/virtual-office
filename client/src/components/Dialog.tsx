import React from "react";
import { Box, Card, CardContent, CardHeader, Modal, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/styles";
import theme from "../theme";
import SearchInput from "./SearchInput";

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
    marginLeft: 8,
    cursor: "pointer",
  },
  dialogHeader: {
    flex: "0 0 auto",
  },
  dialogContent: {
    flex: "1 1 auto",
    overflowY: "auto",
  },
  cardHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  cardCaption: {
    flex: "0 0 auto",
  },
  cardSearch: {
    flex: "1 1 auto",
    marginLeft: 8,
  },
}));

const Dialog = ({
  open,
  setOpen,
  title,
  children,
  handleSearch,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: any;
  handleSearch?: (searchText: string) => void;
}) => {
  const classes = useStyles();

  function renderHeader() {
    const caption = (
      <Typography variant="h5" className={classes.cardCaption}>
        {title}
      </Typography>
    );
    const action = handleSearch && (
      <Box className={classes.cardSearch}>
        <SearchInput onSearchTextChange={handleSearch} drawBorder={true} />
      </Box>
    );

    return (
      <Box className={classes.cardHeader}>
        {caption}
        {action}
      </Box>
    );
  }

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
          title={renderHeader()}
          action={<CloseIcon color="action" fontSize="default" onClick={() => setOpen(false)} />}
          classes={{ action: classes.dialogAction }}
        />

        <CardContent className={classes.dialogContent}>{children}</CardContent>
      </Card>
    </Modal>
  );
};

export default Dialog;
